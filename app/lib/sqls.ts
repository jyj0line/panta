'use server'
import { revalidatePath } from 'next/cache';
import { AuthError } from 'next-auth';
import { neon } from '@neondatabase/serverless';
import { z } from "zod";

import type { User } from 'next-auth';
import { signIn, auth, signOut } from '@/auth';
import type { ChunkedResponseType } from '@/app/lib/hooks';
import { getUserId } from '@/app/lib/utils';
import { COMMON, USER, BOOK, PAGE, TAG } from '@/app/lib/constants';

// neon connection
const getDatabaseConnection = async () => {
    'use server';
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set.');
    }
    return neon(process.env.DATABASE_URL);
};
const sql = await getDatabaseConnection();

// common constants
const { LIMIT_MAX } = COMMON; 

// common schemas
const NaturalNumberSchema = z.number().int().min(1, { message: 'Please enter an natural number.' });
const NonnegativeNumberSchema = z.number().int().nonnegative({ message: 'Please enter an nonnegative number.' });
const OrderCriteriaSchema = z.enum(['rank', 'created_at'], { invalid_type_error: 'Please select an order critic.' });
export type OrderCriteriaType = z.infer<typeof OrderCriteriaSchema>



// authentification
export const authenticate = async (
  prevState: string | undefined,
  formData: FormData,
) => {
  "use server"
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export const signout = async (): Promise<void> => {
  "use server"
  await signOut({ redirectTo: '/' });
}

export const getUser = async (): Promise<User | undefined> => {
  'use server'
  const session = await auth();
  return session?.user;
}

// tables

// users table
const {USER_ID_MIN, USER_ID_MAX, USER_HASHED_PASSWORD_LENGTH} = USER;
const UserSchema = z.object({
  user_id: z.string().min(USER_ID_MIN).max(USER_ID_MAX),
  hashed_password: z.string().length(USER_HASHED_PASSWORD_LENGTH),
  created_at: z.date() // default current_timestamp
});
export type UserType = z.infer<typeof UserSchema>;

// books table
const { BOOK_TITLE_MIN, BOOK_TITLE_MAX } = BOOK;
const BookSchema = z.object({
  book_id: z.string().uuid({message: 'Please select a book.'}),
  user_id: UserSchema.shape.user_id,
  book_title: z.string()
    .min(BOOK_TITLE_MIN, { message: `Please enter a title that is ${BOOK_TITLE_MIN} or more in length.` })
    .max(BOOK_TITLE_MAX, { message: `Please enter a title that is ${BOOK_TITLE_MAX} or less in length.` }),
  created_at: z.date() // default current_timestamp
});
export type BookType = z.infer<typeof BookSchema>

// pages table
const {
  PAGE_TITLE_MIN, PAGE_TITLE_MAX,
  PAGE_PREVIEW_MAX,
  PAGE_CONTENT_MAX,
  PAGE_VIEW_MIN, PAGE_VIEW_MAX,
  PAGE_LIKE_MIN, PAGE_LIKE_MAX
} = PAGE;
const PageSchema = z.object({
  page_id: z.string().uuid(),
  user_id: UserSchema.shape.user_id,
  book_id: BookSchema.shape.book_id.nullable(),

  title: z.string()
    .min(PAGE_TITLE_MIN, { message: `Please enter a title that is ${PAGE_TITLE_MIN} or more in length.` })
    .max(PAGE_TITLE_MAX, { message: `Please enter a title that is ${PAGE_TITLE_MAX} or less in length.` }),
  preview: z.string()
    .max(PAGE_PREVIEW_MAX, { message: `Please enter a title that is ${PAGE_PREVIEW_MAX} or less in length.` }),
  content: z.string()
    .max(PAGE_CONTENT_MAX, { message: `Please enter a title that is ${PAGE_PREVIEW_MAX} or less in length.` }),

  view: z.number().int().min(PAGE_VIEW_MIN).max(PAGE_VIEW_MAX), // default 0
  like: z.number().int().min(PAGE_LIKE_MIN).max(PAGE_LIKE_MAX), // default 0

  created_at: z.date() // default current_timestamp
});
export type PageType = z.infer<typeof PageSchema>;

// tags table
const { TAG_ID_MIN, TAG_ID_MAX, TAG_ID_NUM_MAX } = TAG; // TAG_ID_NUM_MAX is not on the database
const TagSchema = z.object({
  tag_id: z.string()
    .trim()
    .min(TAG_ID_MIN, { message: "Tags cannot be empty" })
    .max(TAG_ID_MAX, { message: `Tag is too long (max ${TAG_ID_MAX} characters)` })
});
export type TagType = z.infer<typeof TagSchema>;
const TagsSchema = z.object({ // not on the database
  tag_ids: z.array(TagSchema.shape.tag_id).max(TAG_ID_NUM_MAX, { message: `Maximum ${TAG_ID_NUM_MAX} tags allowed` })
})
export type TagsType = z.infer<typeof TagsSchema>;

// pages_tags table
const PageTagSchema = z.object({
  page_id: PageSchema.shape.page_id,
  tag_id: TagSchema.shape.tag_id 
});
export type PageTageType = z.infer<typeof PageTagSchema>;




// chunkedRequest
const ChunkedRequestSchema = z.object({
  chunk: NaturalNumberSchema,
  limit: NaturalNumberSchema.max(LIMIT_MAX),
})
export type ChunkedRequestType = z.infer<typeof ChunkedRequestSchema>;

//card
const CardSchema = z.object({
  ...PageSchema.pick({
    page_id: true,
    user_id: true,

    title: true,
    preview: true,

    view: true,
    like: true,
    created_at: true,
  }).shape,
});
export type CardType = z.infer<typeof CardSchema>;
export const sqlSelectCards = async (chunkedRequest: ChunkedRequestType): Promise<ChunkedResponseType<CardType | null>> => {
  'use server';
  try {
    const {chunk: validatedChunk, limit: validatedLimit} = ChunkedRequestSchema.parse(chunkedRequest)
    const validatedOffset = NonnegativeNumberSchema.parse((validatedChunk - 1) * validatedLimit);
    
    const cards = await sql`
      SELECT page_id, user_id, title, preview, view, "like", created_at
      FROM pages
      ORDER BY view DESC, page_id DESC
      OFFSET ${validatedOffset}
      LIMIT ${validatedLimit}
    `;
    
    const validatedCards = cards.map(card => {
      const validatedCard = CardSchema.safeParse(card);
      if (validatedCard.success) return validatedCard.data;
      return null;
    });

    return {
      items: validatedCards,
      hasNextChunk: validatedCards.length === validatedLimit
    };
  } catch (error) {
    console.error('Failed to fetch cards', error);
    throw new Error('Failed to fetch cards');
  }
};

//search
const SearchedParamsSchema = z.object({
  user_ids: z.array(UserSchema.shape.user_id).optional(),

  search: PageSchema.shape.content.optional(),

  tag_ids: TagsSchema.shape.tag_ids.optional(),

  created_at_from: PageSchema.shape.created_at.optional(),
  created_at_to: PageSchema.shape.created_at.optional(),

  orderCritic: OrderCriteriaSchema.default("rank")
});
export type SearchedParamsType = z.infer<typeof SearchedParamsSchema>;
const ChunkedRequestWithSearchParamsSchema = ChunkedRequestSchema.merge(SearchedParamsSchema);
type ChunkedRequestWithSearchParamsType = z.infer<typeof ChunkedRequestWithSearchParamsSchema>;
const SearchResultSchema = z.object({
  ...PageSchema.pick({
    page_id: true,
    user_id: true,

    title: true,
    preview: true,

    view: true,
    like: true,
    created_at: true,
  }).shape,
  tag_ids: z.array(TagSchema.shape.tag_id)
});
export type SearchResultType = z.infer<typeof SearchResultSchema>;

//simple search
export const sqlSelectSimpleSearch = async (chunkedRequestWithSearchParams: ChunkedRequestWithSearchParamsType)
: Promise<ChunkedResponseType<SearchResultType | null>>=> {
  'use server'
  try {
    const {search, orderCritic, chunk, limit} = ChunkedRequestWithSearchParamsSchema.parse(chunkedRequestWithSearchParams)
    const offset = NonnegativeNumberSchema.parse((chunk - 1) * limit);
    
    if (!search) throw new Error();

    const simpleSearchResults = orderCritic === 'rank'
      ? await sql`
        WITH filtered_pages AS (
          SELECT p.page_id, p.user_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at,
            COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids,
            ts_rank(p.full_text_search, websearch_to_tsquery(${search})) AS rank
          FROM pages p
          WHERE p.full_text_search @@ websearch_to_tsquery(${search})
          ORDER BY rank DESC, p.page_id
        )
        SELECT COUNT(*)::int AS total_count,
          COALESCE(
            (SELECT json_agg(result)
              FROM (
                SELECT page_id, user_id, title, preview, view, "like", created_at, tag_ids
                FROM filtered_pages
                OFFSET ${offset}
                LIMIT ${limit}
              ) result
            ),
            '[]'::json
          ) AS results
        FROM filtered_pages
      `
      : await sql`
        WITH filtered_pages AS (
          SELECT p.page_id, p.user_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at,
            COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
          FROM pages p
          WHERE p.full_text_search @@ websearch_to_tsquery(${search})
          ORDER BY p.created_at DESC, p.page_id
        )
        SELECT COUNT(*)::int AS total_count, 
          COALESCE(
            (SELECT json_agg(result)
              FROM (
                SELECT *
                FROM filtered_pages
                OFFSET ${offset}
                LIMIT ${limit}
              ) result
            ),
            '[]'::json
          ) AS results
        FROM filtered_pages
      `;

    const totalCount = simpleSearchResults[0].total_count;
    const results = simpleSearchResults[0].results

    const validatedTotalCount = NonnegativeNumberSchema.parse(totalCount);
    const validatedSimpleSearchResults = results.map((result: SearchResultType)=> {
      result.created_at = new Date(result.created_at);
      const validatedSimpleSearchResult = SearchResultSchema.safeParse(result);
    
      if (validatedSimpleSearchResult.success) return validatedSimpleSearchResult.data
      return null;
    })

    return {
      items: validatedSimpleSearchResults,
      hasNextChunk: validatedSimpleSearchResults.length === limit,
      totalCount: validatedTotalCount
    };
  } catch (error) {
    console.error('Failed to fetch search results', error);
    throw new Error('Failed to fetch search results');
  }
}

export const sqlSelectDetailedSearch = async (chunkedRequestWithSearchParams: ChunkedRequestWithSearchParamsType)
: Promise<ChunkedResponseType<SearchResultType | null>>=> {
  'use server'

  try {
    const {user_ids, search, tag_ids, created_at_from, created_at_to, orderCritic, chunk, limit} = ChunkedRequestWithSearchParamsSchema.parse(chunkedRequestWithSearchParams)
    const offset = NonnegativeNumberSchema.parse((chunk - 1) * limit);

    if ((!user_ids || user_ids.length <= 0)
      && !search
      && (!tag_ids || tag_ids?.length <= 0)
      && !created_at_from
      && !created_at_to) throw new Error();
    
    const simpleSearchResults = orderCritic === 'rank'
      ? await sql`
      WITH filtered_pages AS (
        SELECT p.page_id, p.user_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at,
          COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids,
          ts_rank(p.full_text_search, websearch_to_tsquery(${search})) AS rank
        FROM pages p
        WHERE 
          (${!user_ids || user_ids.length <= 0} OR p.user_id = ANY(${user_ids}::TEXT[]))
          AND (${!search} OR p.full_text_search @@ websearch_to_tsquery(${search}))
          AND (${!tag_ids || tag_ids?.length <= 0} OR EXISTS (
            SELECT 1 FROM pages_tags pt WHERE pt.page_id = p.page_id AND pt.tag_id = ANY(${tag_ids}::TEXT[])
          ))
          AND (${!created_at_from} OR p.created_at >= ${created_at_from})
          AND (${!created_at_to} OR p.created_at <= ${created_at_to})
        ORDER BY rank DESC, p.page_id
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT page_id, user_id, title, preview, view, "like", created_at, tag_ids
              FROM filtered_pages
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM filtered_pages
    `
      : await sql`
      WITH filtered_pages AS (
        SELECT p.page_id, p.user_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at,
          COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
        FROM pages p
        WHERE 
          (${!user_ids || user_ids.length <= 0} OR p.user_id = ANY(${user_ids}::TEXT[]))
          AND (${!search} OR p.full_text_search @@ websearch_to_tsquery(${search}))
          AND (${!tag_ids || tag_ids?.length <= 0} OR EXISTS (
            SELECT 1 FROM pages_tags pt WHERE pt.page_id = p.page_id AND pt.tag_id = ANY(${tag_ids}::TEXT[])
          ))
          AND (${!created_at_from} OR p.created_at >= ${created_at_from})
          AND (${!created_at_to} OR p.created_at <= ${created_at_to})
        ORDER BY p.created_at DESC, p.page_id
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT *
              FROM filtered_pages
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM filtered_pages
    `
    const totalCount = simpleSearchResults[0].total_count;
    const results = simpleSearchResults[0].results

    const validatedTotalCount = NonnegativeNumberSchema.parse(totalCount);
    const validatedSimpleSearchResults = results.map((result: SearchResultType)=> {
      result.created_at = new Date(result.created_at);
      const validatedSimpleSearchResult = SearchResultSchema.safeParse(result);
    
      if (validatedSimpleSearchResult.success) return validatedSimpleSearchResult.data
      return null;
    })

    return {
      items: validatedSimpleSearchResults,
      hasNextChunk: validatedSimpleSearchResults.length === limit,
      totalCount: validatedTotalCount
    };
  } catch (error) {
    console.error('Failed to fetch search results', error);
    throw new Error('Failed to fetch search results');
  }
}





// write
export type WriteFormStateType = {
  success?: boolean;
  message?: string;
  errors?: {
    title?: string[];
    preview?: string[];
    tag_ids?: string[];
    content?: string[];
    book_id?: string[];
  };
  page_id?: PageType["page_id"]
};

const SelectedWriteFormPageSchema = z.object({
  ...PageSchema.pick({
    user_id: true,

    page_id: true,
    title: true,
    preview: true,
    content: true,

    book_id: true,
  }).shape,
  tag_ids: TagsSchema.shape.tag_ids
});
export type SelectedWriteFormPageType = z.infer<typeof SelectedWriteFormPageSchema>;
export const sqlSelectWriteFormPage = async (pageId: PageType["page_id"]): Promise<SelectedWriteFormPageType> => {
  'use server';
  try {
    const userId = getUserId();
    if (!userId) throw new Error("Unauthorized");

    const page = await sql`
      SELECT user_id, page_id, title, preview, content, book_id,
        COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = pages.page_id), ARRAY[]::TEXT[]) AS tag_ids
      FROM pages
      WHERE page_id = ${pageId} AND user_id = ${userId}
    `;

    if (page.length !== 1) {
      throw new Error("can't find the write page");
    }

    return SelectedWriteFormPageSchema.parse({...page[0]});
  } catch (error) {
    console.error('Failed to fetch the write page', error);
    throw new Error('Failed to fetch the write page');
  }
};

const SelectWriteFormBooksSchema = z.array(BookSchema.pick({ user_id: true, book_id: true, book_title: true }))
export type SelectWriteFormBooksType = z.infer<typeof SelectWriteFormBooksSchema>;    
export const sqlSelectWriteFormBooks = async (): Promise<SelectWriteFormBooksType> => {
  'use server';
  try {
    const userId = getUserId();
    if (!userId) throw new Error("Unauthorized");

    const books = await sql`
      SELECT user_id, book_id, book_title
      FROM books
      WHERE user_id = ${userId}
    `;

    return SelectWriteFormBooksSchema.parse(books);
  } catch (error) {
    console.error('Failed to fetch the write books', error);
    throw new Error('Failed to fetch the write books');
  }
}

const parseTagIds = (tagIdsString: string): string[] => {
  try {
    const parsed = JSON.parse(tagIdsString);
    return Array.isArray(parsed) ? parsed.filter(tag => typeof tag === 'string') : [];
  } catch (error) {
    console.error('Failed to parse the tag ids.', error);
    return [];
  }
}
const TagIdsSchema = z.string()
  .transform(parseTagIds)
  .pipe(TagsSchema.shape.tag_ids);
const BookIdSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  SelectedWriteFormPageSchema.shape.book_id
)
const CreatePageFromWriteFormSchema = z.object({
  ...SelectedWriteFormPageSchema.pick({user_id: true, title: true, preview: true, content: true}).shape,
  tag_ids: TagIdsSchema,
  book_id: BookIdSchema
});
export type CreatePageFromWriteFormType = z.infer<typeof CreatePageFromWriteFormSchema>;
export const sqlCreatePageFromWriteForm = async (auth: unknown, prevState: WriteFormStateType, formData: FormData): Promise<WriteFormStateType> => {
  'use server'
  try{
    const validatedFormData = CreatePageFromWriteFormSchema.safeParse({
      user_id: getUserId(),

      title: formData.get('title'),
      preview: formData.get('preview'),
      tag_ids: formData.get('tag_ids'),
      content: formData.get('content'),

      book_id: formData.get('book_id')
    });

    if (!validatedFormData.success) {
      return {
        success: false,
        message: 'Please enter approriately.',
        errors: validatedFormData.error.flatten().fieldErrors,
      }
    }

    const { user_id, title, preview, tag_ids, content, book_id } = validatedFormData.data;

    const returned_page_id = await sql`
      WITH inserted_page AS (
        INSERT INTO pages (user_id, title, preview, content, book_id)
        VALUES (${user_id}, ${title}, ${preview}, ${content}, ${book_id})
        RETURNING page_id
      ),
      tags_insert AS (
        INSERT INTO tags (tag_id)
        SELECT unnest(${tag_ids}::TEXT[])
        ON CONFLICT (tag_id) DO NOTHING
      ),
      pages_tags_insert AS (
        INSERT INTO pages_tags (page_id, tag_id)
        SELECT inserted_page.page_id, unnest(${tag_ids}::TEXT[])
          FROM inserted_page
        ON CONFLICT (page_id, tag_id) DO NOTHING
      )
      SELECT page_id FROM inserted_page
    `;

    const validatedReturnedPageId = PageSchema.shape.page_id.safeParse(returned_page_id[0].page_id)
    if (!validatedReturnedPageId.success) {
      return {
        success: false,
        message: 'Saved but some database error.',
        page_id: validatedReturnedPageId.data
      }
    }

    return {
      success: true,
      message: 'Page created successfully.',
      page_id: validatedReturnedPageId.data
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to Create a Page.'
    };
  }
}

