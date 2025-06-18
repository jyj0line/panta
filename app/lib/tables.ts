import { z } from "zod";

import { COMMON, USER, PAGE, BOOK, TAG } from '@/app/lib/constants';
const {
  ACCEPTED_MIME_TYPES,
  ACCEPTED_EXTENSIONS,
  
  PROFILE_IMAGE_SIZE_MAX
} = COMMON;

const {
  USER_ID_MIN,
  USER_ID_MAX,
  USER_HASHED_PASSWORD_LENGTH,
  USER_BIO_MAX,

  USER_UNHASHED_PASSWORD_MIN,
  USER_UNHASHED_PASSWORD_MAX
} = USER;

const {
  PAGE_TITLE_MIN, PAGE_TITLE_MAX,
  PAGE_PREVIEW_MAX,
  PAGE_CONTENT_MAX,
  PAGE_VIEW_MIN, PAGE_VIEW_MAX,
  PAGE_LIKE_MIN, PAGE_LIKE_MAX
} = PAGE;

const {
  BOOK_TITLE_MIN,
  BOOK_TITLE_MAX
} = BOOK;

const {
  TAG_ID_MIN,
  TAG_ID_MAX,
  TAG_ID_NUM_MAX // TAG_ID_NUM_MAX is not on the database
} = TAG;

const extPattern = ACCEPTED_EXTENSIONS.join("|");

// not on the database
export const UnhashedPasswordSchema = z.string()
  .min(USER_UNHASHED_PASSWORD_MIN, { message: `Password must be at least ${USER_UNHASHED_PASSWORD_MIN} characters long.`})
  .max(USER_UNHASHED_PASSWORD_MAX, { message: `Password must be no more than ${USER_UNHASHED_PASSWORD_MAX} characters long.`})
  .regex(/[A-Za-z]/, 'Password must contain at least one English character.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');
export type UnhashedPassword = z.infer<typeof UnhashedPasswordSchema>;

// profile image / not on the database
export const ProfileImageSchema = z
  .custom<File>((file) => file instanceof File, {
    message: "Select a file.",
  })
  .refine((file) => ACCEPTED_MIME_TYPES.includes(file.type), {
    message: "Select a jpeg or png image file.",
  })
  .refine((file) => file.size <= PROFILE_IMAGE_SIZE_MAX, {
    message: `The Profile image file size must be no larger than ${PROFILE_IMAGE_SIZE_MAX / 1024 / 1024} MB.`,
  });

// profile image url / not on the database
const cloudinaryImageUrlRegex = new RegExp(
  `^https://res\\.cloudinary\\.com/([a-z0-9-]+)/image/upload/v(\\d+)/([^/]+\\.(${extPattern}))$`
);

// date column helper / not on the database
export const DateStringParamSchema = z.string().transform((date) => {
  if (date.trim() === '') {
    return null;
  }
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  
  const parsed = new Date(date);
  if (isNaN(parsed.getTime()) || date !== parsed.toISOString().slice(0, 10)) {
    return null;
  }
  
  return date;
});

export const DateStringRetSchema = z.string().transform((timestamp) => {
  return timestamp.slice(0, 10);
});

// users
export const UserSchema = z.object({
  user_id:
    z.string()
    .min(USER_ID_MIN, { message: `ID must be at least ${USER_ID_MIN} characters long.`})
    .max(USER_ID_MAX, { message: `ID must be no more than ${USER_ID_MAX} characters long.`})
    .regex(/^[a-zA-Z0-9]+$/, 'ID must contain only English characters and numbers.'),
  hashed_password:
    z.string()
    .length(USER_HASHED_PASSWORD_LENGTH, { message: `Password must be ${USER_HASHED_PASSWORD_LENGTH} characters long.`}),
  profile_image_url:
    z.string()
    .regex(cloudinaryImageUrlRegex, "Invalid profile image url.")
    .nullable(),
  bio: z.string().max(USER_BIO_MAX, { message: `Bio must be no more than ${USER_BIO_MAX} characters long.` }),
  created_at: z.date(), // default current_timestamp
  wrote_at: z.date(), // default current_timestamp
  sub_visited_at: z.date(), // default current_timestamp
  like_visited_at: z.date() // default current_timestamp
});
export type User = z.infer<typeof UserSchema>;

// subscribes
export const SubscribeSchema = z.object({
  user_id_subscribing: UserSchema.shape.user_id,
  user_id_subscribed: UserSchema.shape.user_id,
  visited_at: z.date()  // default current_timestamp
})

// books
export const BookSchema = z.object({
  book_id: z.string().uuid({message: 'Please select a book.'}),
  user_id: UserSchema.shape.user_id,
  book_title: z.string()
    .min(BOOK_TITLE_MIN, { message: `Please enter a title that is ${BOOK_TITLE_MIN} or more in length.` })
    .max(BOOK_TITLE_MAX, { message: `Please enter a title that is ${BOOK_TITLE_MAX} or less in length.` }),
  created_at: z.date(), // default current_timestamp
  updated_at: z.date() // default current_timestamp
});
export type Book = z.infer<typeof BookSchema>;

// pages
export const PageSchema = z.object({
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

  created_at: z.date(), // default current_timestamp
  updated_at: z.date() // default current_timestamp
});
export type Page = z.infer<typeof PageSchema>;

// weakly pages
export const WeeklyPageSchema = z.object({
  page_id: PageSchema.shape.page_id, // on delete cascade
  week_start_at: z.date(), // default current_timestamp 
  view: z.number().int().min(PAGE_VIEW_MIN).max(PAGE_VIEW_MAX), // default 0
});

// tags
export const TagSchema = z.object({
  tag_id: z.string()
    .trim()
    .min(TAG_ID_MIN, { message: "Tags cannot be empty" })
    .max(TAG_ID_MAX, { message: `Tag is too long (max ${TAG_ID_MAX} characters)` })
});
export type TagType = z.infer<typeof TagSchema>;

// tags / not on the database
export const TagsSchema = z.array(TagSchema.shape.tag_id).max(TAG_ID_NUM_MAX, { message: `Maximum ${TAG_ID_NUM_MAX} tags allowed` });
export type TagsType = z.infer<typeof TagsSchema>;