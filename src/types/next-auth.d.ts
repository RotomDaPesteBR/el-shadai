import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      username?: string | null;
      email?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends NextAuthJWT {
    user: {
      id: string;
      name?: string | null;
      username?: string | null;
      email?: string | null;
      role: string;
    };
  }
}
