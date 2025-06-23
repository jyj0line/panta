"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { User } from 'next-auth';
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import bcrypt from 'bcrypt';

import { auth } from '@/auth';
import { sql, logoutSF } from "@/app/lib/SF/publicSFs";
import { type Page, UnhashedPasswordSchema, UserSchema, PageSchema, BookSchema, TagsSchema } from '@/app/lib/tables';
import { type CQ, CQSchema, CSSchema, GetSlipsRetSchema, type GetSlipsRet, } from '@/app/lib/utils';
import { METADATA, LOADING, SUCCESS, ERROR, COMMON } from '@/app/lib/constants';

const {
  WRITE_TITLE_METADATA
} = METADATA;

const {
  UPLOADING_PROFILE_IMAGE
} =  LOADING;

const {
  CHANGE_PASSWORD_SUCCESS,
  
  DELETE_ACCOUNT_SUCCESS,

  UPDATE_BIO_SUCCESS,

  UPDATE_PROFILE_IMAGE_URL_SUCCESS,

  DELETE_PROFILE_IMAGE_SUCCESS,

  CREATE_PAGE_SUCCESS,
  UPDATE_PAGE_SUCCESS
} = SUCCESS;

const {
  SOMETHING_WENT_WRONG_ERROR,
  INVALID_INPUT_ERROR,
  UNAUTHENTICATED_ERROR,

  INCORRECT_PASSWORD_ERROR,
  UNHASHED_PASSWORD_FOR_CONFIRM_DIFF_ERROR,

  DELETE_ACCOUNT_UNCHECKED_ERROR,

  UPDATE_BIO_SOMETHING_ERROR,
  UPDATE_BIO_INPUT_ERROR,

  CREATE_PROFILE_IMAGE_SOMETHING_ERROR,
  DELETE_PROFILE_IMAGE_SOMETHING_ERROR,
  
  UPDATE_PROFILE_IMAGE_URL_SOMETHING_ERROR,
  UPDATE_PROFILE_IMAGE_URL_INPUT_ERROR,

  CREATE_WRITE_SOMETHING_ERROR: CREATE_PAGE_SOMETHING_ERROR,
  UPDATE_WRITE_SOMETHING_ERROR: UPDATE_PAGE_SOMETHING_ERROR
} = ERROR;

const {
  SALT_OR_ROUNDS,

  PROFILE_IMAGE_FOLDER_NAME
} = COMMON;

{/* auth.js start */}
// get the authenticated user

export const getAuthenticatedUserASF = async (): Promise<User | null> => {
  'use server';

  const session = await auth();
  return session?.user ?? null;
};

{/* neon start */}
// is matched password
const IsMatchedPwParamSchema = z.object({
  pw: UnhashedPasswordSchema
});
type IsMatchedPwParam = z.infer<typeof IsMatchedPwParamSchema>;
const isPwMatchedThrASF = async (param: IsMatchedPwParam): Promise<boolean> => {
  "use server";

  try {
    const user = await getAuthenticatedUserASF();
    if (!user || !user?.user_id) {
      return false;
    };

    const parsedParam = IsMatchedPwParamSchema.safeParse(param);
    if (!parsedParam.success) {
      return false;
    };

    const selectHashedPwRes = await sql`
      SELECT hashed_password
      FROM users
      WHERE user_id = ${user.user_id}
    `;

    const isPwMatched = await bcrypt.compare(parsedParam.data.pw, selectHashedPwRes[0].hashed_password);
    if (!isPwMatched) {
      return false;
    };

    return true;
  } catch {
    throw new Error(SOMETHING_WENT_WRONG_ERROR);
  }
}

// update user hashed_password
const UpdatePwParamSchema = z.object({
  curPw: UnhashedPasswordSchema,
  newPw: UnhashedPasswordSchema,
  newPw2: UnhashedPasswordSchema
});
type UpdatePwParam = z.infer<typeof UpdatePwParamSchema>;
type UpdatePwValidatedParam = {
  curPw: UpdatePwParam["curPw"] | undefined;
  newPw: UpdatePwParam["newPw"] | undefined;
};
type UpdatePwRet = UpdatePwSuccessRet | UpdatePwFailureRet;
type UpdatePwSuccessRet = {
  success: true;
  message: string;
};
type UpdatePwFailureRet = {
  success: false;
  message: string;
  errors?: {
    curPw?: string[],
    newPw?: string[],
    newPw2?: string[]
  }
};
export const updatePwASF = async (param: UpdatePwParam): Promise<UpdatePwRet> => {
  "use server";

  try {
    const user = await getAuthenticatedUserASF();
    if (!user || !user?.user_id) {
      return {
        success: false,
        message: UNAUTHENTICATED_ERROR
      }
    };

    const validatedParam: UpdatePwValidatedParam = {
      curPw: undefined,
      newPw: undefined
    };
    const invalidInputRet: UpdatePwFailureRet = {
      success: false,
      message: INVALID_INPUT_ERROR
    };

    const parsedCurPw = UpdatePwParamSchema.shape.curPw.safeParse(param.curPw);
    if (!parsedCurPw.success) {
      invalidInputRet.errors = {
        ...invalidInputRet.errors,
        curPw: [INCORRECT_PASSWORD_ERROR]
      }
    } else {
      validatedParam.curPw = parsedCurPw.data;
      const isCurPwMatched = await isPwMatchedThrASF({pw: validatedParam.curPw});
      if (!isCurPwMatched) {
        invalidInputRet.errors = {
          ...invalidInputRet.errors,
          curPw: [INCORRECT_PASSWORD_ERROR]
        }
      }
    }

    const parsedNewPw = UpdatePwParamSchema.shape.newPw.safeParse(param.newPw);
    if (!parsedNewPw.success) {
      invalidInputRet.errors = {
        ...invalidInputRet.errors,
        newPw: parsedNewPw.error.errors.map(e => e.message)
      }
    } else {
      validatedParam.newPw = parsedNewPw.data;
    }

    const isNewPwsMatched = param.newPw === param.newPw2;
    if (!isNewPwsMatched) {
      invalidInputRet.errors = {
        ...invalidInputRet.errors,
        newPw2: [UNHASHED_PASSWORD_FOR_CONFIRM_DIFF_ERROR]
      }
    }

    if (
      invalidInputRet.errors ||
      !validatedParam.curPw ||
      !validatedParam.newPw
    ) return invalidInputRet;

    const hashedPw = await bcrypt.hash(validatedParam.newPw, SALT_OR_ROUNDS);
    const updatePwRes = await sql`
      UPDATE users
      SET hashed_password = ${hashedPw}
      WHERE user_id = ${user.user_id}
      RETURNING user_id
    `;
    if (updatePwRes[0].user_id !== user.user_id) {
      return {
        success: false,
        message: SOMETHING_WENT_WRONG_ERROR
      };
    } 
    
    return {
      success: true,
      message: CHANGE_PASSWORD_SUCCESS
    }
  } catch(error) {
    console.error(error);
    return ({
        success: false,
        message: SOMETHING_WENT_WRONG_ERROR
    });
  }
};

