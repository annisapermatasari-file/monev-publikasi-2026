import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, assignments, users } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { MapPin, Users as UsersIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  const [{ total: totalLokasi }] = await db
    .select({ total: count() })
    .from(locations)
    .where(eq(locations.isActive, true));

  let lokasiSayaCount: number | null = null;
  if (user.role === "PETUGAS") {
    const [{ total }] = await db
      .select({ total: count() })
      .from(assignments)
      .where(eq(assignments.userId, user.id));
    lokasiSayaCount = total;
  }

  let totalPetugas: number | null = null;
  if (user.role === "SUPER_ADMIN") {
    const [{ total }] = await db
      .select({ total: count() })
      .from(users)
      .where(eq(users.role, "PETUGAS"));
    totalPetugas = total;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard Monev Publikasi
        </h1>
        <p className="mt-1 text-sm text-slate-500">PKK &amp; PKW 2026</p>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Masuk sebagai</p>
        <p className="font-medium text-slate-900">
          {user.name}{" "}
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {user.role}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/lokasi"
          className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <p className="text-sm">Total Lokasi</p>
          </div>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{totalLokasi}</p>
        </Link>

        {lokasiSayaCount !== null && (
          <Link
            href="/lokasi"
            className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <p className="text-sm">Lokasi Saya</p>
            </div>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{lokasiSayaCount}</p>
          </Link>
        )}

        {totalPetugas !== null && (
          <Link
            href="/petugas"
            className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <UsersIcon className="h-3.5 w-3.5" />
              <p className="text-sm">Total Petugas</p>
            </div>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{totalPetugas}</p>
          </Link>
        )}
      </div>

      <div className="mt-10 text-sm text-slate-400">
        Phase 3 — kelola Lokasi dan Petugas sudah aktif. Wizard Monev PKK/PKW
        dan dashboard analitik penuh menyusul di phase berikutnya.
      </div>
    </div>
  );
}
