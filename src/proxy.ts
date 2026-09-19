import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Route -> role yang diizinkan. Route yang tidak terdaftar di sini tapi
// berada di dalam matcher tetap butuh login (any authenticated role).
const ROLE_RULES: { prefix: string; roles: Array<"SUPER_ADMIN" | "PETUGAS" | "VIEWER"> }[] = [
  { prefix: "/petugas", roles: ["SUPER_ADMIN"] },
  { prefix: "/lokasi/baru", roles: ["SUPER_ADMIN"] },
  { prefix: "/review", roles: ["SUPER_ADMIN"] },
  { prefix: "/admin", roles: ["SUPER_ADMIN"] },
  { prefix: "/pengaturan", roles: ["SUPER_ADMIN"] },
  { prefix: "/monev", roles: ["SUPER_ADMIN", "PETUGAS"] },
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isLoginPage = nextUrl.pathname.startsWith("/login");

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  if (isLoggedIn) {
    const role = req.auth?.user?.role;
    const rule = ROLE_RULES.find((r) => nextUrl.pathname.startsWith(r.prefix));
    if (rule && role && !rule.roles.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard?denied=1", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - api/auth (NextAuth handler)
     * - _next/static, _next/image
     * - favicon, file statis
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