// update user bio
const UpdateBioParamSchema = UserSchema.shape.bio;
type UpdateBioParam = z.infer<typeof UpdateBioParamSchema>;
export type UpdateBioState = {
  success: true;
  message: string;
} | {
  success: false;
  message: string;
  errors?: string[];
};
export const updateBioASF = async (bio: UpdateBioParam): Promise<UpdateBioState> => {
  "use server";
  
  try {
    const user = await getAuthenticatedUserASF();
    if (!user || !user?.user_id) return {
      success: false,
      message: UNAUTHENTICATED_ERROR
    };

    const parsedParam = UpdateBioParamSchema.safeParse(bio);
    if (!parsedParam.success) return {
      success: false,
      message: UPDATE_BIO_INPUT_ERROR,
      errors: parsedParam.error.errors.map(e=>e.message)
    };

    await sql`
      UPDATE users
      SET bio = ${parsedParam.data}
      WHERE user_id = ${user.user_id}
    `;

    return {
      success: true,
      message: UPDATE_BIO_SUCCESS
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: UPDATE_BIO_SOMETHING_ERROR
    }
  }
};

// update user profile image url
const UpdateProfileImageUrlParamSchema = UserSchema.shape.profile_image_url;
type UpdateProfileImageUrlParam = z.infer<typeof UpdateProfileImageUrlParamSchema>;
type UpdateProfileImageUrlState = {
  success: true;
  message: string;
} | {
  success: false;
  message: string;
  errors?: string[]
};
export const updateProfileImageUrlASF = async (profileImageUrl: UpdateProfileImageUrlParam): Promise<UpdateProfileImageUrlState> => {
  "use server";
  
  try {
    const user = await getAuthenticatedUserASF();
    if (!user || !user?.user_id) return {
      success: false,
      message: UNAUTHENTICATED_ERROR
    };

    const parsedParam = UpdateProfileImageUrlParamSchema.safeParse(profileImageUrl);
    if (!parsedParam.success) return {
      success: false,
      message: UPDATE_PROFILE_IMAGE_URL_INPUT_ERROR,
      errors: parsedParam.error.errors.map(e=>e.message)
    };

    await sql`
      UPDATE users
      SET profile_image_url = ${parsedParam.data}
      WHERE user_id = ${user.user_id}
    `;

    return {
      success: true,
      message: UPDATE_PROFILE_IMAGE_URL_SUCCESS
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: UPDATE_PROFILE_IMAGE_URL_SOMETHING_ERROR
    }
  }
};

// delete user profile image url
type DeleteProfileImageUrlState = {
  success: boolean;
  message: string;
};
export const deleteProfileImageUrlASF = async (): Promise<DeleteProfileImageUrlState> => {
  "use server";

  try {
    const user = await getAuthenticatedUserASF();
    if (!user || !user?.user_id) return {
      success: false,
      message: DELETE_PROFILE_IMAGE_SOMETHING_ERROR
    };

    await sql`
      UPDATE users
      SET profile_image_url = NULL
      WHERE user_id = ${user.user_id}
    `;

    return {
      success: true,
      message: DELETE_PROFILE_IMAGE_SUCCESS
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: DELETE_PROFILE_IMAGE_SOMETHING_ERROR
    }
  }
}

// delete user
type DeleteUserParam = {
    pw: string;
    isChecked: boolean;
};
const DeleteUserValidatedParamSchema = z.object({
  pw: UnhashedPasswordSchema,
  isChecked: z.literal(true, {
    errorMap: () => ({
      message: DELETE_ACCOUNT_UNCHECKED_ERROR,
    })
  })
});
type DeleteUserValidatedParam = {
  pw: z.infer<typeof DeleteUserValidatedParamSchema.shape.pw> | undefined;
  isChecked: z.infer<typeof DeleteUserValidatedParamSchema.shape.isChecked> | undefined;
}
type DeleteUserSuccessRet = {
  success: true;
  message: string;
  afterMessages?: string[]
}
type DeleteUserFailureRet = {
  success: false;
  message: string;
  errors?: {
    pw?: string[],
    isChecked?: string[],
  }
};
type DeleteUserRet = DeleteUserSuccessRet | DeleteUserFailureRet;
export const deleteUserASF = async (param: DeleteUserParam): Promise<DeleteUserRet> => {
  "use server";

  try {
    const user = await getAuthenticatedUserASF();
      if (!user || !user?.user_id) {
        return {
          success: false,
          message: UNAUTHENTICATED_ERROR
        }
    };

    const validatedParam: DeleteUserValidatedParam = {
      pw: undefined,
      isChecked: undefined
    };
    const invalidInputRet: DeleteUserFailureRet= {
      success: false,
      message: INVALID_INPUT_ERROR
    };

    const parsedPw = DeleteUserValidatedParamSchema.shape.pw.safeParse(param.pw);
    if (!parsedPw.success) {
      invalidInputRet.errors = {
        ...invalidInputRet.errors,
        pw: [INCORRECT_PASSWORD_ERROR]
      }
    } else {
      validatedParam.pw = parsedPw.data
      const isPwMatched = await isPwMatchedThrASF({pw: validatedParam.pw});
      if (!isPwMatched) {
        invalidInputRet.errors = {
          ...invalidInputRet.errors,
          pw: [INCORRECT_PASSWORD_ERROR]
        }
      }
    }

    const parsedIsChecked = DeleteUserValidatedParamSchema.shape.isChecked.safeParse(param.isChecked);
    if (!parsedIsChecked.success) {
      invalidInputRet.errors = {
        ...invalidInputRet.errors,
        isChecked: parsedIsChecked.error.errors.map(e => e.message)
      }
    } else {
      validatedParam.isChecked = parsedIsChecked.data;
    }

    if (
      invalidInputRet.errors ||
      !validatedParam.pw ||
      !validatedParam.isChecked
    ) return invalidInputRet;

    const selectProfileImageUrlRes = await sql`
      SELECT profile_image_url
      FROM users
      WHERE user_id = ${user.user_id}
    `;
    if (selectProfileImageUrlRes[0].profile_image_url) {
      const deleteProfileImageFileRes = await deleteProfileImageFileSF();
      if (!deleteProfileImageFileRes.success) {
        console.error(`${selectProfileImageUrlRes[0].profile_image_url} has not been deleted.`);
      }
    }

    const deleteUserRes = await sql`
      DELETE
      FROM users
      WHERE user_id = ${user.user_id}
      RETURNING user_id
    `;
    if (deleteUserRes[0].user_id !== user.user_id) {
      return {
        success: false,
        message: SOMETHING_WENT_WRONG_ERROR
      };
    } 

    const logoutRes = await logoutSF();
    if (!logoutRes.success) {
      return {
        success: true,
        message: DELETE_ACCOUNT_SUCCESS,
        afterMessages: [logoutRes.message]
      }
    }
    return {
      success: true,
      message: DELETE_ACCOUNT_SUCCESS
    }
  } catch(error) {
    console.error(error);
    return ({
      success: false,
      message: SOMETHING_WENT_WRONG_ERROR
    });
  } 
}


