import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcrypt';

import { authConfig } from '@/auth.config';
import { getUserSF, selectProfileImageUrlSF, selectBioSF } from '@/app/lib/SFs/authSFs';
import { UserSchema, UnhashedPasswordSchema } from '@/app/lib/tables';

const AuthrizeParamSchema = z.object({
  user_id: UserSchema.shape.user_id,
  unhashed_password: UnhashedPasswordSchema
});
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = AuthrizeParamSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const validatedCredentials = parsedCredentials.data;

          const user = await getUserSF(validatedCredentials.user_id);

          if (!user) {
            return null;
          }

          const isPasswordMatched = await bcrypt.compare(validatedCredentials.unhashed_password, user.hashed_password);
          if (isPasswordMatched) {
            return {
              user_id: user.user_id,
              profile_image_url: user.profile_image_url,
              bio: user.bio
            };
          }
        }

        return null;
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user, trigger, session }) {
      // When the user signs in for the first time
      if (user) {
        token.user_id = user.user_id
        token.profile_image_url = user.profile_image_url
        token.bio = user.bio
      }

      // When useSession().update is called
      if (trigger === "update") {
        if (session._update.profile_image_url && typeof token.user_id === "string") {
          try {
            const updatedProfileImageUrl = await selectProfileImageUrlSF(token.user_id);

            token.profile_image_url = updatedProfileImageUrl;
          } catch(_) {}
        }

        if (session._update.bio && typeof token.user_id === "string") {
          try {
            const updatedBio = await selectBioSF(token.user_id);

            token.bio = updatedBio;
          } catch(_) {}
        }
      }

      return token;
    },
    
    session({ session, token }) {
      if (typeof token.user_id === 'string') {
        session.user.user_id = token.user_id
      }
      if (typeof token.profile_image_url === 'string') {
        session.user.profile_image_url = token.profile_image_url
      }
      if (typeof token.bio === 'string') {
        session.user.bio = token.bio
      }

      return session;
    }
  }
});