import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowLeft, ArrowUpRight, MessageSquareQuote, Quote } from "lucide-react";
import { listSessionsWithInterviews } from "@/lib/reporting/interview-insights";

const STATUS_LABEL: Record<string, string> = {
  BELUM_DIMULAI: "Belum dimulai",
  DRAFT: "Draft",
  SEDANG_DIKERJAKAN: "Dikerjakan",
  SUBMIT: "Submit",
  MENUNGGU_REVIEW: "Menunggu review",
  PERLU_PERBAIKAN: "Perlu perbaikan",
  DISETUJUI: "Disetujui",
};

// Daftar ini harus selalu mencerminkan narasumber yang baru saja ditambahkan
// petugas, jadi tidak boleh memakai cache statis Next.js.
export const dynamic = "force-dynamic";

export default async function WawancaraListPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/");

  const rows = await listSessionsWithInterviews();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-10 sm:py-10">
      <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke pusat kendali
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">Hasil wawancara</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">Hasil Wawancara &amp; Rekomendasi Konten</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Kumpulan hasil wawancara narasumber dari setiap lokasi, lengkap dengan usulan artikel dan
        konten media sosial yang dibuat otomatis dari jawaban yang ditandai &quot;boleh dikutip&quot;.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] px-5 py-12 text-center text-sm text-slate-400">
          Belum ada hasil wawancara yang masuk dari petugas.
        </div>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] shadow-[0_12px_30px_rgba(23,35,29,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#edf3e9] text-left text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-5 py-3">Lokasi</th>
                  <th className="px-5 py-3">Program</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Narasumber</th>
                  <th className="px-5 py-3">Kutipan siap pakai</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ece1]">
                {rows.map((row) => (
                  <tr key={row.sessionId} className="transition-colors hover:bg-[#f1f7ea]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{row.locationName}</p>
                      <p className="text-xs text-slate-400">
                        {row.provinsi}
                        {row.skillName ? ` · ${row.skillName}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-lime-800">{row.programCode}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquareQuote className="h-3.5 w-3.5 text-slate-400" />
                        {row.interviewCount} orang
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Quote className="h-3.5 w-3.5 text-slate-400" />
                        {row.quotableCount} jawaban
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/wawancara/${row.sessionId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-lime-800 hover:text-lime-600"
                      >
                        Lihat hasil &amp; rekomendasi <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