{/* write start */}
const GetWriteTitleParamSchema = PageSchema.shape.page_id;
type GetWriteTitleParam = z.infer<typeof GetWriteTitleParamSchema>;
const GetWriteTitleRetSchema = PageSchema.shape.title;
type GetWriteTitleRet = z.infer<typeof GetWriteTitleRetSchema>;
export const getWriteTitleASF = async (param: GetWriteTitleParam): Promise<GetWriteTitleRet> => {
  "use server";

  try {
    const user = await getAuthenticatedUserASF();
    if (!user) {
      console.error("Unauthenticated");
      throw new Error("Unauthenticated");
    }

    const parsedParam = GetWriteTitleParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error(parsedParam.error);
      throw new Error("Invalid param");
    }

    const res = await sql`
      SELECT title
      FROM pages
      WHERE page_id = ${parsedParam.data} AND user_id = ${user.user_id}
    `;

    if (res.length !== 1) {
      console.error(res);
      throw new Error("Can't find the write title");
    }
    const parsedRet = GetWriteTitleRetSchema.safeParse(res[0].title);
    if (!parsedRet.success) {
      console.error(parsedRet);
      throw new Error("Invalid ret");
    }
    
    return parsedRet.data;
  } catch(error) {
    console.error("Failed to get title: ", error);
    return WRITE_TITLE_METADATA;
  }
}

const SelectWritePageParamSchema = z.object({
  ...PageSchema.pick({
    page_id: true
  }).shape
});
type SelectWritePageParam = z.infer<typeof SelectWritePageParamSchema>;
const SelectWriteRetSchema = z.object({
  ...PageSchema.pick({
    user_id: true,

    page_id: true,
    title: true,
    preview: true,
    content: true,

    book_id: true,
  }).shape,
  tag_ids: TagsSchema
});
export type SelectWritePageRet = z.infer<typeof SelectWriteRetSchema>;
export const selectWritePageASF = async (param: SelectWritePageParam): Promise<SelectWritePageRet> => {
  'use server';

  try {
    const user = await getAuthenticatedUserASF();
    if (!user) {
      console.error("Unauthenticated");
      throw new Error("Unauthenticated");
    }

    const parsedParam = SelectWritePageParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error(parsedParam.error);
      throw new Error("Invalid param");
    }

    const page = await sql`
      SELECT user_id, page_id, title, preview, content, book_id,
        COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = pages.page_id), ARRAY[]::TEXT[]) AS tag_ids
      FROM pages
      WHERE page_id = ${parsedParam.data.page_id} AND user_id = ${user.user_id}
    `;

    if (page.length !== 1) {
      console.error(page);
      throw new Error("Can't find the write page");
    }
    const parsedRet = SelectWriteRetSchema.safeParse({...page[0]});
    if (!parsedRet.success) {
      console.error(parsedRet);
      throw new Error("Invalid ret");
    }

    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch the write page', error);
    throw new Error('Failed to fetch the write page');
  }
};

const InitBookSchema = BookSchema.pick({ book_id: true, book_title: true });
export type InitBook = z.infer<typeof InitBookSchema>;
const SelectWriteBooksRetSchema = z.array(InitBookSchema);
export type SelectWriteBooksRet = z.infer<typeof SelectWriteBooksRetSchema>;    
export const selectWriteBooksASF = async (): Promise<SelectWriteBooksRet> => {
  'use server';

  try {
    const user = await getAuthenticatedUserASF();
    if (!user) {
      console.error("Unauthenticated");
      throw new Error("Unauthenticated");
    }

    const books = await sql`
      SELECT user_id, book_id, book_title
      FROM books
      WHERE user_id = ${user.user_id}
    `;

    const parsedRet = SelectWriteBooksRetSchema.safeParse(books);
    if (!parsedRet.success) {
      console.error(parsedRet.error);
      throw new Error("Invalid ret");
    }
    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch the write books', error);
    throw new Error('Failed to fetch the write books');
  }
}

const updateWroteAtHASF = async () => {
  "use server";

  try {
    const user = await getAuthenticatedUserASF();
    if (!user) throw new Error("Unauthenticated in updateWroteAtHASF");

    await sql`
      UPDATE users SET wrote_at = CURRENT_TIMESTAMP
    `;
  } catch(error) {
    console.error("SSW in updateWroteAtHASF", error);
  }
}

const BookIdInputtedSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  SelectWriteRetSchema.shape.book_id
)
const CreateWriteParamSchema = z.object({
  ...SelectWriteRetSchema.pick({ title: true, preview: true, content: true, tag_ids: true }).shape,
  book_id: BookIdInputtedSchema
});
export type CreateWriteParam = z.infer<typeof CreateWriteParamSchema>;
export type CreateWriteSuccessState = {
  success: true
  message: string;
  page_id: Page["page_id"]
}
export type CreateWriteFailureState = {
  success: false;
  message: string;
  errors?: {
    title?: string[];
    preview?: string[];
    tag_ids?: string[];
    content?: string[];
    book_id?: string[];
  };
}
export type CreateWriteState = CreateWriteSuccessState | CreateWriteFailureState;
export const createWriteASF = async (param: CreateWriteParam): Promise<CreateWriteState> => {
  'use server';

  let successFlag = false;
  let returnedPageId = '';

  try {
    const user = await getAuthenticatedUserASF();
    if (!user) {
      console.error(UNAUTHENTICATED_ERROR, user);
      return {
        success: false,
        message: UNAUTHENTICATED_ERROR
      }
    }

    const parsedParam = CreateWriteParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error(INVALID_INPUT_ERROR, parsedParam.error);
      return {
        success: false,
        message: INVALID_INPUT_ERROR,
        errors: parsedParam.error.flatten().fieldErrors
      }
    }

    const { title, preview, tag_ids, content, book_id } = parsedParam.data;

    const createWriteRes = await sql`
      WITH inserted_page AS (
        INSERT INTO pages (user_id, title, preview, content, book_id)
        VALUES (${user.user_id}, ${title}, ${preview}, ${content}, ${book_id})
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

    const parsedReturnedPageId = PageSchema.shape.page_id.safeParse(createWriteRes[0].page_id);
    if (!parsedReturnedPageId.success) {
      console.error(CREATE_PAGE_SOMETHING_ERROR, parsedReturnedPageId.error);
      return {
        success: false,
        message: CREATE_PAGE_SOMETHING_ERROR
      }
    }

    successFlag = true;
    returnedPageId = parsedReturnedPageId.data;
    await updateWroteAtHASF();
    return {
      success: true,
      message: CREATE_PAGE_SUCCESS,
      page_id: parsedReturnedPageId.data
    };
  } catch (error) {
    console.error(CREATE_PAGE_SOMETHING_ERROR, error);

    if (successFlag) {
      return {
        success: true,
        message: CREATE_PAGE_SUCCESS,
        page_id: returnedPageId
      };
    }
    return {
      success: false,
      message: CREATE_PAGE_SOMETHING_ERROR
    };
  }
}

const UpdateWriteParamSchema = z.object({
  ...SelectWriteRetSchema.pick({ page_id: true, title: true, preview: true, content: true, tag_ids: true}).shape,
  book_id: BookIdInputtedSchema
});
export type UpdateWriteParam = z.infer<typeof UpdateWriteParamSchema>;
export type UpdateWriteSuccessState = {
  success: true
  message: string
}
export type UpdateWriteFailureState = {
  success: false;
  message: string;
  errors?: {
    title?: string[];
    preview?: string[];
    tag_ids?: string[];
    content?: string[];
    book_id?: string[];
  };
}
export type UpdateWriteState = UpdateWriteSuccessState | UpdateWriteFailureState;
export const updateWriteASF = async (param: UpdateWriteParam): Promise<UpdateWriteState> => {
  'use server';

  let successFlag = false;
  try {
    const user = await getAuthenticatedUserASF();
    if (!user) {
      console.error(UNAUTHENTICATED_ERROR, user);
      return {
        success: false,
        message: UNAUTHENTICATED_ERROR
      }
    }

    const parsedParam = UpdateWriteParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error(INVALID_INPUT_ERROR, parsedParam.error);
      return {
        success: false,
        message: INVALID_INPUT_ERROR,
        errors: parsedParam.error.flatten().fieldErrors
      }
    }

    const { page_id, title, preview, tag_ids, content, book_id } = parsedParam.data;
    
    const updateWriteRes = await sql`
      WITH updated_page AS (
        UPDATE pages
        SET title = ${title}, preview = ${preview}, content = ${content}, book_id = ${book_id}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user.user_id} AND page_id = ${page_id}
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
    `;

    const parsedReturnedPageId = PageSchema.shape.page_id.safeParse(updateWriteRes[0].page_id);
    if (!parsedReturnedPageId.success) {
      console.error(UPDATE_PAGE_SOMETHING_ERROR, parsedReturnedPageId.error);
      return {
        success: false,
        message: UPDATE_PAGE_SOMETHING_ERROR
      }
    }

    successFlag = true;
    revalidatePath(`/${user.user_id}/${page_id}`);
    await updateWroteAtHASF();
    return {
      success: true,
      message: UPDATE_PAGE_SUCCESS
    };
  } catch (error) {
    console.error('Database error:', error);
    if (successFlag) {
      return {
        success: true,
        message: UPDATE_PAGE_SUCCESS
      };
    }
    return {
      success: false,
      message: UPDATE_PAGE_SOMETHING_ERROR
    };
  }
}

// create a book
const CreateBookParamSchema = BookSchema.shape.book_title;
type CreateBookParam = z.infer<typeof CreateBookParamSchema>;
const CrateBookSuccessRetBookIdSchema = BookSchema.shape.book_id;
type CreateBookSuccessRet = {
  success: true
  bookId: z.infer<typeof CrateBookSuccessRetBookIdSchema>
}
type CreateBookFailureRet = {
  success: false
  errors: string[]
}
type CreateBookRet = CreateBookSuccessRet | CreateBookFailureRet;
export const createBookASF = async (param: CreateBookParam): Promise<CreateBookRet> => {
  'use server';

  try {
    const writer = await getAuthenticatedUserASF();
    if (!writer) {
      console.error(UNAUTHENTICATED_ERROR, writer);
      return {
        success: false,
        errors: [UNAUTHENTICATED_ERROR]
      }
    }

    const parsedParam = CreateBookParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return {
        success: false,
        errors: parsedParam.error.errors.map(e => e.message)
      }
    }

    const writerId = writer.user_id;
    const bookTitle = parsedParam.data;

    const bookId = await sql`
      INSERT INTO books (user_id, book_title) VALUES (${writerId}, ${bookTitle}) RETURNING book_id
    `;

    const parsedBookId = CrateBookSuccessRetBookIdSchema.safeParse(bookId[0].book_id);
    if (!parsedBookId.success) {
      console.error("invalid ret: ", parsedBookId.error);
      return {
        success: false,
        errors: parsedBookId.error.errors.map(e => e.message)
      }
    }

    return {
      success: true,
      bookId: parsedBookId.data
    };
  } catch (error) {
    console.error("SSW: ", error);

    return {
      success: false,
      errors: [ERROR.SOMETHING_WENT_WRONG_ERROR]
    };
  }
}

// update a book title
const UpdateBookTitleParamSchema = z.object({
  bookId: BookSchema.shape.book_id,
  bookTitle: BookSchema.shape.book_title
});
type UpdateBookTitleParam = z.infer<typeof UpdateBookTitleParamSchema>;
type UpdateBookTitleSuccessRet = {
  success: true
}
type UpdateBookTitleFailureRet = {
  success: false
  errors: string[]
}
type UpdateBookTitleRet = UpdateBookTitleSuccessRet | UpdateBookTitleFailureRet;
export const updateBookTitleASF = async (param: UpdateBookTitleParam): Promise<UpdateBookTitleRet> => {
  'use server';

  try {
    const writer = await getAuthenticatedUserASF();
    if (!writer) {
      console.error(UNAUTHENTICATED_ERROR, writer);
      return {
        success: false,
        errors: [UNAUTHENTICATED_ERROR]
      }
    }

    const parsedParam = UpdateBookTitleParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return {
        success: false,
        errors: parsedParam.error.errors.map(e => e.message)
      }
    }

    const writerId = writer.user_id;
    const { bookId, bookTitle } = parsedParam.data;

    const res = await sql`
      UPDATE books
      SET book_title = ${bookTitle}, updated_at = CURRENT_TIMESTAMP
      WHERE book_id = ${bookId} AND user_id = ${writerId}
      RETURNING book_id
    `;

    if (res.length !== 1) {
      console.error("SWW: ", res);
      return {
        success: false,
        errors: [ERROR.SOMETHING_WENT_WRONG_ERROR]
      }
    }

    return { success: true };
  } catch (error) {
    console.error("SSW: ", error);

    return {
      success: false,
      errors: [ERROR.SOMETHING_WENT_WRONG_ERROR]
    };
  }
}
{/* write end */}

{/* like series start */}
// toggle like
const IsLikingParamSchema = PageSchema.shape.page_id;
type IsLikingParam = z.infer<typeof IsLikingParamSchema>;
const IsLikingRetSchema = z.boolean();
type IsLikingRet = z.infer<typeof IsLikingRetSchema>;
export const isLikingASF = async (param: IsLikingParam): Promise<IsLikingRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      return false;
    }

    const parsedParam = IsLikingParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return false;
    }

    const readerId = reader.user_id;
    const pageId = parsedParam.data;

    const ret = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM likes 
        WHERE page_id = ${pageId} AND user_id = ${readerId}
      ) AS is_liking
    `;

    if (ret.length !== 1) {
      console.error("invalid ret: ", ret);
      return false;
    }

    const parsedRet = IsLikingRetSchema.safeParse(ret[0].is_liking);
    if (!parsedRet.success) {
      console.error("invalid ret: ", parsedRet.error);
      return false;
    }

    return parsedRet.data;
  } catch(error) {
    console.error(error);
    return false;
  }
}

