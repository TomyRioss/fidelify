import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
          include: { restaurant: { select: { slug: true } } },
        });

        if (!user || !user.password) {
          console.error("[NextAuth] User not found or no password:", credentials.email);
          return null;
        }

        const password = credentials.password as string;
        const isHashed = user.password.startsWith("$2");
        const valid = isHashed
          ? await bcrypt.compare(password, user.password)
          : password === user.password;

        if (!valid) {
          console.error("[NextAuth] Invalid password for:", credentials.email);
          return null;
        }

        return { id: user.id, email: user.email, name: user.name, role: user.role, restaurantSlug: user.restaurant?.slug };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.restaurantSlug = (user as { restaurantSlug?: string }).restaurantSlug;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { restaurantSlug?: string }).restaurantSlug = token.restaurantSlug as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
