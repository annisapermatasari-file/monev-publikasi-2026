import type { ProgramReport, YesNoStat, ScaleStat, AggregateReportData } from "./aggregate";

function best(items: YesNoStat[]) {
  return items.reduce((a, b) => (b.pct > a.pct ? b : a), items[0]);
}
function worst(items: YesNoStat[]) {
  return items.reduce((a, b) => (b.pct < a.pct ? b : a), items[0]);
}
function bestScale(items: ScaleStat[]) {
  return items.reduce((a, b) => (b.avg > a.avg ? b : a), items[0]);
}
function worstScale(items: ScaleStat[]) {
  return items.reduce((a, b) => (b.avg < a.avg ? b : a), items[0]);
}

function fmtPct(n: number) {
  return `${n}%`;
}

export function pendahuluan(data: AggregateReportData): string {
  const programList = data.programs.map((p) => `${p.name} (${p.code})`).join(" dan ");
  return (
    `Laporan ini merupakan hasil monitoring dan evaluasi (monev) publikasi kegiatan ` +
    `${programList} periode ${data.periode}, yang disusun secara otomatis dari seluruh sesi ` +
    `yang telah melalui proses review dan dinyatakan disetujui oleh Super Admin. Total terdapat ` +
    `${data.totalLkp} lembaga yang hasil monevnya tercakup dalam laporan ini. Tujuan laporan ` +
    `adalah memberikan gambaran menyeluruh mengenai keterpenuhan unsur publikasi, kepatuhan ` +
    `prosedur, pemanfaatan saluran publikasi, kelengkapan bukti dukung, serta kualitas kinerja, ` +
    `narasi, dan visual publikasi yang dihasilkan oleh lembaga pelaksana.`
  );
}

export function metodologi(): string {
  return (
    `Data dalam laporan ini dihimpun melalui aplikasi Monev Publikasi 2026, dengan setiap petugas ` +
    `mengisi instrumen penilaian terstruktur per lembaga mencakup aspek keterpenuhan unsur, ` +
    `kepatuhan prosedur, audit saluran publikasi (internal dan eksternal), kelengkapan bukti ` +
    `dukung, kinerja publikasi, serta penilaian narasi dan visual konten. Hasil isian tiap petugas ` +
    `kemudian ditinjau dan disetujui oleh Super Admin sebelum diikutsertakan dalam agregasi. ` +
    `Laporan ini hanya mengikutsertakan sesi berstatus "Disetujui" agar data yang disajikan ` +
    `terjamin kualitasnya.`
  );
}

function sectionYesNo(title: string, items: YesNoStat[], subjectLabel: string): string {
  if (items.length === 0) return `Belum ada data ${title.toLowerCase()} yang dapat dianalisis untuk program ini.`;
  const avg = Math.round(items.reduce((a, b) => a + b.pct, 0) / items.length);
  const top = best(items);
  const low = worst(items);
  return (
    `Secara rata-rata, capaian ${title.toLowerCase()} berada pada angka ${fmtPct(avg)}. ` +
    `${subjectLabel} dengan capaian tertinggi adalah "${top.label}" sebesar ${fmtPct(top.pct)}, ` +
    `sementara capaian terendah terdapat pada "${low.label}" sebesar ${fmtPct(low.pct)}, yang ` +
    `menunjukkan perlunya perhatian lebih lanjut pada aspek tersebut.`
  );
}

function sectionScale(title: string, items: ScaleStat[]): string {
  if (items.length === 0) return `Belum ada data ${title.toLowerCase()} yang dapat dianalisis untuk program ini.`;
  const avg = Math.round((items.reduce((a, b) => a + b.avg, 0) / items.length) * 100) / 100;
  const top = bestScale(items);
  const low = worstScale(items);
  return (
    `Rata-rata skor ${title.toLowerCase()} berada pada angka ${avg} dari skala 1-4. Indikator ` +
    `dengan skor tertinggi adalah "${top.label}" (rata-rata ${top.avg}), sedangkan indikator ` +
    `dengan skor terendah adalah "${low.label}" (rata-rata ${low.avg}).`
  );
}

export function programNarrative(p: ProgramReport) {
  const topProvinsi = p.provinsi[0];
  const ringkasan =
    `Program ${p.name} (${p.code}) mencakup ${p.lkpCount} lembaga yang hasil monevnya telah ` +
    `disetujui, tersebar di ${p.provinsi.length} provinsi` +
    (topProvinsi ? `, dengan konsentrasi terbanyak di ${topProvinsi.provinsi} (${topProvinsi.count} lembaga).` : ".");

  const keterpenuhan = sectionYesNo("Keterpenuhan Unsur Publikasi", p.keterpenuhan, "Unsur");
  const salInternal = sectionYesNo("Pemanfaatan Saluran Internal", p.saluranInternal, "Saluran");
  const salEksternal = sectionYesNo("Pemanfaatan Saluran Eksternal", p.saluranEksternal, "Saluran");
  const bukti = sectionYesNo("Kelengkapan Bukti Dukung", p.bukti, "Jenis bukti");
  const kepatuhan = sectionYesNo("Kepatuhan Prosedur", p.kepatuhan, "Unsur");
  const kinerjaCount = p.kinerja.cells.length;
  const kinerjaTotal = p.kinerja.cells.reduce((a, c) => a + c.jumlah, 0);
  const kinerja = kinerjaCount
    ? `Tercatat total ${kinerjaTotal} konten publikasi yang dihasilkan lintas ${p.kinerja.lkpList.length} ` +
      `lembaga pada ${p.kinerja.channelList.length} saluran, dengan jumlah konten tertinggi per sel mencapai ${p.kinerja.max}.`
    : "Belum ada data kinerja konten yang tercatat untuk program ini.";
  const narasi = sectionScale("Kualitas Narasi", p.narasi);
  const visual = sectionScale("Kualitas Visual", p.visual);

  return { ringkasan, keterpenuhan, salInternal, salEksternal, bukti, kepatuhan, kinerja, narasi, visual };
}

export function kesimpulanRekomendasi(data: AggregateReportData): string[] {
  const points: string[] = [];
  for (const p of data.programs) {
    if (p.lkpCount === 0) continue;
    const lowKet = p.keterpenuhan.length ? worst(p.keterpenuhan) : null;
    const lowKep = p.kepatuhan.length ? worst(p.kepatuhan) : null;
    const lowNar = p.narasi.length ? worstScale(p.narasi) : null;
    const lowVis = p.visual.length ? worstScale(p.visual) : null;
    if (lowKet) points.push(`Pada program ${p.code}, tingkatkan pemenuhan unsur "${lowKet.label}" yang masih berada di angka ${fmtPct(lowKet.pct)}.`);
    if (lowKep) points.push(`Perkuat kepatuhan terhadap unsur "${lowKep.label}" pada program ${p.code} (capaian saat ini ${fmtPct(lowKep.pct)}).`);
    if (lowNar) points.push(`Tingkatkan kualitas narasi, khususnya pada aspek "${lowNar.label}" di program ${p.code} (rata-rata skor ${lowNar.avg}).`);
    if (lowVis) points.push(`Tingkatkan kualitas visual, khususnya pada aspek "${lowVis.label}" di program ${p.code} (rata-rata skor ${lowVis.avg}).`);
  }
  points.push("Lakukan pendampingan berkelanjutan kepada lembaga dengan capaian di bawah rata-rata agar kualitas publikasi semakin merata.");
  return points;
}