// toggle like
const ToggleLikeParamSchema = PageSchema.shape.page_id;
type ToggleLikeParam = z.infer<typeof ToggleLikeParamSchema>;
export type ToggleLikeRet = boolean | null;
export const toggleLikeASF = async (param: ToggleLikeParam): Promise<ToggleLikeRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      console.error(UNAUTHENTICATED_ERROR, reader);
      return null;
    }

    const parsedParam = ToggleLikeParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return false;
    }
  
    const readerId = reader.user_id;
    const pageId = parsedParam.data;

    await sql`
      WITH del AS (
        DELETE FROM likes 
        WHERE page_id = ${pageId} AND user_id = ${readerId}
        RETURNING user_id
      )
      INSERT INTO likes (page_id, user_id)
      SELECT ${pageId}, ${readerId}
      WHERE NOT EXISTS (SELECT 1 FROM del)
    `;

    return true;
  } catch(error) {
    console.error("SWW: ", error);
    return false;
  }
}
{/* like series end */}

{/* subscribe start */}
const IsSubscribingParamSchema = UserSchema.shape.user_id;
type IsSubscribingParam = z.infer<typeof IsSubscribingParamSchema>;
const IsSubscribingRetSchema = z.boolean();
type IsSubscribingRet = z.infer<typeof IsSubscribingRetSchema>;
export const isSubscribingASF = async (param: IsSubscribingParam): Promise<IsSubscribingRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      return false;
    }

    const parsedParam = IsSubscribingParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return false;
    }

    const readerId = reader.user_id;
    const authorId = parsedParam.data;

    const ret = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM subscribes 
        WHERE user_id_subscribed = ${authorId} AND user_id_subscribing = ${readerId}
      ) AS is_liking
    `;

    if (ret.length !== 1) {
      console.error("invalid ret: ", ret);
      return false;
    }

    const parsedRet = IsSubscribingRetSchema.safeParse(ret[0].is_liking);
    if (!parsedRet.success) {
      console.error("invalid ret: ", parsedRet.error);
      return false;
    }

    return parsedRet.data;
  } catch(error) {
    console.error(error);
    return false;
  }
}

const ToggleSubscribeParamSchema = UserSchema.shape.user_id;
type ToggleSubscribeParam = z.infer<typeof ToggleSubscribeParamSchema>;
export type ToggleSubscribeRet = boolean | null;
export const toggleSubscribeASF = async (param: ToggleSubscribeParam): Promise<ToggleSubscribeRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      console.error(UNAUTHENTICATED_ERROR, reader);
      return null;
    }

    const parsedParam = ToggleSubscribeParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in subscribeASF", parsedParam.error);
      return false;
    }
  
    const authorId = parsedParam.data;
    const readerId = reader.user_id;

    await sql`
      WITH del AS (
        DELETE FROM subscribes 
        WHERE user_id_subscribed = ${authorId} AND user_id_subscribing = ${readerId}
        RETURNING user_id_subscribed
      )
      INSERT INTO subscribes (user_id_subscribed, user_id_subscribing)
      SELECT ${authorId}, ${readerId}
      WHERE NOT EXISTS (SELECT 1 FROM del)
    `;

    return true;
  } catch(error) {
    console.error("SWW in subscribeASF", error);
    return false;
  }
}

const GetSubscribesReqSchema = z.object({
  authorId: UserSchema.shape.user_id,
  edOrIng: z.enum(["subscribed", "subscribing"]),
});
export type GetSubscribesReq = z.infer<typeof GetSubscribesReqSchema>;

const GetSubscribesParamSchema = CQSchema.merge(GetSubscribesReqSchema);
export type GetSubscribesParam = z.infer<typeof GetSubscribesParamSchema>;

const GetSubscribeResSchema = z.object({
  profile_image_url: UserSchema.shape.profile_image_url,
  user_id: UserSchema.shape.user_id,
  reader_is_subscribing: z.boolean(),
  is_user: z.boolean()
});
export type GetSubscribeRes = z.infer<typeof GetSubscribeResSchema>;

const GetSubscribesRetSchema = CSSchema.merge(z.object({
  items: z.array(GetSubscribeResSchema)
}));
export type GetSubscribesRet = z.infer<typeof GetSubscribesRetSchema>;
export const getSubscribesASF = async (param: GetSubscribesParam): Promise<GetSubscribesRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();

    const parsedParam = GetSubscribesParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      throw new Error("invalid param: ");
    }

    const readerId = reader?.user_id ?? null;
    const { authorId, edOrIng, chunk, limit } = parsedParam.data;
    const offset = chunk * limit;

    const ret = edOrIng === "subscribing"
    ? await sql`
      WITH subscribing_users AS (
        SELECT u.user_id, u.profile_image_url, 
        CASE 
          WHEN reader_sub.user_id_subscribing IS NOT NULL THEN true
          ELSE false
        END AS reader_is_subscribing,
        CASE
          WHEN u.user_id = ${readerId} THEN true
          ELSE false
        END AS is_user
        FROM users u
        INNER JOIN subscribes user_sub ON user_sub.user_id_subscribing = ${authorId}
          AND u.user_id = user_sub.user_id_subscribed
        LEFT JOIN subscribes reader_sub ON reader_sub.user_id_subscribing = ${readerId}
        AND u.user_id = reader_sub.user_id_subscribed
        ORDER BY u.wrote_at DESC, u.user_id
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT *
              FROM subscribing_users
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM subscribing_users
    ` : await sql `
      WITH subscribed_users AS (
        SELECT u.user_id, u.profile_image_url, 
        CASE 
          WHEN reader_sub.user_id_subscribing IS NOT NULL THEN true
          ELSE false
        END AS reader_is_subscribing,
        CASE
          WHEN u.user_id = ${readerId} THEN true
          ELSE false
        END AS is_user
        FROM users u
        INNER JOIN subscribes user_sub ON user_sub.user_id_subscribed = ${authorId}
          AND u.user_id = user_sub.user_id_subscribing
        LEFT JOIN subscribes reader_sub ON reader_sub.user_id_subscribing = ${readerId}
        AND u.user_id = reader_sub.user_id_subscribed
        ORDER BY u.wrote_at DESC, u.user_id
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT *
              FROM subscribed_users
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM subscribed_users
    `;
    
    const parsedRet = GetSubscribesRetSchema.safeParse({
      items: ret[0].results,
      totalCount: ret[0].total_count,
      hasNextChunk: offset + ret[0].results.length < ret[0].total_count
    });
    
    if (!parsedRet.success) {
      console.error("invalid ret: ", parsedRet.error);
      throw new Error("invalid ret: ");
    }

    return parsedRet.data;
  } catch(error) {
    console.error("SWW: ", error);
    throw new Error("Failed to get subscribes.");
  }
};
{/* subscribe end */}

{/* is author series start */}
// is author series: is author
const IsAuthorParamSchema = UserSchema.shape.user_id;
type IsAuthorParam = z.infer<typeof IsAuthorParamSchema>;
const IsAuthorRetSchema = z.boolean();
export type IsAuthorRet = z.infer<typeof IsAuthorRetSchema>;
export const isAuthorASF = async (param: IsAuthorParam): Promise<IsAuthorRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      return false;
    }

    const parsedParam = IsAuthorParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return false;
    }
  
    const readerId = reader.user_id;
    const authorId = parsedParam.data;

    const ret = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM users 
        WHERE user_id = ${authorId} AND user_id = ${readerId}
      ) AS is_author
    `;

    if (ret.length !== 1) {
      console.error("invalid ret length: ", ret);
      return false;
    }

    const parsedRet = IsAuthorRetSchema.safeParse(ret[0].is_author);
    if (!parsedRet.success) {
      console.error("invalid ret: ", ret);
      return false;
    }

    return parsedRet.data;
  } catch(error) {
    console.error("SWW: ", error);
    return false;
  }
}

