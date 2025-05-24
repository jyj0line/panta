"use server";

import { revalidatePath } from 'next/cache';
import type { User } from 'next-auth';
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import bcrypt from 'bcrypt';

import { auth } from '@/auth';
import { sql, logoutSF } from "@/app/lib/SFs/publicSFs";
import { type Page, UnhashedPasswordSchema, UserSchema, PageSchema, BookSchema, TagsSchema } from '@/app/lib/tables';

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
  FORBIDDEN_ERROR,

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
  } catch(_) {
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
  } catch (_) {
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
  } catch (_) {
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
  } catch (_) {
    return {
      success: false,
      message: DELETE_PROFILE_IMAGE_SOMETHING_ERROR
    }
  }
}

// delete user
const DeleteUserParamSchema = z.object({
  pw: UnhashedPasswordSchema,
  isChecked: z.boolean().refine((v) => v === true, {
    message: DELETE_ACCOUNT_UNCHECKED_ERROR,
  }),
});
type DeleteUserParam = z.infer<typeof DeleteUserParamSchema>;
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
  } catch(_) {
    return ({
      success: false,
      message: SOMETHING_WENT_WRONG_ERROR
    });
  } 
}


// write start
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
      console.error(parsedParam);
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
  tag_ids: TagsSchema.shape.tag_ids
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
      console.error(parsedParam);
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

const SelectWriteBooksRetSchema = z.array(BookSchema.pick({ book_id: true, book_title: true }))
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
      console.error(INVALID_INPUT_ERROR, parsedParam);
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
      console.error(CREATE_PAGE_SOMETHING_ERROR, parsedReturnedPageId);
      return {
        success: false,
        message: CREATE_PAGE_SOMETHING_ERROR
      }
    }

    return {
      success: true,
      message: CREATE_PAGE_SUCCESS,
      page_id: parsedReturnedPageId.data
    };
  } catch (error) {
    console.error(CREATE_PAGE_SOMETHING_ERROR, error);
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
      console.error(INVALID_INPUT_ERROR, parsedParam);
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
        SET title = ${title}, preview = ${preview}, content = ${content}, book_id = ${book_id}
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
      console.error(UPDATE_PAGE_SOMETHING_ERROR, parsedReturnedPageId);
      return {
        success: false,
        message: UPDATE_PAGE_SOMETHING_ERROR
      }
    }

    successFlag = true;
    revalidatePath(`/${user.user_id}/${page_id}`);

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
// write end

const SubscribeParamSchema = z.object({
  userId: UserSchema.shape.user_id,
  authorId: UserSchema.shape.user_id
});
type SubscribeParam = z.infer<typeof SubscribeParamSchema>;
const SubscribeRetSchema = z.boolean();
export type SubscribeRet = z.infer<typeof SubscribeRetSchema>;
export const subscribeToggleSF = async (param: SubscribeParam): Promise<SubscribeRet> => {
  "use server";

  try{
    const parsedParam = SubscribeParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in subscribeSF", parsedParam);
      return false;
    }
  
    const { userId, authorId } = parsedParam.data;
    console.log(parsedParam.data)
    const ret = await sql`
      WITH del AS (
    DELETE FROM subscribes 
    WHERE user_id_subscribed = ${authorId} AND user_id_subscribing = ${userId}
    RETURNING user_id_subscribed
  )
  INSERT INTO subscribes (user_id_subscribed, user_id_subscribing)
  SELECT ${authorId}, ${userId}
  WHERE NOT EXISTS (SELECT 1 FROM del)
      `;
      console.log(ret);
    return true;
  } catch(error) {
    console.log(error);
    return false;
  }
}

{/*
  if (ret.length === 0) {
        return {
          success: false,
          errorCode: ERROR_CODE.NOT_FOUND
        }
      }
  
      const parsedRet = GetAuthorCardDataRetSchema.safeParse(ret[0]);
      if (ret.length !== 1 || !parsedRet.success) {
        console.error("invalid ret in getAuthorCardDataSF", parsedRet);
        return {
          success: false,
          errorCode: ERROR_CODE.INVALID_DATA
        }
      }
  
      return {
        success: true,
        authorCardData: parsedRet.data
      }
    } catch(error) {
      console.error("Something went wrong in getAuthorCardDataSF", error);
      return {
        success: false,
        errorCode: ERROR_CODE.NETWORK_PROBLEM
      };
    }
  */}
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
    } catch (_) {
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
  } catch (_) {
    return {
      success: false,
      message: DELETE_PROFILE_IMAGE_SOMETHING_ERROR
    }
  }
}
{/* cloudinary end */}