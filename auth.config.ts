import { NextResponse } from 'next/server';

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },

  session: {
    maxAge: 2592000,
    strategy: 'jwt',
    updateAge: 86400
  },

  providers: [
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    session({ session, token }) {
      if (typeof token.id === 'string')
        session.user.id = token.id
      return session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnWrite = nextUrl.pathname.startsWith('/write');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      if (isOnWrite) {
        if (isLoggedIn) return true;
        return false;
      } else if (isOnLogin && isLoggedIn) {
        return NextResponse.redirect(new URL('/', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;