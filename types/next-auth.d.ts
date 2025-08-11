import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

// Augmentations de types NextAuth pour inclure nos champs custom

declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string;
    phone?: string;
    address?: string;
    city?: string;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      phone?: string;
      address?: string;
      city?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: string;
    phone?: string;
    address?: string;
    city?: string;
  }
}

