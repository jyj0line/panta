"use server";

import { z } from 'zod';

import { sql } from "@/app/lib/SFs/publicSFs";
import { UserSchema } from '@/app/lib/tables';

// get user
const GetUserParamSchema = UserSchema.shape.user_id;
type GetUserParam = z.infer<typeof GetUserParamSchema>;
const GetUserRetSchema = z.object({
...UserSchema.pick({
    user_id: true,
    hashed_password: true,
    profile_image_url: true,
    bio: true
}).shape,
});
type GetUserRet = z.infer<typeof GetUserRetSchema>;
export const getUserSF = async(user_id: GetUserParam): Promise<GetUserRet | null> => {
    "use server";
    
    const parsedUserId = GetUserParamSchema.safeParse(user_id);
    if (!parsedUserId.success) return null;

    try {
      const user = await sql`
        SELECT user_id, hashed_password, profile_image_url, bio
        FROM users
        WHERE user_id=${parsedUserId.data}
      `;

      const parsedUser = GetUserRetSchema.safeParse(user[0]);
      if (!parsedUser.success) return null;

      return {
        user_id: parsedUser.data.user_id,
        hashed_password: parsedUser.data.hashed_password,
        profile_image_url: parsedUser.data.profile_image_url,
        bio: parsedUser.data.bio
      };
    } catch (_) {
      return null;
    }
}

// select profile image url
const SelectProfileImageUrlParamSchema = UserSchema.shape.user_id;
type SelectProfileImageUrlParam = z.infer<typeof SelectProfileImageUrlParamSchema>;
const SelectProfileImageUrlRetSchema = UserSchema.shape.profile_image_url;
type SelectProfileImageUrlRet = z.infer<typeof SelectProfileImageUrlRetSchema>;
export const selectProfileImageUrlSF = async (userId: SelectProfileImageUrlParam): Promise<SelectProfileImageUrlRet | null> => {
  "use server";

  const parsedUserId = SelectProfileImageUrlParamSchema.safeParse(userId);
  if (!parsedUserId.success) return null;

  try {
    const res = await sql`
      SELECT profile_image_url
      FROM users
      WHERE user_id = ${parsedUserId.data}
    `;

    if (res.length === 0) return null;
    
    const parsedProfileImageUrl = SelectProfileImageUrlRetSchema.safeParse(res[0].profile_image_url);
    if (!parsedProfileImageUrl.success) return null;
    
    return parsedProfileImageUrl.data;
  } catch (_) {
    return null;
  }
}

// select bio
const SelectBioParamSchema = UserSchema.shape.user_id;
type SelectBioParam = z.infer<typeof SelectBioParamSchema>;
const SelectBioRetSchema = UserSchema.shape.bio;
type SelectBioRet = z.infer<typeof SelectBioRetSchema>;
export const selectBioSF = async (userId: SelectBioParam): Promise<SelectBioRet | null> => {
  "use server";

  const parsedUserId = SelectBioParamSchema.safeParse(userId);
  if (!parsedUserId.success) return null;

  try {
    const res = await sql`
      SELECT bio
      FROM users
      WHERE user_id = ${parsedUserId.data}
    `;

    if (res.length === 0) return null;
    
    const parsedBio = SelectBioRetSchema.safeParse(res[0].bio);
    if (!parsedBio.success) return null;
    
    return parsedBio.data;
  } catch (_) {
    return null;
  }
}