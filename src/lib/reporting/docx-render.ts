import type { AggregateReportData, YesNoStat, ScaleStat, ProgramReport } from "./aggregate";
import { pendahuluan, metodologi, programNarrative, kesimpulanNarrative, rekomendasi } from "./narrative";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
} from "docx";
import { ChartRun } from "docx/charts";

// Warna konsisten dengan chart SVG (halaman in-app) dan PDF, tanpa tanda "#"
// karena docx mengharapkan kode hex 6 digit polos.
function pctColor(pct: number): string {
  if (pct >= 75) return "15803d";
  if (pct >= 50) return "84cc16";
  if (pct >= 25) return "f59e0b";
  return "dc2626";
}

const CHART_WIDTH = 540;
function chartHeight(itemCount: number) {
  return Math.min(620, 46 * itemCount + 70);
}

/** Bar chart Word asli (bukan gambar) untuk data Ya/Tidak per unsur/saluran/bukti. */
function yesNoChart(items: YesNoStat[]) {
  if (items.length === 0) return null;
  return new Paragraph({
    children: [
      new ChartRun({
        type: "bar",
        categories: items.map((i) => i.label),
        series: [{ name: "Ya (%)", values: items.map((i) => i.pct), colors: items.map((i) => pctColor(i.pct)) }],
        legend: false,
        valueAxis: { minimum: 0, maximum: 100 },
        transformation: { width: CHART_WIDTH, height: chartHeight(items.length) },
      }),
    ],
    spacing: { after: 160 },
  });
}

/** Stacked bar chart Word asli untuk distribusi skala 1-4 (Narasi/Visual). */
function scaleDistributionChart(items: ScaleStat[]) {
  if (items.length === 0) return null;
  return new Paragraph({
    children: [
      new ChartRun({
        type: "bar",
        categories: items.map((i) => i.label),
        stacking: "percent",
        series: [
          { name: "Sangat Tidak Baik", values: items.map((i) => i.pct[0]), color: "dc2626" },
          { name: "Tidak Baik", values: items.map((i) => i.pct[1]), color: "f59e0b" },
          { name: "Baik", values: items.map((i) => i.pct[2]), color: "84cc16" },
          { name: "Sangat Baik", values: items.map((i) => i.pct[3]), color: "15803d" },
        ],
        legend: { position: "bottom" },
        transformation: { width: CHART_WIDTH, height: chartHeight(items.length) + 40 },
      }),
    ],
    spacing: { after: 160 },
  });
}

function h1(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}
function h2(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 250, after: 120 } });
}
function h3(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
}
function body(text: string) {
  return new Paragraph({ children: [new TextRun(text)], spacing: { after: 160 }, alignment: AlignmentType.JUSTIFIED });
}
function bullet(text: string) {
  return new Paragraph({ children: [new TextRun(text)], bullet: { level: 0 }, spacing: { after: 80 } });
}

function cell(text: string, opts: { bold?: boolean; width?: number; shade?: string } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shade ? { fill: opts.shade } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold: opts.bold })] })],
  });
}

function emptyNote(text: string) {
  return new Paragraph({ children: [new TextRun({ text, italics: true })] });
}

function yesNoTable(items: YesNoStat[], labelHeader: string) {
  if (items.length === 0) return emptyNote("Belum ada data.");
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [cell(labelHeader, { bold: true, width: 60, shade: "EDF3E9" }), cell("Ya (%)", { bold: true, width: 40, shade: "EDF3E9" })],
      }),
      ...items.map(
        (it) =>
          new TableRow({
            children: [cell(it.label, { width: 60 }), cell(`${it.pct}% (${it.yes}/${it.total})`, { width: 40 })],
          })
      ),
    ],
  });
}

function scaleTable(items: ScaleStat[], labelHeader: string) {
  if (items.length === 0) return emptyNote("Belum ada data.");
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell(labelHeader, { bold: true, width: 34, shade: "EDF3E9" }),
          cell("1 (%)", { bold: true, width: 13, shade: "EDF3E9" }),
          cell("2 (%)", { bold: true, width: 13, shade: "EDF3E9" }),
          cell("3 (%)", { bold: true, width: 13, shade: "EDF3E9" }),
          cell("4 (%)", { bold: true, width: 13, shade: "EDF3E9" }),
          cell("Rata-rata", { bold: true, width: 14, shade: "EDF3E9" }),
        ],
      }),
      ...items.map(
        (it) =>
          new TableRow({
            children: [
              cell(it.label, { width: 34 }),
              cell(`${it.pct[0]}`, { width: 13 }),
              cell(`${it.pct[1]}`, { width: 13 }),
              cell(`${it.pct[2]}`, { width: 13 }),
              cell(`${it.pct[3]}`, { width: 13 }),
              cell(`${it.avg}`, { width: 14 }),
            ],
          })
      ),
    ],
  });
}

