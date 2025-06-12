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