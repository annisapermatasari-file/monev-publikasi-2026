import { NextResponse } from "next/server";

// DEBUG SEMENTARA: endpoint untuk memastikan environment variable terbaca di
// Vercel saat runtime, dan deployment yang aktif memang commit yang benar.
// Tidak mengembalikan value asli dari secret manapun - hanya boolean/panjang.
// HAPUS route ini setelah masalah MissingSecret selesai didiagnosis.
export async function GET() {
  const authSecret = process.env.AUTH_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  return NextResponse.json({
    hasAUTH_SECRET: Boolean(authSecret),
    authSecretLength: authSecret?.length ?? 0,
    hasNEXTAUTH_SECRET: Boolean(nextAuthSecret),
    nextAuthSecretLength: nextAuthSecret?.length ?? 0,
    hasDATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    VERCEL_URL: process.env.VERCEL_URL ?? null,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    NODE_ENV: process.env.NODE_ENV,
  });
}
