import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

// Konfigurasi PENUH (dengan provider Credentials yang butuh DB + bcrypt).
// File ini hanya boleh diimpor dari kode yang jalan di Node.js runtime
// (API route handler, Server Actions, Server Components) - JANGAN diimpor
// dari proxy.ts/middleware, karena akan gagal di Edge Runtime.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username.trim().toLowerCase()))
          .limit(1);

        if (!user || !user.isActive || user.deletedAt) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
});
