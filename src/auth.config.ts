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

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                identifier: email,
                password: password
              })
            }
          );

          if (!response.ok) {
            // Se a resposta não for OK, tenta extrair a mensagem de erro do corpo
            const errorData = await response.json();

            console.error('Login API error:', errorData);

            if (response.status === 401) {
              throw new CredentialsSignin('InvalidCredentials');
            }
            // Lança um erro com a mensagem do servidor ou uma genérica
            throw new CredentialsSignin(
              errorData.message || 'Erro inesperado do servidor.'
            );
          }

          const responseData = await response.json();
          const { user } = responseData; // Assumindo que a resposta bem-sucedida tem { user: {...} }

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
            error.message
          );

          // O tratamento de erro com fetch é um pouco diferente de Axios.
          // O `error` capturado aqui geralmente será o que você `throw` dentro do `try`.
          if (error instanceof CredentialsSignin) {
            throw error; // Relança o erro CredentialsSignin original
          }

          // Para outros tipos de erro (ex: falha de rede), pode ser um erro genérico
          throw new CredentialsSignin(
            'Ocorreu um erro desconhecido durante o login. Verifique sua conexão.'
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
