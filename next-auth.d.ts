import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      restaurantSlug?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    restaurantSlug?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    restaurantSlug?: string;
  }
}
