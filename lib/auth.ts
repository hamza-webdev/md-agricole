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
          role: user.role,
          phone: user.phone ?? undefined,
          address: user.address ?? undefined,
          city: user.city ?? undefined,
        };
        return authUser;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Lors du login initial, propager les champs custom depuis `user`
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.address = user.address;
        token.city = user.city;
        return token;
      }
      // Auto-réparation: si le token ne contient pas encore le rôle (sessions anciennes),
      // aller chercher en base et l'injecter
      if (!token.role && token.sub) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, phone: true, address: true, city: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.phone = dbUser.phone ?? undefined;
            token.address = dbUser.address ?? undefined;
            token.city = dbUser.city ?? undefined;
          }
        } catch (err) {
          // ignore silently; token restera sans rôle et le middleware refusera l'accès admin
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub || '';
        if (token.role) session.user.role = token.role as string;
        if (token.phone) session.user.phone = token.phone as string;
        if (token.address) session.user.address = token.address as string;
        if (token.city) session.user.city = token.city as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/connexion',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
