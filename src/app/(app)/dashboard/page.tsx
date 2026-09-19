import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, assignments, users, monevSessions, programs, channelAudits } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { MapPin, Users as UsersIcon } from "lucide-react";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  const analyticsRows = await db
    .select({
      sessionId: monevSessions.id,
      provinsi: locations.provinsi,
      program: programs.code,
      status: monevSessions.status,
      jumlahKonten: channelAudits.jumlahKonten,
      digunakan: channelAudits.digunakan,
    })
    .from(monevSessions)
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .leftJoin(channelAudits, eq(monevSessions.id, channelAudits.sessionId));

  const activeLocations = await db
    .select({ provinsi: locations.provinsi })
    .from(locations)
    .where(eq(locations.isActive, true));
  const provinces = [...new Set(activeLocations.map((location) => location.provinsi))].sort();

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

      <AnalyticsDashboard rows={analyticsRows} provinces={provinces} />
    </div>
  );
}
