import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowLeft, Hash, Quote } from "lucide-react";
import {
  getSessionInterviewDetail,
  buildContentRecommendations,
  ROLE_LABEL,
} from "@/lib/reporting/interview-insights";

const STATUS_LABEL: Record<string, string> = {
  BELUM_DIMULAI: "Belum dimulai",
  DRAFT: "Draft",
  SEDANG_DIKERJAKAN: "Dikerjakan",
  SUBMIT: "Submit",
  MENUNGGU_REVIEW: "Menunggu review",
  PERLU_PERBAIKAN: "Perlu perbaikan",
  DISETUJUI: "Disetujui",
};

export const dynamic = "force-dynamic";

export default async function WawancaraDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/");

  const { sessionId } = await params;
  const detail = await getSessionInterviewDetail(sessionId);
  if (!detail) notFound();

  const rec = buildContentRecommendations(detail);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-10 sm:py-10">
      <Link href="/admin/wawancara" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke daftar wawancara
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">Hasil wawancara</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">{detail.locationName}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {detail.kabKota}, {detail.provinsi}
        {detail.skillName ? ` · ${detail.skillName}` : ""} · Program{" "}
        <span className="font-semibold text-lime-800">{detail.programCode}</span> ·{" "}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {STATUS_LABEL[detail.status] ?? detail.status}
        </span>
      </p>

      {/* ============ HASIL WAWANCARA ============ */}
      <Section title="1. Hasil Wawancara">
        {detail.interviews.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada narasumber yang dicatat.</p>
        ) : (
          <div className="space-y-5">
            {detail.interviews.map((iv) => (
              <div key={iv.id} className="rounded-xl border border-[#e6ece1] bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{iv.narasumber}</p>
                <p className="text-xs text-slate-500">{ROLE_LABEL[iv.peran]}</p>
                <div className="mt-3 space-y-3 border-t border-[#edf1e8] pt-3">
                  {iv.answers
                    .filter((a) => (a.jawaban ?? "").trim().length > 0)
                    .map((a) => (
                      <div key={a.id}>
                        <p className="text-xs font-medium text-slate-600">{a.pertanyaan}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-800">{a.jawaban}</p>
                        {a.bolehDikutip && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-lime-700">
                            <Quote className="h-3 w-3" /> Boleh dikutip untuk publikasi
                          </span>
                        )}
                      </div>
                    ))}
                  {iv.answers.every((a) => (a.jawaban ?? "").trim().length === 0) && (
                    <p className="text-xs text-slate-400">Belum ada jawaban yang diisi.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ============ KUTIPAN SIAP PAKAI ============ */}
      <Section title="2. Kutipan Siap Pakai">
        {rec.highlights.length === 0 ? (
          <p className="text-sm text-slate-400">
            Belum ada jawaban yang ditandai &quot;boleh dikutip&quot;, sehingga rekomendasi di bawah masih
            bersifat umum.
          </p>
        ) : (
          <ul className="space-y-3">
            {rec.highlights.map((h, i) => (
              <li key={i} className="rounded-xl border border-[#e6ece1] bg-white p-4 text-sm leading-6 text-slate-800">
                <Quote className="mb-1 h-3.5 w-3.5 text-lime-600" />
                &quot;{h.jawaban}&quot;
                <p className="mt-1 text-xs font-medium text-slate-500">
                  — {h.narasumber}, {ROLE_LABEL[h.peran]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ============ REKOMENDASI ARTIKEL ============ */}
      <Section title="3. Rekomendasi Tulisan Artikel">
        <div className="space-y-5">
          {rec.articleIdeas.map((a, i) => (
            <div key={i} className="rounded-xl border border-[#e6ece1] bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{a.judul}</p>
              <p className="mt-2 text-sm italic leading-6 text-slate-600">{a.lead}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Struktur usulan</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
                {a.outline.map((o, j) => (
                  <li key={j}>{o}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      {/* ============ REKOMENDASI KONTEN MEDIA SOSIAL ============ */}
      <Section title="4. Rekomendasi Konten Media Sosial">
        <div className="space-y-4">
          {rec.socialIdeas.map((s, i) => (
            <div key={i} className="rounded-xl border border-[#e6ece1] bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                {s.platform} <span className="font-normal text-slate-400">· {s.format}</span>
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{s.isi}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Hashtag yang disarankan</p>
          <div className="flex flex-wrap gap-2">
            {rec.hashtags.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 rounded-full bg-[#edf3e9] px-3 py-1 text-xs font-medium text-lime-800"
              >
                <Hash className="h-3 w-3" />
                {h.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] p-5 shadow-[0_12px_30px_rgba(23,35,29,0.04)] sm:p-6">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
