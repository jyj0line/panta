'use server'
import { neon } from '@neondatabase/serverless';
import { z } from "zod";
import type { ChunkedResponseType } from '@/app/lib/hooks';
import { SearchParams } from 'next/dist/server/request/search-params';

const getDatabaseConnection = async () => {
    'use server';
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set.');
    }
    return neon(process.env.DATABASE_URL);
};
const sql = await getDatabaseConnection();

const ZERO = 0;
const NaturalNumberSchema = z.number().int().min(1, { message: 'Please enter an natural number.' });
const NonnegativeNumberSchema = z.number().int().nonnegative();
const OrderCriteriaSchema = z.enum(['rank', 'created_at'], { message: 'Invalid order criteria' });
export type OrderCriteriaType = z.infer<typeof OrderCriteriaSchema>

// users table
const USER_ID_MIN = 1;
const USER_ID_MAX = 32;
const USER_HASHED_PASSWORD_LENGTH = 60;
const UserSchema = z.object({
  user_id: z.string().min(USER_ID_MIN).max(USER_ID_MAX),
  hashed_password: z.string().length(USER_HASHED_PASSWORD_LENGTH),
  created_at: z.date(),
});
export type UserType = z.infer<typeof UserSchema>;
export const sqlCreateUsersTable = async () => {
  'use server';
  try {
    return await sql`
      CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY CHECK (LENGTH(user_id) >= ${USER_ID_MIN} AND LENGTH(user_id) <= ${USER_ID_MAX}),
      hashed_password TEXT NOT NULL CHECK (LENGTH(hashed_password) = ${USER_HASHED_PASSWORD_LENGTH}),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    `;
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error(`Failed to create users table.`);
  }
};

