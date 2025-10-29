import authConfig from '@/auth.config';
import { prisma } from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch the user from the database to get their role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            role: {
              select: {
                role: true,
              },
            },
          },
        });
        if (dbUser?.role?.role) {
          token.role = dbUser.role.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
