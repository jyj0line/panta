"use server";

import { AuthError } from 'next-auth';
import { neon, DatabaseError} from "@neondatabase/serverless";
import { z } from "zod";
import bcrypt from 'bcrypt';

import { signIn, signOut } from '@/auth';
import {
  UserSchema,PageSchema, TagSchema, TagsSchema, BookSchema,
  UnhashedPasswordSchema, DateStringParamSchema, DateStringRetSchema,
} from '@/app/lib/tables';
import {
  OrderCriticSchema, OrderDirectionSchema,
  CQSchema, type CQ,
  CSSchema,
  GetSlipsResSchema, GetSlipsRetSchema, type GetSlipsRet,
} from "@/app/lib/utils";

import { type ErrorCode, ERROR_CODE, SUCCESS, ERROR, COMMON } from '@/app/lib/constants';

const {
  SIGN_UP_SUCCESS,

  LOG_IN_SUCCESS,

  LOG_OUT_SUCCESS
} = SUCCESS;
const {
  USER_ID_SOMETHING_ERROR: USER_ID_SOMETHING,
  USER_ID_DUPLICATION_ERROR: USER_ID_DUPLICATION,

  UNHASHED_PASSWORD_FOR_CONFIRM_DIFF_ERROR: UNHASHED_PASSWORD_FOR_CONFIRM_DIFF,

  SIGN_UP_SOMETHING_ERROR: SIGN_UP_SOMETHING,
  SIGN_UP_INPUT_ERROR: SIGN_UP_INPUT,

  LOG_IN_SOMETHING_ERROR: LOG_IN_SOMETHING,
  LOG_IN_CREDENTIAL_ERROR: LOG_IN_CREDENTIAL,

  LOG_OUT_SOMETHING_WENT_WRONG_ERROR
} = ERROR;
const {
  SALT_OR_ROUNDS
} = COMMON;

// neon connection
const getNeonConnection = async () => {
  'use server';

  if (!process.env.DATABASE_URL) {
    throw new Error();
  }
  return neon(process.env.DATABASE_URL);
};
export const sql = await getNeonConnection();

// validate user ID
const ValidateUserIdParamSchema = UserSchema.shape.user_id;
type ValidateUserIdParam = z.infer<typeof ValidateUserIdParamSchema>;
export const validateUserIdSF = async (user_id: ValidateUserIdParam): Promise<string[]> => {
  'use server';

  const parsedUserId = ValidateUserIdParamSchema.safeParse(user_id);
  if (!parsedUserId.success) {
    return parsedUserId.error.errors.map(e => e.message);
  }

  try {
    const res = await sql`
      SELECT user_id
      FROM users
      WHERE user_id = ${parsedUserId.data}
    `;

    if (res.length !== 0) {
      return [USER_ID_DUPLICATION];
    }

    return [];
  } catch (error) {
    console.error(error);
    return [USER_ID_SOMETHING];
  }
};

// sign up
const SignUpParamSchema = z.object({
  ...UserSchema.pick({
    user_id: true,
    bio: true
  }).shape,
  unhashed_password: UnhashedPasswordSchema
});
export type SignUpFormInputsState = {
  user_id?: string[],
  unhashed_password?: string[],
  unhashed_password_for_confirm?: string[],
  bio?: string[]
};
export type SignUpState = {
  success: true;
  message: string;
} | {
  success: false;
  message: string;
  errors?: SignUpFormInputsState
};
export const signUpSF = async (formData: FormData): Promise<SignUpState> => {
  'use server';

  const parsedFormData = SignUpParamSchema.safeParse({
    user_id: formData.get('user_id'),
    unhashed_password: formData.get('unhashed_password'),
    bio: formData.get('bio')
  });
  if (!parsedFormData.success) {
    return {
      success: false,
      message: SIGN_UP_INPUT,
      errors: parsedFormData.error.flatten().fieldErrors
    }
  }
  const { user_id, unhashed_password, bio } = parsedFormData.data;

  if (unhashed_password !== formData.get('unhashed_password_for_confirm')) {
    return {
      success: false,
      message: SIGN_UP_INPUT,
      errors: { unhashed_password_for_confirm: [UNHASHED_PASSWORD_FOR_CONFIRM_DIFF]}
    }
  }

  const hashed_password = await bcrypt.hash(unhashed_password, SALT_OR_ROUNDS);
  try {
    await sql`
      INSERT INTO users (user_id, hashed_password, bio)
      VALUES (${user_id}, ${hashed_password}, ${bio})
    `;

    return {
      success: true,
      message: SIGN_UP_SUCCESS
    }
  } catch (error) {
    if (error instanceof DatabaseError
      && error.code === '23505'
      && error.detail?.includes('user_id')
    ) {
      return {
        success: false,
        message: SIGN_UP_INPUT,
        errors: { user_id: [USER_ID_DUPLICATION] }
      }
    }

    return {
      success: false,
      message: SIGN_UP_SOMETHING
    }
  }
};

// log in
export type LoginState = {
  success: boolean;
  message: string;
};
export const loginSF = async (formData: FormData): Promise<LoginState> => {
  "use server";

  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false,
    })

    return {
      success: true,
      message: SIGN_UP_SUCCESS
    }
  } catch (error) {
    if (error instanceof AuthError && error.type === 'CredentialsSignin') {
      return {
        success: false,
        message: LOG_IN_CREDENTIAL
      }
    }
    return {
      success: false,
      message: LOG_IN_SOMETHING
    }
  }
};
export const loginRedirectSF = async (prevState: LoginState | undefined, formData: FormData): Promise<LoginState> => {
  "use server";

  try {
    await signIn('credentials', formData);

    // not used but for serializable return type
    return {
      success: true,
      message: LOG_IN_SUCCESS
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            message: LOG_IN_CREDENTIAL
          };
        default:
          return {
            success: false,
            message: LOG_IN_SOMETHING
          };
      }
    }
    throw error;
  }
};

