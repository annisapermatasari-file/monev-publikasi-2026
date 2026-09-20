import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, monevSessions, programs, users } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, Clock3 } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU_REVIEW: "Menunggu review",
  PERLU_PERBAIKAN: "Perlu perbaikan",
  DISETUJUI: "Disetujui",
};

export default async function ReviewPage() {
  await auth();
  const rows = await db
    .select({
      id: monevSessions.id,
      location: locations.namaLembaga,
      province: locations.provinsi,
      program: programs.code,
      status: monevSessions.status,
      submittedAt: monevSessions.submittedAt,
      submittedBy: users.name,
      currentStep: monevSessions.currentStep,
    })
    .from(monevSessions)
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .leftJoin(users, eq(monevSessions.submittedById, users.id))
    .where(inArray(monevSessions.status, ["MENUNGGU_REVIEW", "PERLU_PERBAIKAN", "DISETUJUI"]))
    .orderBy(desc(monevSessions.submittedAt));

  const waiting = rows.filter((row) => row.status === "MENUNGGU_REVIEW").length;
  const revisions = rows.filter((row) => row.status === "PERLU_PERBAIKAN").length;
  const approved = rows.filter((row) => row.status === "DISETUJUI").length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10 sm:py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">Phase 7 / Review desk</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Review hasil monev</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Periksa hasil lapangan, beri catatan, dan tetapkan keputusan untuk setiap sesi.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Summary icon={Clock3} label="Menunggu review" value={waiting} />
        <Summary icon={ClipboardCheck} label="Perlu perbaikan" value={revisions} />
        <Summary icon={ClipboardCheck} label="Disetujui" value={approved} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] shadow-[0_12px_30px_rgba(23,35,29,0.04)]">
        <div className="border-b border-[#e6ece1] px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Antrean keputusan</h2></div>
        {rows.length === 0 ? <p className="px-5 py-12 text-center text-sm text-slate-400">Belum ada hasil yang dikirim untuk review.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-[#edf3e9] text-left text-xs font-medium text-slate-500"><tr><th className="px-5 py-3">Lokasi</th><th className="px-5 py-3">Program</th><th className="px-5 py-3">Petugas</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Aksi</th></tr></thead>
              <tbody className="divide-y divide-[#e6ece1]">{rows.map((row) => <tr key={row.id} className="hover:bg-[#f1f7ea]"><td className="px-5 py-3"><p className="font-medium text-slate-900">{row.location}</p><p className="text-xs text-slate-400">{row.province}</p></td><td className="px-5 py-3 font-semibold text-lime-800">{row.program}</td><td className="px-5 py-3 text-slate-600">{row.submittedBy ?? "-"}</td><td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{STATUS_LABEL[row.status] ?? row.status}</span></td><td className="px-5 py-3"><Link href={`/review/${row.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-lime-800 hover:text-lime-600">Buka review <ArrowUpRight className="h-3.5 w-3.5" /></Link></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: number }) {
  return <div className="rounded-2xl border border-[#dce3d5] border-t-4 border-t-lime-400 bg-[#fbfcf8] p-4"><Icon className="h-4 w-4 text-slate-500" /><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p></div>;
}
