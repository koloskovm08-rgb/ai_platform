import NextAuth from 'next-auth';
import { authConfig } from './config';

// NextAuth v5 поддерживает обе переменные: AUTH_SECRET (v5) и NEXTAUTH_SECRET (v4)
const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  secret, // Явно передаём секрет
});