// is author series: is book author
const IsBooAuthorParamSchema = BookSchema.shape.book_id;
type IsBooAuthorParam = z.infer<typeof IsBooAuthorParamSchema>;
const IsBooAuthorRetSchema = z.boolean();
export type IsBooAuthorRet = z.infer<typeof IsBooAuthorRetSchema>;
export const isBooAuthorASF = async (param: IsBooAuthorParam): Promise<IsBooAuthorRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      return false;
    }

    const parsedParam = IsBooAuthorParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in isReaderIsAuthorASF", parsedParam.error);
      return false;
    }
  
    const bookId = parsedParam.data;
    const readerId = reader.user_id;

    const ret = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM books 
        WHERE book_id = ${bookId} AND user_id = ${readerId}
      ) AS is_reader_is_author
    `;

    if (ret.length !== 1) {
      console.error("invalid ret length in isReaderIsAuthorASF", ret);
      return false;
    }

    const parsedRet = IsBooAuthorRetSchema.safeParse(ret[0].is_reader_is_author);
    if (!parsedRet.success) {
      console.error("invalid ret in isReaderIsAuthorASF", ret);
      return false;
    }

    return parsedRet.data;
  } catch(error) {
    console.error("SWW in isReaderIsAuthorASF", error);
    return false;
  }
}

// is author series: is page author
const IsPagAuthorParamSchema = PageSchema.shape.page_id;
type IsPagAuthorParam = z.infer<typeof IsPagAuthorParamSchema>;
const IsPagAuthorRetSchema = z.boolean();
export type IsPagAuthorRet = z.infer<typeof IsPagAuthorRetSchema>;
export const isPagAuthorASF = async (param: IsPagAuthorParam): Promise<IsPagAuthorRet> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      return false;
    }

    const parsedParam = IsPagAuthorParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return false;
    }
  
    const readerId = reader.user_id;
    const pageId = parsedParam.data;

    const ret = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM pages 
        WHERE page_id = ${pageId} AND user_id = ${readerId}
      ) AS is_author
    `;

    if (ret.length !== 1) {
      console.error("invalid ret: ", ret);
      return false;
    }

    const parsedRet = IsPagAuthorRetSchema.safeParse(ret[0].is_author);
    if (!parsedRet.success) {
      console.error("invalid ret: ", ret);
      return false;
    }

    return parsedRet.data;
  } catch(error) {
    console.error("SWW: ", error);
    return false;
  }
}
{/* is author series end */}

