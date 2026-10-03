import type { AggregateReportData, YesNoStat, ScaleStat, ProgramReport } from "./aggregate";
import { pendahuluan, metodologi, programNarrative, kesimpulanNarrative, rekomendasi } from "./narrative";
import PDFDocument from "pdfkit";

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4 pt
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) doc.addPage();
}

// Setiap kali kita menggambar teks pada posisi (x, y) absolut (dipakai oleh
// chart di bawah), kursor internal pdfkit ikut berpindah ke x tersebut dan
// "lebar flow" berikutnya ikut menyempit. resetCursor mengembalikan kursor
// ke margin kiri halaman supaya heading/paragraf sesudahnya tidak ikut
// terdorong/menyempit.
function resetCursor(doc: PDFKit.PDFDocument) {
  doc.x = MARGIN;
}

function h1(doc: PDFKit.PDFDocument, text: string) {
  resetCursor(doc);
  ensureSpace(doc, 40);
  doc.moveDown(0.5).fontSize(16).fillColor("#17231d").font("Helvetica-Bold").text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.3);
}
function h2(doc: PDFKit.PDFDocument, text: string) {
  resetCursor(doc);
  ensureSpace(doc, 30);
  doc.moveDown(0.4).fontSize(13).fillColor("#26392d").font("Helvetica-Bold").text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.2);
}
function h3(doc: PDFKit.PDFDocument, text: string) {
  resetCursor(doc);
  ensureSpace(doc, 24);
  doc.moveDown(0.3).fontSize(11).fillColor("#334155").font("Helvetica-Bold").text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.15);
}
function body(doc: PDFKit.PDFDocument, text: string) {
  resetCursor(doc);
  ensureSpace(doc, 20);
  doc.fontSize(10).fillColor("#1e293b").font("Helvetica").text(text, MARGIN, doc.y, { align: "justify", width: CONTENT_WIDTH });
  doc.moveDown(0.6);
}
function bulletList(doc: PDFKit.PDFDocument, items: string[]) {
  resetCursor(doc);
  for (const text of items) {
    ensureSpace(doc, 20);
    doc.fontSize(10).fillColor("#1e293b").font("Helvetica").text(`•  ${text}`, MARGIN, doc.y, { width: CONTENT_WIDTH });
    doc.moveDown(0.25);
  }
  doc.moveDown(0.35);
}

function yesNoBarChart(doc: PDFKit.PDFDocument, items: YesNoStat[], title: string) {
  if (items.length === 0) {
    body(doc, "Belum ada data.");
    return;
  }
  const rowH = 20;
  const labelW = 200;
  const barMaxW = CONTENT_WIDTH - labelW - 50;
  ensureSpace(doc, items.length * rowH + 20);
  resetCursor(doc);
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#0f172a").text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.2);
  for (const it of items) {
    ensureSpace(doc, rowH);
    const y = doc.y;
    const x0 = MARGIN;
    doc.fontSize(9).font("Helvetica").fillColor("#334155").text(it.label.length > 32 ? it.label.slice(0, 30) + "…" : it.label, x0, y, { width: labelW - 5, lineBreak: false });
    const barX = x0 + labelW;
    const barW = Math.max(2, (it.pct / 100) * barMaxW);
    const color = it.pct >= 75 ? "#15803d" : it.pct >= 50 ? "#84cc16" : it.pct >= 25 ? "#f59e0b" : "#dc2626";
    doc.rect(barX, y, barMaxW, 12).fill("#f1f5f9");
    doc.rect(barX, y, barW, 12).fill(color);
    doc.fontSize(9).fillColor("#0f172a").text(`${it.pct}%`, barX + barMaxW + 6, y, { lineBreak: false });
    doc.y = y + rowH;
  }
  resetCursor(doc);
  doc.moveDown(0.3);
}

function scaleChart(doc: PDFKit.PDFDocument, items: ScaleStat[], title: string) {
  if (items.length === 0) {
    body(doc, "Belum ada data.");
    return;
  }
  const colors = ["#dc2626", "#f59e0b", "#84cc16", "#15803d"];
  const rowH = 20;
  const labelW = 200;
  const barMaxW = CONTENT_WIDTH - labelW - 60;
  ensureSpace(doc, items.length * rowH + 20);
  resetCursor(doc);
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#0f172a").text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.2);
  for (const it of items) {
    ensureSpace(doc, rowH);
    const y = doc.y;
    const x0 = MARGIN;
    doc.fontSize(9).font("Helvetica").fillColor("#334155").text(it.label.length > 32 ? it.label.slice(0, 30) + "…" : it.label, x0, y, { width: labelW - 5, lineBreak: false });
    let x = x0 + labelW;
    doc.rect(x, y, barMaxW, 12).fill("#f1f5f9");
    it.pct.forEach((p, idx) => {
      const w = (p / 100) * barMaxW;
      if (w > 0) doc.rect(x, y, w, 12).fill(colors[idx]);
      x += w;
    });
    doc.fontSize(9).fillColor("#0f172a").text(`rata ${it.avg}`, x0 + labelW + barMaxW + 6, y, { lineBreak: false });
    doc.y = y + rowH;
  }
  resetCursor(doc);
  doc.moveDown(0.3);
}

