import type { NextAuthConfig } from "next-auth";

// Konfigurasi dasar NextAuth yang AMAN dijalankan di Edge Runtime (dipakai
// oleh middleware/proxy.ts). Sengaja TIDAK mengimpor apa pun yang menyentuh
// database atau bcrypt di sini - middleware Next.js jalan di Edge Runtime dan
// tidak mendukung driver Postgres berbasis Node (net/tls socket) maupun
// native binding bcrypt. Provider Credentials (yang butuh DB) ditambahkan
// terpisah di auth.ts, yang hanya dipakai oleh API route (Node runtime).
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.username = (user as { username: string }).username;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "PETUGAS" | "VIEWER";
        session.user.username = token.username as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