const UpdatePageFromWriteFormSchema = z.object({
  ...SelectedWriteFormPageSchema.pick({user_id: true, page_id: true, title: true, preview: true, content: true}).shape,
  tag_ids: TagIdsSchema,
  book_id: BookIdSchema
});
export type UpdatePageFromWriteFormType = z.infer<typeof UpdatePageFromWriteFormSchema>;
export const sqlUpdatePageFromWriteForm = async (auth: unknown, prevState: WriteFormStateType, formData: FormData): Promise<WriteFormStateType> => {
  'use server'
  try {
    const validatedFormData = UpdatePageFromWriteFormSchema.safeParse({
      user_id: getUserId(),

      page_id: formData.get('page_id'),

      title: formData.get('title'),
      preview: formData.get('preview'),
      tag_ids: formData.get('tag_ids'),
      content: formData.get('content'),

      book_id: formData.get('book_id')
    });

    if (!validatedFormData.success) {
      return {
        success: false,
        message: 'Please enter approriately.',
        errors: validatedFormData.error.flatten().fieldErrors,
      }
    }

    const { user_id, page_id, title, preview, tag_ids, content, book_id } = validatedFormData.data;
    
    await sql`
      WITH updated_page AS (
        UPDATE pages
        SET title = ${title}, preview = ${preview}, content = ${content}, book_id = ${book_id}
        WHERE user_id = ${user_id} AND page_id = ${page_id}
        RETURNING page_id
      ),
      tags_insert AS (
        INSERT INTO tags (tag_id)
        SELECT unnest(${tag_ids}::TEXT[])
        ON CONFLICT (tag_id) DO NOTHING
      ),
      pages_tags_insert AS (
        INSERT INTO pages_tags (page_id, tag_id)
        SELECT updated_page.page_id, unnest(${tag_ids}::TEXT[])
          FROM updated_page
        ON CONFLICT (page_id, tag_id) DO NOTHING
      )
      SELECT page_id FROM updated_page;
    `

    revalidatePath(`/${user_id}/${page_id}`);
    return {
      success: true,
      message: 'Page updated successfully.'
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to Update a Page.',
    };
  }
}





