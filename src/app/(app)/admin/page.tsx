import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, monevSessions, programs, users } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, ClipboardCheck, Clock3, Database, ShieldCheck } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  BELUM_DIMULAI: "Belum dimulai",
  DRAFT: "Draft",
  SEDANG_DIKERJAKAN: "Dikerjakan",
  SUBMIT: "Submit",
  MENUNGGU_REVIEW: "Menunggu review",
  PERLU_PERBAIKAN: "Perlu perbaikan",
  DISETUJUI: "Disetujui",
};

export default async function AdminPage() {
  const session = await auth();
  const rows = await db
    .select({
      id: monevSessions.id,
      locationName: locations.namaLembaga,
      province: locations.provinsi,
      program: programs.code,
      status: monevSessions.status,
      submittedAt: monevSessions.submittedAt,
      officer: users.name,
      currentStep: monevSessions.currentStep,
    })
    .from(monevSessions)
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .leftJoin(users, eq(monevSessions.submittedById, users.id))
    .orderBy(monevSessions.updatedAt);

  const [totalLocations] = await db.select({ total: count() }).from(locations).where(eq(locations.isActive, true));
  const submitted = rows.filter((row) => ["SUBMIT", "MENUNGGU_REVIEW"].includes(row.status)).length;
  const approved = rows.filter((row) => row.status === "DISETUJUI").length;
  const needsAction = rows.filter((row) => ["MENUNGGU_REVIEW", "PERLU_PERBAIKAN"].includes(row.status)).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10 sm:py-10">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">Control room / super admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Pusat kendali hasil monev</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Terima, olah, tinjau, dan tarik rekap hasil dari seluruh petugas Monev dalam satu ruang kerja.
          </p>
        </div>
        <a
          href="/api/admin/export"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#26392d] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#17231d]"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Tarik rekap Excel
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Kpi icon={Database} label="Sesi terdata" value={rows.length} tone="lime" />
        <Kpi icon={Clock3} label="Perlu ditinjau" value={needsAction} tone="amber" />
        <Kpi icon={ClipboardCheck} label="Diterima" value={approved} tone="sky" />
        <Kpi icon={ShieldCheck} label="Lokasi aktif" value={totalLocations.total} tone="rose" />
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] shadow-[0_12px_30px_rgba(23,35,29,0.04)]">
        <div className="flex flex-col gap-2 border-b border-[#e6ece1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Antrean hasil petugas</h2>
            <p className="mt-1 text-xs text-slate-500">{submitted} sesi sudah masuk tahap submit atau review.</p>
          </div>
          <span className="text-xs text-slate-400">Login: {session?.user.name}</span>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-400">Belum ada sesi monev.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#edf3e9] text-left text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-5 py-3">Lokasi</th>
                  <th className="px-5 py-3">Program</th>
                  <th className="px-5 py-3">Petugas submit</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ece1]">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-[#f1f7ea]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{row.locationName}</p>
                      <p className="text-xs text-slate-400">{row.province}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-lime-800">{row.program}</td>
                    <td className="px-5 py-3 text-slate-600">{row.officer ?? "Belum submit"}</td>
                    <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-5 py-3 text-slate-500">Langkah {row.currentStep}/13</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/monev/${row.id}/step/12`} className="inline-flex items-center gap-1 text-xs font-medium text-lime-800 hover:text-lime-600">
                        Olah hasil <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Database; label: string; value: number; tone: "lime" | "amber" | "sky" | "rose" }) {
  const colors = { lime: "border-t-lime-400", amber: "border-t-amber-400", sky: "border-t-sky-400", rose: "border-t-rose-400" };
  return <div className={`rounded-2xl border border-[#dce3d5] border-t-4 ${colors[tone]} bg-[#fbfcf8] p-4`}><Icon className="h-4 w-4 text-slate-500" /><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p></div>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "DISETUJUI" ? "bg-emerald-100 text-emerald-800" : status === "MENUNGGU_REVIEW" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${color}`}>{STATUS_LABEL[status] ?? status}</span>;
}