// pages table
const PAGE_TITLE_MIN = 1;
const PAGE_TITLE_MAX = 255;
const PAGE_PREVIEW_MAX = 255;
const PAGE_CONTENT_MAX = 100000;
const PAGE_VIEW_MIN = 0;
const PAGE_VIEW_MAX = 100000000;
const PAGE_LIKE_MIN = 0;
const PAGE_LIKE_MAX = 99999999;
const PageSchema = z.object({
  page_id: z.string().uuid(),
  user_id: UserSchema.shape.user_id,
  title: z.string().min(PAGE_TITLE_MIN).max(PAGE_TITLE_MAX),

  preview: z.string().max(PAGE_PREVIEW_MAX).nullable().transform(value => value === '' ? null : value),
  content: z.string().max(PAGE_CONTENT_MAX).nullable().transform(value => value === '' ? null : value),
  view: z.number().int().min(PAGE_VIEW_MIN).max(PAGE_VIEW_MAX),
  like: z.number().int().min(PAGE_LIKE_MIN).max(PAGE_LIKE_MAX),
  created_at: z.date(),
});
export type PageType = z.infer<typeof PageSchema>;
export const sqlCreatePagesTable = async () => {
  'use server'
  try {
    return await sql`
      CREATE TABLE IF NOT EXISTS pages (
        page_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL CHECK (LENGTH(title) >= ${PAGE_TITLE_MIN} AND LENGTH(title) <= ${PAGE_TITLE_MAX}),
        
        preview TEXT DEFAULT NULL CHECK (LENGTH(preview) <= ${PAGE_PREVIEW_MAX}),
        content TEXT DEFAULT NULL CHECK (LENGTH(content) <= ${PAGE_CONTENT_MAX}),
        view INT NOT NULL DEFAULT ${ZERO} CHECK (view >= ${PAGE_VIEW_MIN} AND view <= ${PAGE_VIEW_MAX}),
        "like" INT NOT NULL DEFAULT ${ZERO} CHECK ("like" >= ${PAGE_LIKE_MIN} AND "like" <= ${PAGE_LIKE_MAX}),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error(`Failed to create pages table.`);
  }
};

// tag tables
const TAG_ID_MIN = 1;
const TAG_ID_MAX = 25;
const TagSchema = z.object({
  tag_id: z.string().min(TAG_ID_MIN).max(TAG_ID_MAX),
});
export type TagType = z.infer<typeof TagSchema>;
export const sqlCreateTagsTable = async () => {
  'use server'
  try {
    return await sql`
      CREATE TABLE IF NOT EXIST tags (
        tag_id TEXT PRIMARY KEY CHECK (length(tag_id) >= ${TAG_ID_MIN} AND length(tag_id) <= ${TAG_ID_MAX})
      );
    `;
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error(`Failed to create tags table.`);
  }
};

// pages_tags table
const PageTagSchema = z.object({
  page_id: PageSchema.shape.page_id,
  tag_id: TagSchema.shape.tag_id 
});
export type PageTageType = z.infer<typeof PageTagSchema>;
export const sqlCreatePagesTagsTable = async () => {
  'use server'
  try {
    return await sql`
      CREATE TABLE IF NOT EXISTS pages_tags (
        page_id UUID REFERENCES pages(page_id) ON DELETE CASCADE,
        tag_id TEXT REFERENCES tags(tag_id) ON DELETE CASCADE,
        PRIMARY KEY (page_id, tag_id)
      );
    `;
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error(`Failed to create pages_tags table.`);
  }
}






// insert user
const UNHASHED_PASSWORD_MIN = 8;
const UNHASHED_PASSWORD_MAX = 60;
const InsertUserWithUnhashedPasswordSchema = z.object({
  user_id: UserSchema.shape.user_id,
  unhashed_password: z.string().min(UNHASHED_PASSWORD_MIN).max(UNHASHED_PASSWORD_MAX)
});
export type InsertUserWithUnhashedPasswordType = z.infer<typeof InsertUserWithUnhashedPasswordSchema>;
const InsertUserSchema = z.object({
  ...UserSchema.pick({
    user_id: true,
    hashed_password: true
  }).shape
});
export type InsertUserType = z.infer<typeof InsertUserSchema>;
export const sqlInsertUser = async (user:InsertUserType) => {
  'use server'
  try {
    const validatedUser = InsertUserSchema.parse(user);

    return await sql`
      INSERT INTO users (user_id, hashed_password)
      VALUES (${validatedUser.user_id}, ${validatedUser.hashed_password})
    `;
  } catch (error) {
    console.error("Error inserting user:", error);
    throw new Error(`Failed to insert user.`);
  }
}

// insert page
const InsertPageSchema = z.object({
  ...UserSchema.pick({
    user_id: true
  }).shape,
  ...PageSchema.pick({
    title: true,
    preview: true,
    content: true
  }).shape
});
export type InsertPageType = z.infer<typeof InsertPageSchema>;
export const sqlInsertPage = async (page:InsertPageType) => {
  'use server'
  try {
    const validatedPage = InsertPageSchema.parse(page);

    return await sql`
      INSERT INTO pages (user_id, title, preview, content) 
      VALUES (${validatedPage.user_id}, ${validatedPage.title}, ${validatedPage.preview}, ${validatedPage.content})
      RETURNING page_id 
    `;
  } catch (error) {
    console.error("Error inserting page:", error);
    throw new Error(`Failed to insert page.`);
  }
};

//insert tag
const TAG_NUM_MIN_PER_PAGE = 1;
const TAG_NUM_MAX_PER_PAGE = 25;
const InsertTagstoPageSchema = z.object({
  ...PageSchema.pick({
    page_id: true
  }).shape,
  tag_ids: z.array(TagSchema.shape.tag_id).min(TAG_NUM_MIN_PER_PAGE).max(TAG_NUM_MAX_PER_PAGE)
});
export type InsertTagsToPageType = z.infer<typeof InsertTagstoPageSchema>;
export const sqlInsertTags = async (tagsAndPage: InsertTagsToPageType) => {
  'use server'
  try {
    const validatedTagsAndPage = InsertTagstoPageSchema.parse(tagsAndPage);

    return await sql.transaction([sql`
      BEGIN;
      DO $$
      DECLARE
          page_id := ${validatedTagsAndPage.page_id};
          current_tag_id_count INT;
          new_tag_ids TEXT[] := ${validatedTagsAndPage.tag_ids};
          distinct_new_tag_ids TEXT[];
          new_tag_id_count INT;
          total_tag_id_count INT;
      BEGIN
          SELECT ARRAY(SELECT DISTINCT unnest(new_tag_ids)) INTO distinct_new_tag_ids;
          
          SELECT 
              COUNT(*),
              array_length(distinct_new_tag_ids, 1) - COUNT(pt.tag_id)
          INTO current_tag_id_count, new_tag_id_count
          FROM unnest(distinct_new_tag_ids) AS tmp_t(tag_id)
          LEFT JOIN pages_tags pt ON 
              pt.page_id = page_id AND
              pt.tag_id = tmp_t.tag_id;

          total_tag_id_count := current_tag_id_count + new_tag_id_count;

          IF total_tag_id_count > ${TAG_NUM_MAX_PER_PAGE} THEN
              RAISE EXCEPTION 'Total tag count would exceed 25. Current: %, New: %, Total: %', 
                  current_tag_id_count, new_tag_id_count, total_tag_id_count;
          END IF;

          INSERT INTO tags (tag_id)
          SELECT unnest(distinct_new_tag_ids)
          ON CONFLICT (tag_id) DO NOTHING;

          INSERT INTO pages_tags (page_id, tag_id)
          SELECT page_id, unnest(distinct_new_tag_ids)
          ON CONFLICT (page_id, tag_id) DO NOTHING;
      END $$;
      COMMIT;
    `]);
  } catch (error) {
    console.error("Error inserting tags:", error);
    throw new Error(`Failed to insert tags.`);
  }
}



const ChunkedRequestSchema = z.object({
  chunk: NaturalNumberSchema,
  limit: NaturalNumberSchema.max(100),
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
      ORDER BY view DESC
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
    console.error('Failed to fetch cards');
    throw new Error('Failed to fetch cards');
  }
};

//search
const SearchedParamsSchema = z.object({
  search: z.string().optional(),

  user_ids: z.array(UserSchema.shape.user_id).optional(),
  tag_ids: z.array(TagSchema.shape.tag_id).optional(),

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
    console.error('Failed to fetch search results');
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