// logout
type LogoutState = {
  success: boolean;
  message: string;
}
export const logoutSF = async (): Promise<LogoutState> => {
  "use server";
  
  try {
    await signOut({ redirect: false });
    return {
      success: true,
      message: LOG_OUT_SUCCESS
    }
  } catch(error) {
    console.error(error);
    return {
      success: false,
      message: LOG_OUT_SOMETHING_WENT_WRONG_ERROR
    }
  }
};
type LogoutRedirectState = {
  success: false;
  message: string;
} | void;
export const logoutRedirectSF = async (): Promise<LogoutRedirectState> => {
  "use server";
  
  try {
    await signOut({ redirectTo: '/' });
  } catch(error) {
    if (error instanceof Error &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error(error);
    return;
  }
};

// isExistent series start
const IsExistentUserIdParamSchema = UserSchema.shape.user_id;
type IsExistentUserIdParam = z.infer<typeof IsExistentUserIdParamSchema>;
const IsExistentUserIdRetSchema = z.boolean();
type IsExistentUserIdRet = z.infer<typeof IsExistentUserIdRetSchema>;
export const isExistentUserIdSF = async (param: IsExistentUserIdParam): Promise<IsExistentUserIdRet> => {
  "use server";

  try {
    const parsedParam = IsExistentUserIdParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in isExistentUserId", parsedParam.error);
      return false;
    }

    const res = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM users
        WHERE user_id = ${parsedParam.data}
      ) AS is_existent
    `;

    if (res.length !== 1) {
      return false;
    }

    const parsedRet = IsExistentUserIdRetSchema.safeParse(res[0].is_existent);
    if (!parsedRet.success) {
      console.error("invalid ret in isExistentUserId", res);
      return false;
    }

    return parsedRet.data;
  } catch(error) {
    console.error("Something went wrong in isExistentUserId", error);
    return false;
  }
}

const IsExistentBookIdParamSchema = BookSchema.shape.book_id;
type IsExistentBookIdParam = z.infer<typeof IsExistentBookIdParamSchema>;
const IsExistentBookIdRetSchema = z.boolean();
type IsExistentBookIdRet = z.infer<typeof IsExistentBookIdRetSchema>;
export const isExistentBookIdSF = async (param: IsExistentBookIdParam): Promise<IsExistentBookIdRet> => {
  "use server";

  try {
    const parsedParam = IsExistentBookIdParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in isExistentBookId", parsedParam.error);
      return false;
    }

    const res = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM books
        HERE book_id = ${parsedParam.data}
      ) AS is_existent
    `;

    if (res.length !== 1) {
      return false;
    }

    const parsedRet = IsExistentBookIdRetSchema.safeParse(res[0].is_existent);
    if (!parsedRet.success) {
      console.error("invalid ret in isExistentBookId", res);
      return false;
    }

    return parsedRet.data;
  } catch(error) {
    console.error("Something went wrong in isExistentBookId", error);
    return false;
  }
}

const GetPageTitleParamSchema = PageSchema.shape.page_id;
type GetPageTitleParam = z.infer<typeof GetPageTitleParamSchema>;
const GetPageTitleRetSchema = PageSchema.shape.title.nullable();
type GetPageTitleRet = z.infer<typeof GetPageTitleRetSchema>;
export const getPageTitleSF = async (param: GetPageTitleParam): Promise<GetPageTitleRet> => {
  "use server";

  try {
    const parsedParam = GetPageTitleParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in getPageTitleSF", parsedParam.error);
      return null;
    }

    const validPageId = parsedParam.data;
    
    const ret = await sql`
      SELECT title
      FROM pages
      WHERE page_id = ${validPageId}
    `

    if (ret.length !== 1) {
      console.error("invalid ret in getPageTitleSF", ret);
      return null;
    }

    const parsedRet = GetPageTitleRetSchema.safeParse(ret[0].title);
    if (!parsedRet.success) {
      console.error("invalid ret in getPageTitleSF", parsedRet.error);
      return null;
    }

    return parsedRet.data;
  } catch(error) {
    console.error("Something went wrong in getPageTitleSF", error);
    return null;
  }
}
// isExistent series end

