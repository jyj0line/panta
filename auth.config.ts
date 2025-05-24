import { NextResponse } from 'next/server';
import type { DefaultSession, NextAuthConfig } from 'next-auth';

import type { User as TableUser} from '@/app/lib/tables';

declare module "next-auth" {
  interface User {
    user_id: TableUser["user_id"]
    profile_image_url: TableUser["profile_image_url"]
    bio: TableUser["bio"]
  }
  
  interface Session {
    user: {
      user_id: TableUser["user_id"]
      profile_image_url: TableUser["profile_image_url"]
      bio: TableUser["bio"]
    } & DefaultSession["user"]
  }
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    updateAge: 86400, //1 day
    maxAge: 2592000, //1 month
  },

  // will be set in auth.ts
  providers: [
  ],

  callbacks: {
        authorized({ auth, request: { nextUrl } }) {
          const isLoggedIn = !!auth?.user;
        
          const isOnSingup = nextUrl.pathname.startsWith('/signup');
          const isOnLogin = nextUrl.pathname.startsWith('/login');

          const isOnSetting = nextUrl.pathname.startsWith('/setting');
          const isOnChangepassword = nextUrl.pathname.startsWith('/changepassword');
          const isOnDeleteAccount = nextUrl.pathname.startsWith('/deleteaccount');
          const isOnWrite = nextUrl.pathname.startsWith('/write');
    
          if ((isOnSetting || isOnChangepassword || isOnDeleteAccount || isOnWrite) && !isLoggedIn) {
            return false;
          } else if ((isOnSingup || isOnLogin) && isLoggedIn) {
            return NextResponse.redirect(new URL('/', nextUrl));
          }
    
          return true;
        },
    }
} satisfies NextAuthConfig;