import axios from 'axios';
import { CredentialsSignin, NextAuthConfig, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async credentials => {
        try {
          const { email, password } = credentials;

          if (!email || !password) {
            throw new Error('Please enter both email/username and password.');
          }

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/login`,
            {
              identifier: email,
              password: password
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          const { user } = response.data;

          if (user) {
            return {
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              role: user.role
            };
          }

          throw new CredentialsSignin('InvalidCredentials');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error(
            'Login error in NextAuth Credentials provider:',
            error.response?.data || error.message
          );

          if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
              throw new CredentialsSignin('InvalidCredentials');
            }
            throw new CredentialsSignin(
              error.response.data.message || 'Erro inesperado do servidor.'
            );
          }

          throw new CredentialsSignin(
            'Ocorreu um erro desconhecido durante o login.'
          );
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        ...session.user,
        id: token.user?.id,
        name: token.user?.name,
        username: token.user?.username,
        email: token.user?.email,
        role: token.user?.role
      };
      return session;
    }
  },
  pages: {
    signIn: '/auth/login'
  }
} satisfies NextAuthConfig;