// Interpolasi putih -> hijau tua sesuai intensitas nilai, sama seperti heatmap
// pada chart SVG (halaman in-app) dan PDF, supaya ketiganya terlihat konsisten.
function heatColorHex(ratio: number): string {
  const r = Math.round(240 - ratio * 190);
  const g = Math.round(249 - ratio * 90);
  const b = Math.round(240 - ratio * 190);
  return [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

function kinerjaTable(kinerja: ProgramReport["kinerja"]) {
  if (kinerja.cells.length === 0) return emptyNote("Belum ada data kinerja konten.");
  const map = new Map<string, number>();
  for (const c of kinerja.cells) map.set(`${c.lkp}__${c.channel}`, c.jumlah);
  const colWidth = Math.floor(80 / Math.max(1, kinerja.channelList.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell("Lembaga", { bold: true, width: 20, shade: "EDF3E9" }),
          ...kinerja.channelList.map((ch) => cell(ch, { bold: true, width: colWidth, shade: "EDF3E9" })),
        ],
      }),
      ...kinerja.lkpList.map(
        (lkp) =>
          new TableRow({
            children: [
              cell(lkp, { width: 20 }),
              ...kinerja.channelList.map((ch) => {
                const v = map.get(`${lkp}__${ch}`) ?? 0;
                const ratio = kinerja.max > 0 ? v / kinerja.max : 0;
                return cell(`${v}`, { width: colWidth, shade: v > 0 ? heatColorHex(ratio) : undefined });
              }),
            ],
          })
      ),
    ],
  });
}

export async function buildDocxBuffer(data: AggregateReportData): Promise<Buffer> {
  const kesimpulanParagraphs = kesimpulanNarrative(data);
  const rekomendasiList = rekomendasi(data);

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: `Laporan Monitoring Publikasi ${data.periode}`,
      heading: HeadingLevel.TITLE,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Disusun otomatis dari ${data.totalLkp} sesi yang telah disetujui — dibuat pada ${data.generatedAt.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}.`,
          italics: true,
        }),
      ],
      spacing: { after: 300 },
    }),

    h1("1. Pendahuluan"),
    body(pendahuluan(data)),

    h1("2. Metodologi"),
    body(metodologi()),
  ];

  for (const p of data.programs) {
    if (p.lkpCount === 0) continue;
    const n = programNarrative(p);
    children.push(h1(`3. Hasil Program ${p.name} (${p.code})`));
    children.push(body(n.ringkasan));

    children.push(h2("Keterpenuhan Unsur Publikasi"));
    const ketChart = yesNoChart(p.keterpenuhan);
    if (ketChart) children.push(ketChart);
    children.push(yesNoTable(p.keterpenuhan, "Unsur"));
    children.push(body(n.keterpenuhan));

    children.push(h2("Pemanfaatan Saluran Publikasi"));
    children.push(h3("Saluran Internal"));
    const salInChart = yesNoChart(p.saluranInternal);
    if (salInChart) children.push(salInChart);
    children.push(yesNoTable(p.saluranInternal, "Saluran"));
    children.push(body(n.salInternal));
    children.push(h3("Saluran Eksternal"));
    const salExChart = yesNoChart(p.saluranEksternal);
    if (salExChart) children.push(salExChart);
    children.push(yesNoTable(p.saluranEksternal, "Saluran"));
    children.push(body(n.salEksternal));

    children.push(h2("Kelengkapan Bukti Dukung"));
    const buktiChart = yesNoChart(p.bukti);
    if (buktiChart) children.push(buktiChart);
    children.push(yesNoTable(p.bukti, "Jenis Bukti"));
    children.push(body(n.bukti));

    children.push(h2("Kepatuhan Prosedur"));
    const kepatuhanChart = yesNoChart(p.kepatuhan);
    if (kepatuhanChart) children.push(kepatuhanChart);
    children.push(yesNoTable(p.kepatuhan, "Unsur"));
    children.push(body(n.kepatuhan));

    children.push(h2("Kinerja Publikasi (Jumlah Konten per Saluran)"));
    children.push(kinerjaTable(p.kinerja));
    children.push(body(n.kinerja));

    children.push(h2("Kualitas Narasi"));
    const narasiChart = scaleDistributionChart(p.narasi);
    if (narasiChart) children.push(narasiChart);
    children.push(scaleTable(p.narasi, "Indikator"));
    children.push(body(n.narasi));

    children.push(h2("Kualitas Visual"));
    const visualChart = scaleDistributionChart(p.visual);
    if (visualChart) children.push(visualChart);
    children.push(scaleTable(p.visual, "Indikator"));
    children.push(body(n.visual));

    children.push(h2("Kekuatan Publikasi"));
    n.kekuatan.forEach((k) => children.push(bullet(k)));

    children.push(h2("Kelemahan Publikasi"));
    n.kelemahan.forEach((k) => children.push(bullet(k)));
  }

  children.push(h1("4. Kesimpulan dan Rekomendasi"));
  kesimpulanParagraphs.forEach((k) => children.push(body(k)));
  children.push(h3("Rekomendasi"));
  rekomendasiList.forEach((k, i) => children.push(body(`${i + 1}. ${k}`)));

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}