// page page
const SelectePageSchema = z.object({
  ...PageSchema.pick({
    user_id: true,

    page_id: true,
    title: true,
    preview: true,
    content: true,
    view: true,
    like: true,
    created_at: true,

    book_id: true,
  }).shape,
  book_title: BookSchema.shape.book_title,

  tag_ids: TagsSchema.shape.tag_ids
});
export type SelectePageType = z.infer<typeof SelectePageSchema>;
export const sqlSelectPage = async (pageId: PageType["page_id"]): Promise<SelectePageType> => {
  'use server';
  try {
    const page = await sql`
      WITH updated_page AS (
        UPDATE pages
        SET view = view + 1
        WHERE page_id = ${pageId}
        RETURNING *
      )
      SELECT user_id, page_id, title, preview, content, view, "like", created_at::TIMESTAMP AS created_at, book_id,
      CASE 
        WHEN updated_page.book_id IS NOT NULL THEN (SELECT books.book_title FROM books WHERE updated_page.book_id = books.book_id)
        ELSE NULL
      END AS book_title,
        COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = updated_page.page_id), ARRAY[]::TEXT[]) AS tag_ids
      FROM updated_page
    `;

    if (page.length !== 1) {
      throw new Error("can't find the page");
    }

    return SelectePageSchema.parse({...page[0]});
  } catch (error) {
    console.error('Failed to fetch the page', error);
    throw new Error('Failed to fetch the page');
  }
};