const GetAuthorCardDataParamSchema = UserSchema.shape.user_id;
type GetAuthorCardDataParam = z.infer<typeof GetAuthorCardDataParamSchema>;
const GetAuthorCardDataRetSchema = z.object({
    ...UserSchema.pick({
    bio: true,
    profile_image_url: true,
    }).shape,
    subscribed_count: z.number().int().nonnegative(),
    subscribing_count: z.number().int().nonnegative()
});
export type GetAuthorCardDataRet = z.infer<typeof GetAuthorCardDataRetSchema>;
type GetAuthorCardDataSuccessState = {
  success: true;
  authorCardData: GetAuthorCardDataRet;
};
type GetAuthorCardDataFailureState = {
  success: false;
  errorCode: ErrorCode;
};
export type GetAuthorCardDataState = GetAuthorCardDataSuccessState | GetAuthorCardDataFailureState;
export const getAuthorCardDataSF = async (param: GetAuthorCardDataParam): Promise<GetAuthorCardDataState> => {
  "use server";

  try {
    const parsedParam = GetAuthorCardDataParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in getAuthorCardDataSF", parsedParam.error);
      return {
        success: false,
        errorCode: ERROR_CODE.INVALID_DATA
      }
    }

    const authorId = parsedParam.data;

    const ret = await sql`
      SELECT
        bio,
        profile_image_url,
        (SELECT COUNT(*)::int FROM subscribes WHERE user_id_subscribing = ${authorId}) AS subscribing_count,
        (SELECT COUNT(*)::int FROM subscribes WHERE user_id_subscribed = ${authorId}) AS subscribed_count
      FROM users
      WHERE user_id = ${authorId}
    `;

    if (ret.length === 0) {
      return {
        success: false,
        errorCode: ERROR_CODE.NOT_FOUND
      }
    }

    const parsedRet = GetAuthorCardDataRetSchema.safeParse(ret[0]);
    if (!parsedRet.success || ret.length !== 1 ) {
      console.error("invalid ret in getAuthorCardDataSF", parsedRet.error);
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
}

const GetAuthorCrumbDataParamSchema = UserSchema.shape.user_id;
type GetAuthorCrumbDataParam = z.infer<typeof GetAuthorCrumbDataParamSchema>;
const GetAuthorCrumbDataRetSchema = UserSchema.pick({
  user_id: true,
  profile_image_url: true
});
export type GetAuthorCrumbDataRet = z.infer<typeof GetAuthorCrumbDataRetSchema>;
type GetAuthorCrumbDataSuccessState = {
  success: true,
  authorCrumbData: GetAuthorCrumbDataRet
}
type GetAuthorCrumbDataFailureState = {
  success: false,
  errorCode: ErrorCode
}
type GetAuthorCrumbDataState = GetAuthorCrumbDataSuccessState | GetAuthorCrumbDataFailureState;
export const getAuthorCrumbDataSF = async (param: GetAuthorCrumbDataParam): Promise<GetAuthorCrumbDataState> => {
  "use server";

  try {
    const parsedParam = GetAuthorCrumbDataParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in getAuthorCrumbDataSF", parsedParam.error);
      return {
        success: false,
        errorCode: ERROR_CODE.INVALID_DATA
      }
    }

    const authorId = parsedParam.data;

    const ret = await sql`
      SELECT user_id, profile_image_url
      FROM users
      WHERE user_id = ${authorId}
    `;

    if (ret.length === 0) {
      return {
        success: false,
        errorCode: ERROR_CODE.NOT_FOUND
      }
    }

    const parsedRet = GetAuthorCrumbDataRetSchema.safeParse(ret[0]);
    if (!parsedRet.success || ret.length !== 1 ) {
      console.error("invalid ret in getAuthorCrumbDataSF", parsedRet.error);
      return {
        success: false,
        errorCode: ERROR_CODE.INVALID_DATA
      }
    }

    return {
      success: true,
      authorCrumbData: parsedRet.data
    }
  } catch(error) {
    console.error("Something went wrong in getAuthorCrumbDataSF", error);
    return {
      success: false,
      errorCode: ERROR_CODE.NETWORK_PROBLEM
    };
  }
};






