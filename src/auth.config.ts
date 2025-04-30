import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export default {
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {}
      },
      authorize: async credentials => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let user: any = null;

          const { email, password } = credentials;

          //To do: VALIDATION and AUTH

          if (email === '123@abc.com' && password === '123') {
            user = { name: 'ABC', role: 'customer' };
          } else if (email === 'admin@abc.com' && password === 'admin') {
            user = { name: 'Admin', role: 'admin' };
          }

          if (!user) {
            throw new Error('Invalid credentials.');
          }

          return user;
        } catch (error) {
          if (error) {
            return null;
          }
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.user = {
          ...user,
          name: user.name,
          role: user.role
        };
      }

      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: { session: any; token: any }) {
      session.user = {
        ...session.user,
        name: token.user.name,
        role: token.user.role
      };

      return session;
    }
  },
  pages: {
    signIn: '/auth/login'
  }
} satisfies NextAuthConfig;
