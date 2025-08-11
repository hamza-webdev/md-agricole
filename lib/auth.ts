import { NextAuthOptions, type User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcryptjs from 'bcryptjs';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, _req): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        const authUser: User = {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        } as User;
        // @ts-expect-error augmenting user fields
        authUser.role = user.role;
        // @ts-expect-error augmenting user fields
        authUser.phone = user.phone ?? undefined;
        // @ts-expect-error augmenting user fields
        authUser.address = user.address ?? undefined;
        // @ts-expect-error augmenting user fields
        authUser.city = user.city ?? undefined;
        return authUser;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.address = user.address;
        token.city = user.city;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub || '';
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
        session.user.address = token.address as string;
        session.user.city = token.city as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/connexion',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