function kinerjaHeatmap(doc: PDFKit.PDFDocument, kinerja: ProgramReport["kinerja"], title: string) {
  if (kinerja.cells.length === 0) {
    body(doc, "Belum ada data kinerja konten.");
    return;
  }
  const map = new Map<string, number>();
  for (const c of kinerja.cells) map.set(`${c.lkp}__${c.channel}`, c.jumlah);
  const labelW = 110;
  const cellW = Math.min(55, (CONTENT_WIDTH - labelW) / Math.max(1, kinerja.channelList.length));
  const cellH = 16;
  resetCursor(doc);
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#0f172a").text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.2);
  ensureSpace(doc, 40 + kinerja.lkpList.length * cellH);
  const startY = doc.y;
  let y = startY + 30;
  doc.fontSize(6.5).font("Helvetica").fillColor("#334155");
  kinerja.channelList.forEach((ch, ci) => {
    doc.text(ch.length > 14 ? ch.slice(0, 12) + "…" : ch, MARGIN + labelW + ci * cellW, startY, { width: cellW, align: "center", lineBreak: false });
  });
  for (const lkp of kinerja.lkpList) {
    ensureSpace(doc, cellH);
    y = doc.y;
    doc.fontSize(7).fillColor("#334155").text(lkp.length > 20 ? lkp.slice(0, 18) + "…" : lkp, MARGIN, y, { width: labelW - 4, lineBreak: false });
    kinerja.channelList.forEach((ch, ci) => {
      const v = map.get(`${lkp}__${ch}`) ?? 0;
      const ratio = kinerja.max > 0 ? v / kinerja.max : 0;
      const r = Math.round(240 - ratio * 190);
      const g = Math.round(249 - ratio * 90);
      const b = Math.round(240 - ratio * 190);
      const x = MARGIN + labelW + ci * cellW;
      // pdfkit tidak memahami string CSS "rgb(r,g,b)" (akan jatuh ke hitam);
      // gunakan array [r,g,b] yang didukung native oleh pdfkit.
      doc.rect(x, y, cellW - 1, cellH - 2).fill([r, g, b]);
      if (v > 0) doc.fontSize(7).fillColor("#0f172a").text(`${v}`, x, y + 2, { width: cellW - 1, align: "center", lineBreak: false });
    });
    doc.y = y + cellH;
  }
  resetCursor(doc);
  doc.moveDown(0.4);
}

export async function buildPdfBuffer(data: AggregateReportData): Promise<Buffer> {
  const kesimpulanParagraphs = kesimpulanNarrative(data);
  const rekomendasiList = rekomendasi(data);

  const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(20).font("Helvetica-Bold").fillColor("#17231d").text(`Laporan Monitoring Publikasi ${data.periode}`);
  doc
    .fontSize(9)
    .font("Helvetica-Oblique")
    .fillColor("#64748b")
    .text(
      `Disusun otomatis dari ${data.totalLkp} sesi yang telah disetujui — dibuat pada ${data.generatedAt.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}.`
    );
  doc.moveDown();

  h1(doc, "1. Pendahuluan");
  body(doc, pendahuluan(data));

  h1(doc, "2. Metodologi");
  body(doc, metodologi());

  for (const p of data.programs) {
    if (p.lkpCount === 0) continue;
    const n = programNarrative(p);
    h1(doc, `3. Hasil Program ${p.name} (${p.code})`);
    body(doc, n.ringkasan);

    h2(doc, "Keterpenuhan Unsur Publikasi");
    yesNoBarChart(doc, p.keterpenuhan, "Keterpenuhan unsur");
    body(doc, n.keterpenuhan);

    h2(doc, "Pemanfaatan Saluran Publikasi");
    h3(doc, "Saluran Internal");
    yesNoBarChart(doc, p.saluranInternal, "Saluran internal");
    body(doc, n.salInternal);
    h3(doc, "Saluran Eksternal");
    yesNoBarChart(doc, p.saluranEksternal, "Saluran eksternal");
    body(doc, n.salEksternal);

    h2(doc, "Kelengkapan Bukti Dukung");
    yesNoBarChart(doc, p.bukti, "Bukti dukung");
    body(doc, n.bukti);

    h2(doc, "Kepatuhan Prosedur");
    yesNoBarChart(doc, p.kepatuhan, "Kepatuhan");
    body(doc, n.kepatuhan);

    h2(doc, "Kinerja Publikasi (Jumlah Konten per Saluran)");
    kinerjaHeatmap(doc, p.kinerja, "Heatmap kinerja");
    body(doc, n.kinerja);

    h2(doc, "Kualitas Narasi");
    scaleChart(doc, p.narasi, "Narasi");
    body(doc, n.narasi);

    h2(doc, "Kualitas Visual");
    scaleChart(doc, p.visual, "Visual");
    body(doc, n.visual);

    h2(doc, "Kekuatan Publikasi");
    bulletList(doc, n.kekuatan);

    h2(doc, "Kelemahan Publikasi");
    bulletList(doc, n.kelemahan);
  }

  h1(doc, "4. Kesimpulan dan Rekomendasi");
  kesimpulanParagraphs.forEach((k) => body(doc, k));
  h3(doc, "Rekomendasi");
  rekomendasiList.forEach((k, i) => body(doc, `${i + 1}. ${k}`));

  doc.end();
  return done;
}