{/* get slips series start */}
// get subscribing slips
export const getSubSlipsASF = async (param: CQ): Promise<GetSlipsRet> => {
  'use server';
  
  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      console.error(UNAUTHENTICATED_ERROR, reader);
      return {
        items: [],
        hasNextChunk: false
      }
    }
    
    const parseParam = CQSchema.safeParse(param);
    if (!parseParam.success) {
      console.error("invalid param: ", parseParam.error);
      throw new Error("invalid param");
    }

    const readerId = reader.user_id;
    const { chunk, limit } = parseParam.data;
    const offset = chunk * limit;

    const ret = await sql`
      SELECT p.page_id, p.title, p.preview, p.view, p."like", p.updated_at::TEXT, u.user_id, u.profile_image_url,
        COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
      FROM pages p
      JOIN subscribes s ON p.user_id = s.user_id_subscribed
      JOIN users u ON p.user_id = u.user_id
      WHERE s.user_id_subscribing = ${readerId}
      ORDER BY p.updated_at DESC, p.page_id ASC
      OFFSET ${offset}
      LIMIT ${limit}
    `;
    
    const parsedRet = GetSlipsRetSchema.safeParse({
      items: ret,
      hasNextChunk: ret.length === limit
    });
    if (!parsedRet.success) {
      console.error("invalid ret: ", parsedRet.error);
      throw new Error("invalid ret");
    }
    
    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch subscribing slips', error);
    throw new Error('Failed to fetch subscribing slips');
  }
};

// get like slips
export const getLikSlipsASF = async (param: CQ): Promise<GetSlipsRet> => {
  'use server';
  
  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      console.error(UNAUTHENTICATED_ERROR, reader);
      return {
        items: [],
        hasNextChunk: false
      }
    }
    
    const parseParam = CQSchema.safeParse(param);
    if (!parseParam.success) {
      console.error("invalid param: ", parseParam.error);
      throw new Error("invalid param");
    }

    const readerId = reader.user_id;
    const { chunk, limit } = parseParam.data;
    const offset = chunk * limit;

    const ret = await sql`
      SELECT p.page_id, p.title, p.preview, p.view, p."like", p.updated_at::TEXT, u.user_id, u.profile_image_url,
        COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
      FROM pages p
      JOIN likes l ON p.page_id = l.page_id
      JOIN users u ON p.user_id = u.user_id
      WHERE l.user_id = ${readerId}
      ORDER BY p.updated_at DESC, p.page_id ASC
      OFFSET ${offset}
      LIMIT ${limit}
    `;
    
    const parsedRet = GetSlipsRetSchema.safeParse({
      items: ret,
      hasNextChunk: ret.length === limit
    });
    if (!parsedRet.success) {
      console.error("invalid ret: ", parsedRet.error);
      throw new Error("invalid ret");
    }
    
    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch like slips', error);
    throw new Error('Failed to fetch like slips');
  }
};
{/* get slips series end */}

{/* is new series start */}
// is new subscribing pages
export const isNewSubASF = async (): Promise<boolean> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      return false;
    }

    const readerId = reader.user_id;

    const res = await sql`
      WITH uu AS (
        UPDATE users
        SET sub_visited_at = CURRENT_TIMESTAMP
        WHERE user_id = ${readerId}
        RETURNING (SELECT sub_visited_at FROM users WHERE user_id = ${readerId}) AS old_sub_visited_at
      )
      SELECT CASE 
        WHEN EXISTS (
          SELECT 1
          FROM users u
          JOIN subscribes s ON u.user_id = s.user_id_subscribing
          JOIN pages p ON s.user_id_subscribed = p.user_id
          WHERE u.user_id = ${readerId}
          AND p.updated_at > (SELECT old_sub_visited_at FROM uu)
        ) THEN true
        ELSE false
      END AS is_new_subscrbing_pages
    `;

    if (res[0].is_new_subscrbing_pages === true) return true;
    return false;
  } catch (error) {
    console.error("SWW: ", error);
    return false;
  }
}

// is new like pages
export const isNewLikASF = async (): Promise<boolean> => {
  "use server";

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      return false;
    }

    const readerId = reader.user_id;

    const res = await sql`
      WITH uu AS (
        UPDATE users
        SET like_visited_at = CURRENT_TIMESTAMP
        WHERE user_id = ${readerId}
        RETURNING (SELECT like_visited_at FROM users WHERE user_id = ${readerId}) AS old_like_visited_at
      )
      SELECT CASE 
        WHEN EXISTS (
          SELECT 1
          FROM users u
          JOIN likes l ON u.user_id = l.user_id
          JOIN pages p ON l.page_id = p.page_id
          WHERE u.user_id = ${readerId}
          AND p.updated_at > (SELECT old_like_visited_at FROM uu)
        ) THEN true
        ELSE false
      END AS is_new_like_pages
    `;
    
    if (res[0].is_new_like_pages === true) return true;
    return false;
  } catch (error) {
    console.error("SWW: ", error);
    return false;
  }
}
{/* visited_at series end */}

