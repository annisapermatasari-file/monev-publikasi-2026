import { DefaultSession } from "next-auth";

export type AppRole = "SUPER_ADMIN" | "PETUGAS" | "VIEWER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    username: string;
  }
}
