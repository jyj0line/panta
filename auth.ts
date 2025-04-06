import type { User } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { USER } from '@/app/lib/constants'
import { authConfig } from '@/auth.config';

// neon connection
const getDatabaseConnection = async () => {
    'use server';
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set.');
    }
    return neon(process.env.DATABASE_URL);
};
const sql = await getDatabaseConnection();

// schema

export type LoginningUser = User & {
  hashed_password: string;
};
const {
  USER_ID_MIN,
  USER_ID_MAX,
  USER_UNHASHED_PASSWORD_MIN,
  USER_UNHASHED_PASSWORD_MAX,
  USER_HASHED_PASSWORD_LENGTH
} = USER;

const UserLoginRequestSchema = z.object({
  user_id:
    z.string()
    .min(USER_ID_MIN, { message: `User ID must be at least ${USER_ID_MIN} characters long.`})
    .max(USER_ID_MAX, { message: `User ID must be no more than ${USER_ID_MAX} characters long.`}),
  unhashed_password:
    z.string()
    .min(USER_UNHASHED_PASSWORD_MIN, { message: `Password must be at least ${USER_UNHASHED_PASSWORD_MIN} characters long.`})
    .max(USER_UNHASHED_PASSWORD_MAX, { message: `User ID must be no more than ${USER_UNHASHED_PASSWORD_MAX} characters long.`}),
});
type UserLoginRequestType = z.infer<typeof UserLoginRequestSchema>;

const UserLoginReturnSchema = z.object({
  user_id:
    z.string()
    .min(USER_ID_MIN, { message: `User ID must be at least ${USER_ID_MIN} characters long.`})
    .max(USER_ID_MAX, { message: `User ID must be no more than ${USER_ID_MAX} characters long.`}),
  hashed_password:
    z.string()
    .length(USER_HASHED_PASSWORD_LENGTH, { message: `Hashed password must be ${USER_HASHED_PASSWORD_LENGTH} characters long.`})
});
type UserLoginReturnType = z.infer<typeof UserLoginReturnSchema>;

async function getUser(user_id: UserLoginRequestType["user_id"]): Promise<LoginningUser | undefined> {
  try {
    const user = await sql`SELECT user_id, hashed_password FROM users WHERE user_id=${user_id}`;

    const parsedUser = UserLoginReturnSchema.parse(user[0]);
    return { id: parsedUser.user_id, hashed_password: parsedUser.hashed_password };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = UserLoginRequestSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { user_id: inputted_user_id, unhashed_password } = parsedCredentials.data;

          const user = await getUser(inputted_user_id);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(unhashed_password, user.hashed_password);
          const ret = { id: user.id };
          if (passwordsMatch) return ret;
        }

        return null;
      },
    }),
  ],
});