"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LandingHero } from "@/components/LandingHero";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const reduce = useReducedMotion();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Username atau password salah.");
      setShakeKey((k) => k + 1);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Kolom kiri: penjelasan dashboard (disembunyikan di layar sempit, tampil ringkas di atas) */}
      <div className="hidden lg:block">
        <LandingHero />
      </div>

      {/* Kolom kanan: form login */}
      <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.15 } : { type: "spring", bounce: 0, duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Ringkasan mobile-only, ganti hero yang disembunyikan */}
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Tahun Anggaran 2026
            </p>
            <h1
              className="mt-1 font-semibold text-slate-900"
              style={{ fontSize: "1.75rem", letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              Monev Publikasi PKK &amp; PKW
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Dashboard Monitoring dan Evaluasi Publikasi — Direktorat Kursus
              dan Pelatihan.
            </p>
          </div>

          <h2 className="text-lg font-semibold text-slate-900">Masuk</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gunakan akun yang sudah didaftarkan oleh admin.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition-[border-color,box-shadow] duration-150 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 active:scale-[0.995]"
                placeholder="mis. superadmin"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition-[border-color,box-shadow] duration-150 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, y: reduce ? 0 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduce ? { duration: 0.15 } : { type: "spring", bounce: 0, duration: 0.3 }
                  }
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition-transform duration-100 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Direktorat Kursus dan Pelatihan &middot; Kemendikdasmen
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
