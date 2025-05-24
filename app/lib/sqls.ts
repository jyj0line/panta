'use server'
import { revalidatePath } from 'next/cache';
import { z } from "zod";

import { sql } from "@/app/lib/SFs/publicSFs";
import type { ChunkedResponseType } from '@/app/lib/hooks';

import { COMMON, USER, BOOK, PAGE, TAG } from '@/app/lib/constants';

export const getUserId = async () => {
  return '0o0o0'
  //return 'hellohellohellohellohellohe'
}


// common constants
const { LIMIT_MAX } = COMMON; 

// common schemas
const NaturalNumberSchema = z.number().int().min(1, { message: 'Please enter an natural number.' });
const NonnegativeNumberSchema = z.number().int().nonnegative({ message: 'Please enter an nonnegative number.' });
const OrderCriteriaSchema = z.enum(['rank', 'created_at'], { invalid_type_error: 'Please select an order critic.' });
export type OrderCriteriaType = z.infer<typeof OrderCriteriaSchema>

// users table
const {USER_ID_MIN, USER_ID_MAX, USER_HASHED_PASSWORD_LENGTH, USER_BIO_MAX} = USER;
const UserSchema = z.object({
  user_id:
    z.string()
    .min(USER_ID_MIN, { message: `User ID must be at least ${USER_ID_MIN} characters long.`})
    .max(USER_ID_MAX, { message: `User ID must be no more than ${USER_ID_MAX} characters long.`}),
  hashed_password:
    z.string()
    .length(USER_HASHED_PASSWORD_LENGTH, { message: `Hashed password must be ${USER_HASHED_PASSWORD_LENGTH} characters long.`}),
  profile_image_url: z.string().nullable(),
  bio: z.string().max(USER_BIO_MAX, { message: `Please enter a bio that is ${USER_BIO_MAX} or more in length.` }),
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

// like table
const LikeSchema = z.object({
  user_id: UserSchema.shape.user_id,
  page_id: PageSchema.shape.page_id,
  created_at: z.date() // default current_timestamp
})

// follow table
const FollowSchema = z.object({
  follower_user_id: UserSchema.shape.user_id,
  following_user_id: UserSchema.shape.user_id,
  created_at: z.date() // default current_timestamp
})

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