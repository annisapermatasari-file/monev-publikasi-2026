import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowDownToLine, ArrowLeft, FileText } from "lucide-react";
import { buildAggregateReport } from "@/lib/reporting/aggregate";
import { pendahuluan, metodologi, programNarrative, kesimpulanNarrative, rekomendasi } from "@/lib/reporting/narrative";
import { YesNoBarChart, ScaleStackedChart, KinerjaHeatmap } from "@/lib/reporting/charts";
import type { YesNoStat, ScaleStat } from "@/lib/reporting/aggregate";

// Laporan harus selalu mencerminkan sesi yang terakhir disetujui, jadi
// halaman ini tidak boleh memakai cache statis Next.js.
export const dynamic = "force-dynamic";

export default async function LaporanKeseluruhanPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/");

  const data = await buildAggregateReport();
  const kesimpulanParagraphs = kesimpulanNarrative(data);
  const rekomendasiList = rekomendasi(data);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-10 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke pusat kendali
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">Laporan agregat</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Laporan Monitoring Publikasi {data.periode}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Disusun otomatis dari {data.totalLkp} sesi yang telah disetujui, dibuat pada{" "}
            {data.generatedAt.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/laporan-keseluruhan/docx"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce3d5] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f1f7ea]"
          >
            <FileText className="h-4 w-4" /> Unduh Word
          </a>
          <a
            href="/api/admin/laporan-keseluruhan/pdf"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#26392d] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#17231d]"
          >
            <ArrowDownToLine className="h-4 w-4" /> Unduh PDF
          </a>
        </div>
      </div>

      {data.totalLkp === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Belum ada sesi berstatus &quot;Disetujui&quot; sehingga laporan masih kosong. Laporan akan
          otomatis terisi begitu ada sesi yang disetujui melalui halaman Review.
        </div>
      )}

      <Section title="1. Pendahuluan">
        <p className="text-sm leading-7 text-slate-700">{pendahuluan(data)}</p>
      </Section>

      <Section title="2. Metodologi">
        <p className="text-sm leading-7 text-slate-700">{metodologi()}</p>
      </Section>

      {data.programs.map((p) => {
        if (p.lkpCount === 0) return null;
        const n = programNarrative(p);
        return (
          <Section key={p.code} title={`3. Hasil Program ${p.name} (${p.code})`}>
            <p className="text-sm leading-7 text-slate-700">{n.ringkasan}</p>

            <SubSection title="Keterpenuhan Unsur Publikasi">
              <YesNoBarChart items={p.keterpenuhan} title={`Keterpenuhan unsur — ${p.code}`} />
              <YesNoTable items={p.keterpenuhan} labelHeader="Unsur" />
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.keterpenuhan}</p>
            </SubSection>

            <SubSection title="Pemanfaatan Saluran Publikasi">
              <YesNoBarChart items={p.saluranInternal} title={`Saluran internal — ${p.code}`} />
              <YesNoTable items={p.saluranInternal} labelHeader="Saluran" />
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.salInternal}</p>
              <div className="mt-4">
                <YesNoBarChart items={p.saluranEksternal} title={`Saluran eksternal — ${p.code}`} />
                <YesNoTable items={p.saluranEksternal} labelHeader="Saluran" />
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.salEksternal}</p>
            </SubSection>

            <SubSection title="Kelengkapan Bukti Dukung">
              <YesNoBarChart items={p.bukti} title={`Bukti dukung — ${p.code}`} />
              <YesNoTable items={p.bukti} labelHeader="Jenis Bukti" />
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.bukti}</p>
            </SubSection>

            <SubSection title="Kepatuhan Prosedur">
              <YesNoBarChart items={p.kepatuhan} title={`Kepatuhan — ${p.code}`} />
              <YesNoTable items={p.kepatuhan} labelHeader="Unsur" />
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.kepatuhan}</p>
            </SubSection>

            <SubSection title="Kinerja Publikasi (Jumlah Konten per Saluran)">
              <KinerjaHeatmap kinerja={p.kinerja} title={`Heatmap kinerja — ${p.code}`} />
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.kinerja}</p>
            </SubSection>

            <SubSection title="Kualitas Narasi">
              <ScaleStackedChart items={p.narasi} title={`Narasi — ${p.code}`} />
              <ScaleTable items={p.narasi} labelHeader="Indikator" />
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.narasi}</p>
            </SubSection>

            <SubSection title="Kualitas Visual">
              <ScaleStackedChart items={p.visual} title={`Visual — ${p.code}`} />
              <ScaleTable items={p.visual} labelHeader="Indikator" />
              <p className="mt-2 text-sm leading-7 text-slate-700">{n.visual}</p>
            </SubSection>

            <SubSection title="Kekuatan Publikasi">
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-700">
                {n.kekuatan.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </SubSection>

            <SubSection title="Kelemahan Publikasi">
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-700">
                {n.kelemahan.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </SubSection>
          </Section>
        );
      })}

      <Section title="4. Kesimpulan dan Rekomendasi">
        <div className="space-y-3">
          {kesimpulanParagraphs.map((k, i) => (
            <p key={i} className="text-sm leading-7 text-slate-700">
              {k}
            </p>
          ))}
        </div>
        <h3 className="mb-2 mt-5 text-sm font-semibold text-slate-800">Rekomendasi</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-700">
          {rekomendasiList.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ol>
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-[#e6ece1] pt-5 first:mt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function pctBadgeClass(pct: number) {
  if (pct >= 75) return "text-emerald-700";
  if (pct >= 50) return "text-lime-700";
  if (pct >= 25) return "text-amber-700";
  return "text-red-700";
}

function YesNoTable({ items, labelHeader }: { items: YesNoStat[]; labelHeader: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-[#e6ece1]">
      <table className="min-w-full divide-y divide-[#e6ece1] text-sm">
        <thead className="bg-[#edf3e9]">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">{labelHeader}</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Ya (%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf1e8] bg-white">
          {items.map((it) => (
            <tr key={it.label}>
              <td className="px-3 py-2 text-slate-700">{it.label}</td>
              <td className={`px-3 py-2 text-right font-medium tabular-nums ${pctBadgeClass(it.pct)}`}>
                {it.pct}% ({it.yes}/{it.total})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScaleTable({ items, labelHeader }: { items: ScaleStat[]; labelHeader: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-[#e6ece1]">
      <table className="min-w-full divide-y divide-[#e6ece1] text-sm">
        <thead className="bg-[#edf3e9]">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">{labelHeader}</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">1 (%)</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">2 (%)</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">3 (%)</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">4 (%)</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">Rata-rata</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf1e8] bg-white">
          {items.map((it) => (
            <tr key={it.label}>
              <td className="px-3 py-2 text-slate-700">{it.label}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">{it.pct[0]}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">{it.pct[1]}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">{it.pct[2]}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">{it.pct[3]}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-800">{it.avg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
