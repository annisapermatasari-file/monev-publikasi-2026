import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, monevSessions, programs, reviews, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import { getRecap, getRecommendations } from "@/lib/actions/monev";
import { submitReview } from "@/lib/actions/reviews";

export default async function ReviewDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  await auth();
  const { sessionId } = await params;
  const [row] = await db.select({ id: monevSessions.id, location: locations.namaLembaga, province: locations.provinsi, program: programs.code, status: monevSessions.status, submittedBy: users.name }).from(monevSessions).innerJoin(locations, eq(monevSessions.locationId, locations.id)).innerJoin(programs, eq(monevSessions.programId, programs.id)).leftJoin(users, eq(monevSessions.submittedById, users.id)).where(eq(monevSessions.id, sessionId)).limit(1);
  if (!row) return <div className="mx-auto max-w-3xl px-5 py-10">Sesi tidak ditemukan.</div>;
  const recap = await getRecap(sessionId);
  const recommendations = await getRecommendations(sessionId);
  const history = await db.select({ status: reviews.status, catatan: reviews.catatan, revisiKe: reviews.revisiKe, createdAt: reviews.createdAt, reviewer: users.name }).from(reviews).innerJoin(users, eq(reviews.reviewerId, users.id)).where(eq(reviews.sessionId, sessionId)).orderBy(desc(reviews.createdAt));

  async function approve() { "use server"; await submitReview(sessionId, "DISETUJUI", ""); }
  async function requestRevision(formData: FormData) { "use server"; await submitReview(sessionId, "PERLU_PERBAIKAN", String(formData.get("catatan") ?? "")); }

  return <div className="mx-auto max-w-4xl px-5 py-8 sm:px-10 sm:py-10"><Link href="/review" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-3.5 w-3.5" />Kembali ke antrean</Link><div className="mt-6 flex flex-col gap-4 border-b border-[#dce3d5] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">Review sesi / {row.program}</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">{row.location}</h1><p className="mt-1 text-sm text-slate-500">{row.province} · Petugas: {row.submittedBy ?? "-"}</p></div><Link href={`/monev/${sessionId}/step/12`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5d1bf] bg-[#fbfcf8] px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-lime-500"><ClipboardList className="h-4 w-4" />Buka rekap sesi</Link></div>
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">{[["Keterpenuhan", `${recap.keterpenuhan}%`], ["Kepatuhan", `${recap.kepatuhan}%`], ["Kinerja", recap.kinerja ? `${recap.kinerja}/4` : "-"], ["Narasi", recap.narasi ? `${recap.narasi}/4` : "-"], ["Visual", recap.visual ? `${recap.visual}/4` : "-"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-slate-900">{value}</p></div>)}</section>
      <section className="mt-6 rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] p-5"><h2 className="text-sm font-semibold text-slate-900">Rekomendasi otomatis</h2>{recommendations.length === 0 ? <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Tidak ada gap signifikan.</p> : <ul className="mt-3 space-y-2 text-sm text-amber-800">{recommendations.map((item) => <li key={item.kode} className="rounded-xl bg-amber-50 px-3 py-2">{item.teks}</li>)}</ul>}</section>
      <section className="mt-6 rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] p-5"><h2 className="text-sm font-semibold text-slate-900">Keputusan reviewer</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><form action={approve}><button className="w-full rounded-xl bg-[#26392d] px-4 py-3 text-sm font-medium text-white hover:bg-[#17231d]">Setujui hasil</button></form><form action={requestRevision} className="space-y-2"><textarea name="catatan" required rows={3} placeholder="Catatan perbaikan untuk petugas" className="w-full rounded-xl border border-[#d1dccb] bg-[#f5f8f1] px-3 py-2 text-sm" /><button className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 hover:bg-amber-100">Minta perbaikan</button></form></div></section>
      {history.length > 0 && <section className="mt-6 rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] p-5"><h2 className="text-sm font-semibold text-slate-900">Riwayat review</h2><div className="mt-3 space-y-3">{history.map((item) => <div key={`${item.revisiKe}-${item.createdAt.toISOString()}`} className="border-l-2 border-lime-400 pl-3 text-sm"><p className="font-medium text-slate-800">{item.status === "DISETUJUI" ? "Disetujui" : "Perlu perbaikan"} · Revisi {item.revisiKe}</p><p className="text-xs text-slate-500">{item.reviewer} · {item.createdAt.toLocaleDateString("id-ID")}</p>{item.catatan && <p className="mt-1 text-slate-600">{item.catatan}</p>}</div>)}</div></section>}
    </div>;
+}