{/* delete series start */}
// delete seires: delete book
const DeleteBookAndInPagesParamSchema = BookSchema.shape.book_id;
type DeleteBookAndInPagesParam = z.infer<typeof DeleteBookAndInPagesParamSchema>;
const DeleteBookAndInPagesRetSchema = BookSchema.shape.book_id.nullable();
export type DeleteBookAndInPagesRet = z.infer <typeof DeleteBookAndInPagesRetSchema>;
export const deleteBookAndInPagesASF = async (param: DeleteBookAndInPagesParam): Promise<DeleteBookAndInPagesRet> => {
  "use server";

  let successFlag = false;

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      console.error(UNAUTHENTICATED_ERROR, reader);
      return null;
    }

    const parsedParam = DeleteBookAndInPagesParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in deleteBookAndInPagesASF", parsedParam.error);
      return null;
    }
  
    const readerId = reader.user_id;
    const bookId = parsedParam.data;

    const ret = await sql`
      DELETE
      FROM books
      WHERE book_id = ${bookId}
        AND user_id = ${readerId}
      RETURNING book_id
    `;

    if (ret.length !== 1) {
      console.error("invalid ret length in deleteBookAndInPagesASF", ret);
      return null;
    }

    const parsedRet = DeleteBookAndInPagesRetSchema.safeParse(ret[0].book_id);
    if (!parsedRet.success) {
      console.error("invalid ret in deleteBookAndInPagesASF", parsedRet.error);
      return null;
    }

    successFlag = true;

    revalidatePath(`/@${readerId}/books/${bookId}`);
    revalidatePath(`/@${readerId}/books`);

    redirect(`/@${readerId}/books`);
  } catch(error) {
    if (error instanceof Error &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')) {

      throw error;
    }

    console.error("SWW in deleteBookAndInPagesASF", error);

    if (successFlag) {
      return param;
    }

    return null;
  }
}

// delete seires: delete page
const DeletePageParamSchema = PageSchema.shape.page_id;
type DeletePageParam = z.infer<typeof DeletePageParamSchema>;
const DeletePageRetSchema = PageSchema.shape.page_id.nullable();
export type DeletePageRet = z.infer <typeof DeletePageRetSchema>;
export const deletePageASF = async (param: DeletePageParam): Promise<DeletePageRet> => {
  "use server";

  let successFlag = false;

  try {
    const reader = await getAuthenticatedUserASF();
    if (!reader) {
      console.error(UNAUTHENTICATED_ERROR, reader);
      return null;
    }

    const parsedParam = DeletePageParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
      return null;
    }
  
    const readerId = reader.user_id;
    const pageId = parsedParam.data;

    const ret = await sql`
      DELETE
      FROM pages
      WHERE page_id = ${pageId}
        AND user_id = ${readerId}
      RETURNING page_id
    `;

    if (ret.length !== 1) {
      console.error("invalid ret length: ", ret);
      return null;
    }

    const parsedRet = DeletePageRetSchema.safeParse(ret[0].page_id);
    if (!parsedRet.success) {
      console.error("invalid ret: ", parsedRet.error);
      return null;
    }

    successFlag = true;
    revalidatePath(`/@${readerId}/${pageId}`);
    redirect(`/@${readerId}`);
  } catch(error) {
    if (error instanceof Error &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')) {

      throw error;
    }

    console.error("SWW: ", error);
    
    if (successFlag) {
      return param;
    }

    return null;
  }
}
{/* delete serires end */}
{/* neon end */}

{/* cloudinary start */}
// generate a sinature
export type GenSignatureSuccessRet = {
    success: true;
    message: string;

    cloudName: string;
    apiKey: string;
    signature: string;
    timestamp: string;
    asset_folder: string;
};
export type GenSignatureFailureRet = {
    success: false,
    message: string
};
export type GenSignatureRet = GenSignatureSuccessRet | GenSignatureFailureRet;
export const genSignatureSF = async (): Promise<GenSignatureRet> => {
    "use server";
    
    try {
      const user = await getAuthenticatedUserASF();
      if (!user || !user?.user_id) return {
        success: false,
        message: CREATE_PROFILE_IMAGE_SOMETHING_ERROR
      }

      const params = {
        timestamp: Math.round(new Date().getTime() / 1000).toString(),
        asset_folder: PROFILE_IMAGE_FOLDER_NAME
      };
      if (!process.env.CLOUDINARY_API_SECRET) throw new Error();
      const signature = cloudinary.utils.api_sign_request(
        params, 
        process.env.CLOUDINARY_API_SECRET
      );
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) throw new Error();

      return {
        success: true,
        message: UPLOADING_PROFILE_IMAGE,

        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        signature,
        ...params
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: CREATE_PROFILE_IMAGE_SOMETHING_ERROR
      }
    }
};

// delete profile image file
type DeleteProfileImageFileState = {
  success: boolean;
  message: string;
};
export const deleteProfileImageFileSF = async (): Promise<DeleteProfileImageFileState> => {
  "use server";
    
  try {
    const user = await getAuthenticatedUserASF();
    if (!user || !user?.user_id || !user.profile_image_url) return {
      success: false,
      message: DELETE_PROFILE_IMAGE_SOMETHING_ERROR
    }

    const profileImageUrlSegs = user.profile_image_url.split('/');
    const filenameWithExt = profileImageUrlSegs[profileImageUrlSegs.length - 1];
    const filename = filenameWithExt.split('.')[0];

    const res = await cloudinary.uploader.destroy(filename);

    if (res.result !== "ok") return {
      success: false,
      message: DELETE_PROFILE_IMAGE_SOMETHING_ERROR
    };
    
    return {
      success: true,
      message: DELETE_PROFILE_IMAGE_SUCCESS
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: DELETE_PROFILE_IMAGE_SOMETHING_ERROR
    }
  }
}
{/* cloudinary end */}