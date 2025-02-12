'use server'
import { neon } from '@neondatabase/serverless';
import { z } from "zod";

const getDatabaseConnection = async () => {
    'use server';
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set.');
    }
    return neon(process.env.DATABASE_URL);
};
const sql = await getDatabaseConnection();

const ZERO = 0;

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

// usesr_pages table
const UserPageSchema = z.object({
  user_id: UserSchema.shape.user_id,
  page_id: PageSchema.shape.page_id,
});
export type UserPageType = z.infer<typeof UserPageSchema>;
export const sqlCreateUsersPagesTable = async () => {
  'use server'
  try {
    return await sql`
      CREATE TABLE IF NOT EXISTS users_pages (
        user_id TEXT NOT NULL,
        page_id UUID NOT NULL,
        PRIMARY KEY (user_id, page_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (page_id) REFERENCES pages(page_id) ON DELETE CASCADE
      );
    `;
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error(`Failed to create users_pages table.`);
  }
};

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

    return await sql.transaction([sql`
      WITH inserted_page AS (
        INSERT INTO pages (title, preview, content) 
        VALUES (${validatedPage.title}, ${validatedPage.preview}, ${validatedPage.content}) 
        RETURNING page_id
      )
      INSERT INTO users_pages (user_id, page_id)
      SELECT ${validatedPage.user_id}, page_id FROM inserted_page
      RETURNING page_id
    `]);
  } catch (error) {
    console.error("Error inserting page:", error);
    throw new Error(`Failed to insert page.`);
  }
};

// card
export type ChunkedRequest = {
  offset: number,
  limit: number,
} 
export type ChunkedResponse<T> = {
  items: T[];
  hasNextChunk: boolean;
}
const CardSchema = z.object({
  ...PageSchema.pick({
    page_id: true,
    title: true,
    preview: true,
    view: true,
    like: true,
    created_at: true,
  }).shape,
  user_id: UserSchema.shape.user_id,
  preview: z.string().max(PAGE_PREVIEW_MAX).nullable().transform(value => value === null ? '' : value),
  content: z.string().max(PAGE_CONTENT_MAX).nullable().transform(value => value === null ? '' : value),
});
export type CardType = z.infer<typeof CardSchema>;
export const sqlSelectCards = async (chunkedRequest: ChunkedRequest): Promise<ChunkedResponse<CardType>> => {
  'use server';

  try {
    const cards = await sql`
      SELECT up.user_id, p.page_id, p.title, p.preview, p.content, p.view, p."like", p.created_at
      FROM pages p
      INNER JOIN users_pages up ON p.page_id = up.page_id
      ORDER BY p.view DESC
      LIMIT ${chunkedRequest.limit}
      OFFSET ${chunkedRequest.offset}
    `;

    const validatedCards = cards.map(card => { return CardSchema.parse(card); });

    return {
      items: validatedCards,
      hasNextChunk: validatedCards.length === chunkedRequest.limit,
    };
  } catch (error) {
    console.error('Invalid card data');
    throw new Error(`Failed to fetch cards`);
  }
};