// chunked series: get slips start
// chunked series: get slips: get trend slips
export const getTreSlipsSF = async (param: CQ): Promise<GetSlipsRet> => {
  'use server';
  
  try {
    const parseParam = CQSchema.safeParse(param);
    if (!parseParam.success) {
      console.error("invalid param: ", parseParam.error);
      throw new Error("invalid param");
    }

    const { chunk, limit } = parseParam.data;
    const offset = chunk * limit;

    const ret = await sql`
      SELECT wp.page_id, p.title, p.preview, p.view, p."like", p.created_at::TEXT, u.user_id, u.profile_image_url,
        COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = wp.page_id), ARRAY[]::TEXT[]) AS tag_ids
      FROM weekly_pages wp
      JOIN pages p ON wp.page_id = p.page_id
      JOIN users u ON p.user_id = u.user_id
      ORDER BY wp.view DESC, wp.page_id ASC
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
    console.error('Failed to fetch trend slips', error);
    throw new Error('Failed to fetch trend slips');
  }
};

// chunked serires: get slips: simple search
const GetSlipsSimReqSchema = z.object({
  searchType: z.literal("simple"),
  search: z.string().max(COMMON.SEARCH_MAX),
  orderCritic: OrderCriticSchema.default("rank")
});
export type GetSlipsSimReq = z.infer<typeof GetSlipsSimReqSchema>;

const GetSlipsDetReqSchema = z.object({
  searchType: z.literal("detailed"),
  search: z.string().max(COMMON.SEARCH_MAX),
  orderCritic: OrderCriticSchema.default("rank"),

  user_ids: z.array(UserSchema.shape.user_id),
  tag_ids: TagsSchema,

  created_at_from: DateStringParamSchema,
  created_at_to: DateStringParamSchema
});
export type GetSlipsDetReq = z.infer<typeof GetSlipsDetReqSchema>;

export type GetSlipsReq = GetSlipsSimReq | GetSlipsDetReq;

const GetSlipsSimParamSchema = CQSchema.merge(GetSlipsSimReqSchema);
export type GetSlipsSimParam = z.infer<typeof GetSlipsSimParamSchema>;
export const getSlipsSimSF = async (param: GetSlipsSimParam): Promise<GetSlipsRet> => {
  'use server';

  try {
    const parsedParam = GetSlipsSimParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getSimpleSearchResultsSF", parsedParam.error);
      throw new Error("invalid in getSimpleSearchResultsSF");
    }

    const { search, orderCritic, chunk, limit } = parsedParam.data;
    const offset = chunk * limit;
    
    if (!search) {
      console.error("invalid search keys in getSimpleSearchResultsSF", parsedParam.data);
      throw new Error("invalid search keys ");
    }

    const ret = orderCritic === 'rank'
    ? await sql`
      WITH filtered_pages AS (
        SELECT p.page_id, p.user_id, p.title, p.preview, p.view, p."like", p.created_at,
          COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids,
          ts_rank(p.full_text_search, websearch_to_tsquery(${search})) AS rank
        FROM pages p
        WHERE p.full_text_search @@ websearch_to_tsquery(${search})
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.tag_ids, fp.user_id, u.profile_image_url
              FROM filtered_pages fp
              JOIN users u ON fp.user_id = u.user_id
              ORDER BY fp.rank DESC, fp.page_id ASC
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
      )
      SELECT COUNT(*)::int AS total_count, 
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.tag_ids, fp.user_id, u.profile_image_url
              FROM filtered_pages fp
              JOIN users u ON fp.user_id = u.user_id
              ORDER BY fp.created_at DESC, fp.page_id ASC
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM filtered_pages
    `;

    const parsedRet = GetSlipsRetSchema.safeParse({
      items: ret[0].results,
      totalCount: ret[0].total_count,
      hasNextChunk: offset + ret[0].results.length < ret[0].total_count
    });

    if (!parsedRet.success) {
      console.error("invalid in getSimpleSearchResultsSF", parsedRet.error);
      throw new Error("invalid in getSimpleSearchResultsSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch search results', error);
    throw new Error('Failed to fetch search results');
  }
}

// chunked serires: get slips: detailed search
const GetSlipsDetParamSchema = CQSchema.merge(GetSlipsDetReqSchema);
export type GetSlipsDetParam = z.infer<typeof GetSlipsDetParamSchema>;
export const getSlipsDetSF = async (param: GetSlipsDetParam): Promise<GetSlipsRet> => {
  'use server';
  
  try {
    const parsedParam = GetSlipsDetParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getDetailedSearchResultsSF", parsedParam.error);
      throw new Error("invalid in getDetailedSearchResultsSF");
    }

    const { search, tag_ids, user_ids, created_at_from, created_at_to, orderCritic, chunk, limit } = parsedParam.data;
    const offset = chunk * limit;

    if (!search
      && tag_ids.length <= 0
      && user_ids.length <= 0
      && !created_at_from
      && !created_at_to
    ) {
      console.error("invalid search keys in getDetailedSearchResultsSF", parsedParam.data);
      throw new Error("invalid search keys");
    }
    
    const ret = orderCritic === 'rank'
    ? await sql`
      WITH filtered_pages AS (
        SELECT p.page_id, p.user_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at,
          COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids,
          ts_rank(p.full_text_search, websearch_to_tsquery(${search})) AS rank
        FROM pages p
        WHERE 
          (${!search} OR p.full_text_search @@ websearch_to_tsquery(${search}))
          AND (${tag_ids.length <= 0} OR EXISTS (
            SELECT 1 FROM pages_tags pt WHERE pt.page_id = p.page_id AND pt.tag_id = ANY(${tag_ids}::TEXT[])
          ))
          AND (${user_ids.length <= 0} OR p.user_id = ANY(${user_ids}::TEXT[]))
          AND (${!created_at_from} OR p.created_at >= ${created_at_from})
          AND (${!created_at_to} OR p.created_at <= ${created_at_to})
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.tag_ids, fp.user_id, u.profile_image_url
              FROM filtered_pages fp
              JOIN users u ON fp.user_id = u.user_id
              ORDER BY fp.rank DESC, fp.page_id ASC
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
          (${!search} OR p.full_text_search @@ websearch_to_tsquery(${search}))
          AND (${tag_ids.length <= 0} OR EXISTS (
            SELECT 1 FROM pages_tags pt WHERE pt.page_id = p.page_id AND pt.tag_id = ANY(${tag_ids}::TEXT[])
          ))
          AND (${user_ids.length <= 0} OR p.user_id = ANY(${user_ids}::TEXT[]))
          AND (${!created_at_from} OR p.created_at >= ${created_at_from})
          AND (${!created_at_to} OR p.created_at <= ${created_at_to})
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.tag_ids, fp.user_id, u.profile_image_url
              FROM filtered_pages fp
              JOIN users u ON fp.user_id = u.user_id
              ORDER BY fp.created_at DESC, fp.page_id ASC
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM filtered_pages
    `;

    const parsedRet = GetSlipsRetSchema.safeParse({
      items: ret[0].results,
      totalCount: ret[0].total_count,
      hasNextChunk: offset + ret[0].results.length < ret[0].total_count
    });

    if (!parsedRet.success) {
      console.error("invalid in getDetailedSearchResultsSF", parsedRet.error);
      throw new Error("invalid in getDetailedSearchResultsSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch search results', error);
    throw new Error('Failed to fetch search results');
  }
}

export const unifiedGetSlipsSF = async (req: GetSlipsSimParam | GetSlipsDetParam) => {
  "use server";

  if (req.searchType === "simple") {
    return await getSlipsSimSF(req);
  } else {
    return await getSlipsDetSF(req);
  }
};

// chunked serires: get slips: authorId's search
const GetSlipsAutSimReqSchema = z.object({
  ...GetSlipsSimReqSchema.shape,
  authorId: UserSchema.shape.user_id
});
export type GetSlipsAutSimReq = z.infer<typeof GetSlipsAutSimReqSchema>;

const GetSlipsAutDetReqSchema = z.object({
  ...GetSlipsDetReqSchema.omit({ user_ids: true }).shape,
  authorId: UserSchema.shape.user_id
});
export type GetSlipsAutDetReq = z.infer<typeof GetSlipsAutDetReqSchema>;

export type GetSlipsAutReq = GetSlipsAutSimReq | GetSlipsAutDetReq;

const GetSlipsAutResSchema = z.object({
  ...GetSlipsResSchema.omit({
    profile_image_url: true
  }).shape
});
export type GetSlipsAutRes = z.infer<typeof GetSlipsAutResSchema>;
const GetSlipsAutRetSchema = CSSchema.merge(z.object({
  items: z.array(GetSlipsAutResSchema)
}));
export type GetSlipsAutRet = z.infer<typeof GetSlipsAutRetSchema>;

// chunked serires: get slips: authorId's simple search
const GetSlipsAutSimParamSchema = CQSchema.merge(GetSlipsAutSimReqSchema);
export type GetSlipsAutSimParam = z.infer<typeof GetSlipsAutSimParamSchema>;
export const getSlipsAutSimSF = async (param: GetSlipsAutSimParam): Promise<GetSlipsAutRet> => {
  'use server';

  try {
    const parsedParam = GetSlipsAutSimParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getAutSimSearchSlipsDataSF", parsedParam.error);
      throw new Error("invalid in getAutSimSearchSlipsDataSF");
    }

    const { authorId, search, orderCritic, chunk, limit } = parsedParam.data;
    const offset = chunk * limit;
    
    let ret;

    if (!search) {
      ret = orderCritic === "rank"
      ? await sql`
        WITH user_pages AS (
          SELECT p.page_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at, p.user_id,
            COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
          FROM pages p
          WHERE p.user_id = ${authorId}
        )
        SELECT COUNT(*)::int AS total_count, 
          COALESCE(
            (SELECT json_agg(result)
              FROM (
                SELECT up.page_id, up.title, up.preview, up.view, up."like", up.created_at, up.user_id, up.tag_ids
                FROM user_pages up
                ORDER BY up.view DESC, up.page_id ASC
                OFFSET ${offset}
                LIMIT ${limit}
              ) result
            ),
            '[]'::json
          ) AS results
        FROM user_pages
      `: await sql`
        WITH user_pages AS (
          SELECT p.page_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at, p.user_id,
            COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
          FROM pages p
          WHERE p.user_id = ${authorId}
        )
        SELECT COUNT(*)::int AS total_count, 
          COALESCE(
            (SELECT json_agg(result)
              FROM (
                SELECT up.page_id, up.title, up.preview, up.view, up."like", up.created_at, up.user_id, up.tag_ids
                FROM user_pages up
                ORDER BY up.created_at DESC, up.page_id ASC
                OFFSET ${offset}
                LIMIT ${limit}
              ) result
            ),
            '[]'::json
          ) AS results
        FROM user_pages
      `;
    } else {
      ret = orderCritic === 'rank'
      ? await sql`
        WITH filtered_pages AS (
          SELECT p.page_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at, p.user_id,
            COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids,
            ts_rank(p.full_text_search, websearch_to_tsquery(${search})) AS rank
          FROM pages p
          WHERE p.full_text_search @@ websearch_to_tsquery(${search})
            AND p.user_id = ${authorId}
        )
        SELECT COUNT(*)::int AS total_count,
          COALESCE(
            (SELECT json_agg(result)
              FROM (
                SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.user_id, fp.tag_ids
                FROM filtered_pages fp
                ORDER BY fp.rank DESC, fp.page_id ASC
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
          SELECT p.page_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at, p.user_id,
            COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
          FROM pages p
          WHERE p.full_text_search @@ websearch_to_tsquery(${search})
            AND p.user_id = ${authorId}
        )
        SELECT COUNT(*)::int AS total_count, 
          COALESCE(
            (SELECT json_agg(result)
              FROM (
                SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.user_id, fp.tag_ids
                FROM filtered_pages fp
                ORDER BY fp.created_at DESC, fp.page_id ASC
                OFFSET ${offset}
                LIMIT ${limit}
              ) result
            ),
            '[]'::json
          ) AS results
        FROM filtered_pages
      `;
    }

    const parsedRet = GetSlipsAutRetSchema.safeParse({
      items: ret[0].results,
      totalCount: ret[0].total_count,
      hasNextChunk: offset + ret[0].results.length < ret[0].total_count
    });

    if (!parsedRet.success) {
      console.error("invalid in getAutSimSearchSlipsDataSF", parsedRet.error);
      throw new Error("invalid in getAutSimSearchSlipsDataSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch authorId search results', error);
    throw new Error('Failed to fetch authorId search results');
  }
}

// chunked serires: get slips: authorId's detailed search
const GetSlipsAutDetParamSchema = CQSchema.merge(GetSlipsAutDetReqSchema);
export type GetSlipsAutDetParam = z.infer<typeof GetSlipsAutDetParamSchema>;
export const getSlipsAutDetSF = async (param: GetSlipsAutDetParam): Promise<GetSlipsAutRet> => {
  'use server';
  
  try {
    const parsedParam = GetSlipsAutDetParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getAutDetSearchSlipsDataSF", parsedParam.error);
      throw new Error("invalid in getAutDetSearchSlipsDataSF");
    }

    const { authorId, search, tag_ids, created_at_from, created_at_to, orderCritic, chunk, limit } = parsedParam.data;
    const offset = chunk * limit;

    if (!search
      && tag_ids.length <= 0
      && !created_at_from
      && !created_at_to
    ) {
      console.error("invalid search keys in getAutDetSearchSlipsDataSF", parsedParam.data);
      throw new Error("invalid search keys in getAutDetSearchSlipsDataSF");
    }
    
    const ret = orderCritic === 'rank'
    ? await sql`
      WITH filtered_pages AS (
        SELECT p.page_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at, p.user_id,
          COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids,
          ts_rank(p.full_text_search, websearch_to_tsquery(${search})) AS rank
        FROM pages p
        WHERE 
          user_id = ${authorId}
          AND (${!search} OR p.full_text_search @@ websearch_to_tsquery(${search}))
          AND (${tag_ids.length <= 0} OR EXISTS (
            SELECT 1 FROM pages_tags pt WHERE pt.page_id = p.page_id AND pt.tag_id = ANY(${tag_ids}::TEXT[])
          ))
          AND (${!created_at_from} OR p.created_at >= ${created_at_from})
          AND (${!created_at_to} OR p.created_at <= ${created_at_to})
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.user_id, fp.tag_ids
              FROM filtered_pages fp
              ORDER BY fp.rank DESC, fp.page_id ASC
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
        SELECT p.page_id, p.title, p.preview, p.view, p."like", p.created_at::TIMESTAMP AS created_at, p.user_id,
          COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
        FROM pages p
        WHERE 
          user_id = ${authorId}
          AND (${!search} OR p.full_text_search @@ websearch_to_tsquery(${search}))
          AND (${tag_ids.length <= 0} OR EXISTS (
            SELECT 1 FROM pages_tags pt WHERE pt.page_id = p.page_id AND pt.tag_id = ANY(${tag_ids}::TEXT[])
          ))
          AND (${!created_at_from} OR p.created_at >= ${created_at_from})
          AND (${!created_at_to} OR p.created_at <= ${created_at_to})
      )
      SELECT COUNT(*)::int AS total_count,
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT fp.page_id, fp.title, fp.preview, fp.view, fp."like", fp.created_at, fp.user_id, fp.tag_ids
              FROM filtered_pages fp
              ORDER BY fp.created_at DESC, fp.page_id ASC
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM filtered_pages
    `;

    const parsedRet = GetSlipsAutRetSchema.safeParse({
      items: ret[0].results,
      totalCount: ret[0].total_count,
      hasNextChunk: offset + ret[0].results.length < ret[0].total_count
    });

    if (!parsedRet.success) {
      console.error("invalid in getAutDetSearchSlipsDataSF", parsedRet.error);
      throw new Error("invalid in getAutDetSearchSlipsDataSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error('Failed to fetch authorId search results', error);
    throw new Error('Failed to fetch authorId search results');
  }
}

export const unifiedGetSlipsAutSF = async (req: GetSlipsAutSimParam | GetSlipsAutDetParam) => {
  "use server";

  if (req.searchType === "simple") {
    return await getSlipsAutSimSF(req);
  } else {
    return await getSlipsAutDetSF(req);
  }
};

// chunked serires: get slips: book's pages
const GetSlipsBooReqSchema = z.object({
  bookId: BookSchema.shape.book_id,
  orderDirectioin: OrderDirectionSchema
});
export type GetSlipsBooReq = z.infer<typeof GetSlipsBooReqSchema>;

const GetSlipsBooParamSchema = CQSchema.merge(GetSlipsBooReqSchema);
export type GetSlipsBooParam = z.infer<typeof GetSlipsBooParamSchema>;

const GetSlipsBooResSchema = z.object({
  ...GetSlipsResSchema.omit({
    profile_image_url: true,

    tag_ids: true,

    view: true,
    like: true,
  }).shape
});
export type GetSlipsBooRes = z.infer<typeof GetSlipsBooResSchema>;

const GetSlipsBooRetSchema = CSSchema.merge(z.object({
  items: z.array(GetSlipsBooResSchema)
}));
export type GetSlipsBooRet = z.infer<typeof GetSlipsBooRetSchema>;

export const getSlipsBooSF = async (param: GetSlipsBooParam): Promise<GetSlipsBooRet> => {
  'use server';

  try {
    const parsedParam = GetSlipsBooParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getSlipsBooSF", parsedParam.error);
      throw new Error("invalid in getSlipsBooSF");
    }

    const { bookId, orderDirectioin, chunk, limit } = parsedParam.data;
    const offset = chunk * limit;
    
    const ret = orderDirectioin === 'desc'
    ? await sql`
      WITH book_pages AS (
        SELECT p.page_id, p.title, p.preview, p.created_at::TIMESTAMP AS created_at, p.user_id
        FROM pages p
        JOIN books b ON p.book_id = b.book_id
        WHERE b.book_id = ${bookId}
      )
      SELECT COUNT(*)::int AS total_count, 
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT bp.page_id, bp.title, bp.preview, bp.created_at, bp.user_id
              FROM book_pages bp
              ORDER BY bp.created_at DESC, bp.page_id ASC
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM book_pages
    `
    : await sql`
      WITH book_pages AS (
        SELECT p.page_id, p.title, p.preview, p.created_at::TIMESTAMP AS created_at, p.user_id
        FROM pages p
        JOIN books b ON p.book_id = b.book_id
        WHERE b.book_id = ${bookId}
      )
      SELECT COUNT(*)::int AS total_count, 
        COALESCE(
          (SELECT json_agg(result)
            FROM (
              SELECT bp.page_id, bp.title, bp.preview, bp.created_at, bp.user_id
              FROM book_pages bp
              ORDER BY bp.created_at ASC, bp.page_id ASC
              OFFSET ${offset}
              LIMIT ${limit}
            ) result
          ),
          '[]'::json
        ) AS results
      FROM book_pages
    `;

    const parsedRet = GetSlipsBooRetSchema.safeParse({
      items: ret[0].results,
      totalCount: ret[0].total_count,
      hasNextChunk: offset + ret[0].results.length < ret[0].total_count
    });

    if (!parsedRet.success) {
      console.error("invalid in getSlipsBooSF", parsedRet.error);
      throw new Error("invalid in getSlipsBooSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error("Failed to fetch books's pages slips", error);
    throw new Error("Failed to fetch books's pages slips");
  }
}
// chunked serires: get slips end
// chunked serires end




// get authorId's tags
const GetAutTagsParamSchema = z.object({
  authorId: UserSchema.shape.user_id
});
type GetAutTagsParam = z.infer<typeof  GetAutTagsParamSchema>;
const GetAutTagsRetSchema = z.object({
  autTags: z.array(z.object({
    token: TagSchema.shape.tag_id,
    count: z.number().int().nonnegative()
  }))
});
type GetAutTagsRet = z.infer<typeof GetAutTagsRetSchema>;
export const getAutTagsSF = async (param: GetAutTagsParam): Promise<GetAutTagsRet> => {
  "use server";

  try {
    const parsedParam = GetAutTagsParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getAutTagsSF", parsedParam.error);
      throw new Error("invalid in getAutTagsSF");
    }

    const { authorId } = parsedParam.data;

    const ret = await sql`
      SELECT t.tag_id, COUNT(*)::int as tag_count
      FROM pages p
      JOIN pages_tags pt ON p.page_id = pt.page_id
      JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.user_id = ${authorId}
      GROUP BY t.tag_id
      ORDER BY tag_count DESC
    `;

    const parsedRet = GetAutTagsRetSchema.safeParse({
      autTags: ret.map((r) => {
        return {
          token: r.tag_id,
          count: r.tag_count
        }
      })
    });

    if (!parsedRet.success) {
      console.error("invalid in getAutTagsSF", parsedRet.error);
      throw new Error("invalid in getAutTagsSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error("Failed to fetch authorId's tags", error);
    return { autTags: [] };
  }
}

// get authorId's books
const GetAutBooksParamSchema = z.object({
  authorId: UserSchema.shape.user_id
});
type GetAutBooksParam = z.infer<typeof  GetAutBooksParamSchema>;
const GetAutBooksRetSchema = z.object({
  autBooks: z.array(z.object({
    ...BookSchema.pick({
      book_id: true,
      book_title: true
    }).shape,
    pages_count: z.number().int().nonnegative()
  }))
});
type GetAutBooksRet = z.infer<typeof GetAutBooksRetSchema>;
export const getAutBooksSF = async (param: GetAutBooksParam): Promise<GetAutBooksRet> => {
  "use server";

  try {
    const parsedParam = GetAutBooksParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getAutBooksSF", parsedParam.error);
      throw new Error("invalid in getAutBooksSF");
    }

    const { authorId } = parsedParam.data;

    const ret = await sql`
      SELECT b.book_id, b.book_title, COUNT(p.page_id)::int as pages_count
      FROM books b
      LEFT JOIN pages p ON b.book_id = p.book_id
      WHERE b.user_id = ${authorId}
      GROUP BY b.book_id, b.book_title
      ORDER BY b.created_at DESC, b.book_id ASC
    `;

    const parsedRet = GetAutBooksRetSchema.safeParse({ autBooks: ret });

    if (!parsedRet.success) {
      console.error("invalid in getAutBooksSF", parsedRet.error);
      throw new Error("invalid in getAutBooksSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error("Failed to fetch authorId's books", error);
    return { autBooks: [] }
  }
}

// get book title
const GetBookTitleParamSchema = BookSchema.shape.book_id;
type GetBookTitleParam = z.infer<typeof GetBookTitleParamSchema>;
const GetBookTitleRetSchema = BookSchema.shape.book_title;
type GetBookTitleRet = z.infer<typeof GetBookTitleRetSchema>;
export const getBookTitleSF = async(param: GetBookTitleParam): Promise<GetBookTitleRet> => {
  "use server";

  try {
    const parsedParam = GetBookTitleParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid in getBookTitleSF", parsedParam.error);
      throw new Error("invalid in getBookTitleSF");
    }

    const bookId = parsedParam.data;

    const ret = await sql`
      SELECT book_title
      FROM books
      WHERE book_id = ${bookId}
    `;

    const parsedRet = GetBookTitleRetSchema.safeParse(ret[0].book_title);

    if (!parsedRet.success) {
      console.error("invalid in getBookTitleSF", parsedRet.error);
      throw new Error("invalid in getBookTitleSF");
    }

    return parsedRet.data;
  } catch (error) {
    console.error("Failed to fetch book title", error);
    return ''
  }
}

// get page turner series start
const PageTurnerItemSchema = z.object({
  pageId: PageSchema.shape.page_id.nullable(),
  title: PageSchema.shape.title.nullable()
}).transform((page) => {
  if (page.pageId === null || page.title === null) {
    return null;
  }
  return page;
}).nullable();
export type PageTurnerItem = z.infer<typeof PageTurnerItemSchema>;

// get page turner series: get author page turner
const GetAutPageTurnerParamSchema = PageSchema.shape.page_id;
export type GetAutPageTurnerParam = z.infer<typeof GetAutPageTurnerParamSchema>;
const GetAutPageTurnerRetSchema = z.object({
  authorId: UserSchema.shape.user_id,
  authorProfileImageUrl: UserSchema.shape.profile_image_url,
  prev: PageTurnerItemSchema,
  next: PageTurnerItemSchema
}).nullable();
export type GetAutPageTurnerRet = z.infer<typeof GetAutPageTurnerRetSchema>;
export const getAutPageTurnerSF = async (param: GetAutPageTurnerParam): Promise<GetAutPageTurnerRet> => {
  "use server";

  try {
    const parsedParam = GetAutPageTurnerParamSchema.safeParse(param);
    if (!parsedParam.success) {
      return null;
    }

    const validCurPageId = parsedParam.data;

    const ret = await sql`
      WITH pages_ordered AS (
        SELECT
          p.page_id,
          p.created_at,
          p.user_id AS author_id,
          u.profile_image_url AS author_profile_image_url,
          LAG(p.page_id) OVER (ORDER BY p.created_at ASC) as prev_page_id,
          LAG(p.title) OVER (ORDER BY p.created_at ASC) as prev_title,
          LEAD(p.page_id) OVER (ORDER BY p.created_at ASC) as next_page_id,
          LEAD(p.title) OVER (ORDER BY p.created_at ASC) as next_title
        FROM pages p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.user_id = (SELECT user_id FROM pages WHERE page_id = ${validCurPageId})
      )
      SELECT
        author_id,
        author_profile_image_url,
        prev_page_id,
        prev_title,
        next_page_id,
        next_title
      FROM pages_ordered
      WHERE page_id = ${validCurPageId}
    `;

    const ret0 = ret[0];
    const parseRet = GetAutPageTurnerRetSchema.safeParse({
      authorId: ret0.author_id,
      authorProfileImageUrl: ret0.author_profile_image_url,
      prev: {pageId: ret0.prev_page_id, title: ret0.prev_title},
      next: {pageId: ret0.next_page_id, title: ret0.next_title}
    });

    if (!parseRet.success) {
      console.error("invalid ret: ", parseRet.error);
      return null;
    }

    return parseRet.data;
  } catch (e) {
    console.error("SSW: ", e);
    return null;
  }
}

// get page turner series: get book page turner
const GetBooPageTurnerParamSchema = PageSchema.shape.page_id;
export type GetBooPageTurnerParam = z.infer<typeof GetBooPageTurnerParamSchema>;
const GetBooPageTurnerRetSchema = z.object({
  authorId: UserSchema.shape.user_id,
  bookId: BookSchema.shape.book_id,
  prev: PageTurnerItemSchema,
  next: PageTurnerItemSchema,
}).nullable();
type GetBooPageTurnerRet = z.infer<typeof GetBooPageTurnerRetSchema>;
export const getBooPageTurnerSF = async (param: GetBooPageTurnerParam): Promise<GetBooPageTurnerRet> => {
  "use server";

  try {
    const parsedParam = GetBooPageTurnerParamSchema.safeParse(param);
    if (!parsedParam.success) {
      return null;
    }

    const validCurPageId = parsedParam.data;

    const bookId = await sql`
      SELECT book_id
      FROM pages
      WHERE page_id = ${validCurPageId}
    `;

    if (!bookId[0].book_id) return null;

    const ret = await sql`
      WITH book_pages_ordered AS (
        SELECT 
          page_id,
          created_at,
          user_id AS author_id,
          book_id,
          LAG(page_id) OVER (ORDER BY created_at) as prev_page_id,
          LAG(title) OVER (ORDER BY created_at) as prev_title,
          LEAD(page_id) OVER (ORDER BY created_at) as next_page_id,
          LEAD(title) OVER (ORDER BY created_at) as next_title
        FROM pages
        WHERE book_id = (SELECT book_id FROM pages WHERE page_id = ${validCurPageId})
      )
      SELECT
        author_id,
        book_id,
        prev_page_id,
        prev_title,
        next_page_id,
        next_title
      FROM book_pages_ordered
      WHERE page_id = ${validCurPageId}
    `;

    const ret0 = ret[0];
    const parseRet = GetBooPageTurnerRetSchema.safeParse({
      authorId: ret0.author_id,
      bookId: ret0.book_id,
      prev: {pageId: ret0.prev_page_id, title: ret0.prev_title},
      next: {pageId: ret0.next_page_id, title: ret0.next_title}
    });
    if (!parseRet.success) {
      console.error("invalid ret: ", parseRet.error);
      return null;
    }

    return parseRet.data;
  } catch (e) {
    console.error("SSW: ", e);
    return null;
  }
}
// get page turner series end

// increase page view
const IncreasePageViewParamSchema = PageSchema.shape.page_id;
type IncreasePageViewParam = z.infer<typeof IncreasePageViewParamSchema>;
export const increasePageViewSF = async (param: IncreasePageViewParam): Promise<void> => {
  "use server";

  try {
    const parsedParam = IncreasePageViewParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param: ", parsedParam.error);
    }

    const validParam = parsedParam.data;

    await sql`
      UPDATE pages
      SET view = view + 1
      WHERE page_id = ${validParam}
    `;
  } catch (error) {
    console.error("SWW: ", error);
  }
}

// get page
const GetPageParamSchema = PageSchema.shape.page_id;
export type GetPageParam = z.infer<typeof GetPageParamSchema>;
const GetPageRetSchema = z.object({
  ...PageSchema.pick({
    user_id: true,

    page_id: true,
    title: true,
    preview: true,
    content: true,
    view: true,
    like: true,

    book_id: true,
  }).shape,
  tag_ids: TagsSchema,
  profile_image_url: UserSchema.shape.profile_image_url,
  created_at: DateStringRetSchema,
  updated_at: DateStringRetSchema,
  book_title: BookSchema.shape.book_title
}).nullable();
export type GetPageRet = z.infer<typeof GetPageRetSchema>;
export const getPageSF = async (param: GetPageParam): Promise<GetPageRet> => {
  'use server';

  try {
    const parsedParam = GetPageParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid parma: ", parsedParam.error);
      return null;
    }

    const pageId = parsedParam.data;

    const page = await sql`
      SELECT p.user_id, profile_image_url, page_id, title, preview, content, view, "like", p.created_at::TEXT, p.updated_at::TEXT, book_id,
      CASE 
        WHEN book_id IS NOT NULL THEN (SELECT book_title FROM books WHERE book_id = p.book_id)
        ELSE ''
      END AS book_title,
        COALESCE((SELECT array_agg(pt.tag_id) FROM pages_tags pt WHERE pt.page_id = p.page_id), ARRAY[]::TEXT[]) AS tag_ids
      FROM pages p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.page_id = ${pageId}
    `;

    if (page.length !== 1) {
      console.error("invalid ret: ", page);
      return null;
    }

    const parsedPage = GetPageRetSchema.safeParse(page[0]);
    if (!parsedPage.success) {
      console.error("invalid ret: ", parsedPage.error);
      return null;
    }

    return parsedPage.data;
  } catch (error) {
    console.error('Failed to fetch the page', error);
    return null;
  }
};