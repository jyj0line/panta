"use server";

import { AuthError } from 'next-auth';
import { neon, DatabaseError} from "@neondatabase/serverless";
import { z } from "zod";
import bcrypt from 'bcrypt';

import { signIn, signOut } from '@/auth';
import { UserSchema, UnhashedPasswordSchema, NonnegativeNumberSchema } from '@/app/lib/tables';

import { type ErrorCode, ERROR_CODE, SUCCESS, ERROR, COMMON } from '@/app/lib/constants';
const {
  SIGN_UP_SUCCESS,

  LOG_IN_SUCCESS,

  LOG_OUT_SUCCESS
} = SUCCESS;
const {
  SOMETHING_WENT_WRONG_ERROR,

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
  } catch (_) {
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
  } catch(_) {
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
  } catch(_) {
    return { 
      success: false,
      message: SOMETHING_WENT_WRONG_ERROR
    }
  }
};

{/* authorId/[authorId] start */}
const IsExistentUserIdParamSchema = UserSchema.shape.user_id;
type IsExistentUserIdParam = z.infer<typeof IsExistentUserIdParamSchema>;
const IsExistentUserIdRetSchema = z.boolean();
type IsExistentUserIdRet = z.infer<typeof IsExistentUserIdRetSchema>;
export const isExistentUserIdSF = async (param: IsExistentUserIdParam): Promise<IsExistentUserIdRet> => {
  "use server";

  try {
    const parsedParam = IsExistentUserIdParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in isExistentUserId", parsedParam);
      return false;
    }

    const res = await sql`
      SELECT user_id
      FROM users
      WHERE user_id = ${parsedParam.data}
    `

    if (res.length === 0) {
      return false;
    }

    if (res.length !== 1 || res[0].user_id !== parsedParam.data) {
      console.error("invalid ret in isExistentUserId", res);
      return false;
    }

    return true;
  } catch(error) {
    console.error("Something went wrong in isExistentUserId", error);
    return false;
  }
}

const GetAuthorCardDataParamSchema = UserSchema.shape.user_id;
type GetAuthorCardDataParam = z.infer<typeof GetAuthorCardDataParamSchema>;
const GetAuthorCardDataRetSchema = z.object({
    ...UserSchema.pick({
    user_id: true,
    bio: true,
    profile_image_url: true,
    }).shape,
    subscribed_count: NonnegativeNumberSchema,
    subscribing_count: NonnegativeNumberSchema
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
      console.error("invalid param in getAuthorCardDataSF", parsedParam);
      return {
        success: false,
        errorCode: ERROR_CODE.INVALID_DATA
      }
    }

    const authorId = parsedParam.data;

    const ret = await sql`
      SELECT
        user_id,
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
}

const IsSubscribedParamSchema = z.object({
  authorId: UserSchema.shape.user_id,
  readerId: UserSchema.shape.user_id
});
type IsSubscribedParam = z.infer<typeof IsSubscribedParamSchema>;
const IsSubscribedRetSchema = z.boolean();
type IsSubscribedRet = z.infer<typeof IsSubscribedRetSchema>;
export const isSubscribingSF = async (param: IsSubscribedParam): Promise<IsSubscribedRet> => {
  "use server";

  try {
    const parsedParam = IsSubscribedParamSchema.safeParse(param);
    if (!parsedParam.success) {
      console.error("invalid param in isSubscribed", parsedParam);
      return false;
    }

    const {authorId, readerId} = parsedParam.data;

    const ret = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM subscribes 
        WHERE user_id_subscribed = ${authorId} AND user_id_subscribing = ${readerId}
      ) AS is_subscribed
    `;

    const parsedRet = IsSubscribedRetSchema.safeParse(ret[0].is_subscribed);
    if (ret.length !== 1 || !parsedRet.success) {
      console.error("invalid ret in isSubscribed", parsedRet);
      return false;
    }

    return parsedRet.data;
  } catch(_) {
    return false;
  }
}