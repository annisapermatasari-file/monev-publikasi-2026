"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { createOfficer } from "@/lib/actions/users";

export default function PetugasBaruPage() {
  const [result, setResult] = useState<{ username: string; tempPassword: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await createOfficer(formData);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    if (res?.success) {
      setResult({ username: res.username!, tempPassword: res.tempPassword! });
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-6 py-10 sm:px-10">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <h1 className="text-lg font-semibold text-emerald-900">Akun berhasil dibuat</h1>
          <p className="mt-1 text-sm text-emerald-700">
            Catat kredensial ini sekarang — password tidak akan ditampilkan lagi.
          </p>

          <div className="mt-4 space-y-2 rounded-lg bg-white p-4 font-mono text-sm">
            <p>
              Username: <span className="font-semibold">{result.username}</span>
            </p>
            <p>
              Password: <span className="font-semibold">{result.tempPassword}</span>
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `Username: ${result.username}\nPassword: ${result.tempPassword}`
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Tersalin" : "Salin ke clipboard"}
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/petugas"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Kembali ke Daftar Petugas
          </Link>
          <button
            onClick={() => setResult(null)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Tambah Akun Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10 sm:px-10">
      <Link
        href="/petugas"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Petugas
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">Tambah Akun</h1>
      <p className="mt-1 text-sm text-slate-500">
        Password sementara akan digenerate otomatis dan ditampilkan sekali setelah disimpan.
      </p>

      <form
        action={handleSubmit}
        className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Nama Lengkap</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Username <span className="font-normal text-slate-400">(kosongkan untuk auto-generate)</span>
          </label>
          <input
            name="username"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Role</label>
          <select
            name="role"
            defaultValue="PETUGAS"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          >
            <option value="PETUGAS">Petugas Monev</option>
            <option value="VIEWER">Viewer / Pimpinan</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Email <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <input
              name="email"
              type="email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              No. HP <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <input
              name="phone"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="isUnitAccount" className="rounded border-slate-300" />
          Ini akun tim/unit (bukan individu, mis. &quot;BKHM&quot;)
        </label>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Buat Akun"}
        </button>
      </form>
    </div>
  );
}
