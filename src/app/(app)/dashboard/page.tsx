import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, assignments, users, monevSessions, programs, channelAudits } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowUpRight, MapPin, Radio, Users as UsersIcon } from "lucide-react";
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
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-10 sm:py-10">
      <div className="relative mb-8 overflow-hidden rounded-[1.5rem] bg-[#17231d] px-6 py-7 text-white shadow-[0_18px_45px_rgba(23,35,29,0.14)] sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-xl">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">
            <Radio className="h-3.5 w-3.5" />
            National communication monitor
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sinyal publikasi nasional.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
            Pantau denyut kegiatan komunikasi PKK dan PKW dari lokasi monev sampai kanal publikasi.
          </p>
        </div>
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[28px] border-lime-300/15" />
        <div className="absolute -bottom-28 right-20 h-48 w-48 rounded-full border-[18px] border-rose-300/10" />
        <div className="absolute bottom-6 right-7 hidden text-right sm:block">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Periode aktif</p>
          <p className="mt-1 text-2xl font-semibold text-lime-200">2026</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#dce3d5] bg-[#fbfcf8]/90 px-5 py-4 backdrop-blur-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Ruang kerja</p>
          <p className="mt-1 font-medium text-slate-900">
          {user.name}{" "}
          <span className="ml-2 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-800">
            {user.role}
          </span>
          </p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/lokasi"
          className="group rounded-2xl border border-[#dce3d5] border-t-4 border-t-lime-400 bg-[#fbfcf8] p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
        >
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <p className="text-sm">Total Lokasi</p>
          </div>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">{totalLokasi}</p>
          <p className="mt-3 text-xs text-slate-400">Titik pemantauan aktif <ArrowUpRight className="ml-1 inline h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></p>
        </Link>

        {lokasiSayaCount !== null && (
          <Link
            href="/lokasi"
            className="group rounded-2xl border border-[#dce3d5] border-t-4 border-t-sky-400 bg-[#fbfcf8] p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <p className="text-sm">Lokasi Saya</p>
            </div>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">{lokasiSayaCount}</p>
            <p className="mt-3 text-xs text-slate-400">Penugasan Anda <ArrowUpRight className="ml-1 inline h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></p>
          </Link>
        )}

        {totalPetugas !== null && (
          <Link
            href="/petugas"
            className="group rounded-2xl border border-[#dce3d5] border-t-4 border-t-rose-400 bg-[#fbfcf8] p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <UsersIcon className="h-3.5 w-3.5" />
              <p className="text-sm">Total Petugas</p>
            </div>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">{totalPetugas}</p>
            <p className="mt-3 text-xs text-slate-400">Tim yang terdaftar <ArrowUpRight className="ml-1 inline h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></p>
          </Link>
        )}
      </div>

      <AnalyticsDashboard rows={analyticsRows} provinces={provinces} />
    </div>
  );
}
