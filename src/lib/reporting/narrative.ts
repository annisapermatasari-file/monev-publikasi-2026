import type { ProgramReport, YesNoStat, ScaleStat, AggregateReportData } from "./aggregate";

// ------------------------------------------------------------
// Util kecil
// ------------------------------------------------------------

function joinQuoted(labels: string[], max = 4): string {
  const shown = labels.slice(0, max).map((l) => `"${l}"`);
  const extra = labels.length - shown.length;
  let text: string;
  if (shown.length === 0) text = "";
  else if (shown.length === 1) text = shown[0];
  else text = shown.slice(0, -1).join(", ") + " dan " + shown[shown.length - 1];
  if (extra > 0) text += ` (serta ${extra} lainnya)`;
  return text;
}

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

// ------------------------------------------------------------
// Pendahuluan & Metodologi
// ------------------------------------------------------------

export function pendahuluan(data: AggregateReportData): string {
  const active = data.programs.filter((p) => p.lkpCount > 0);
  const programList = active.map((p) => `${p.name} (${p.code})`).join(" dan ");
  return (
    `Laporan ini merupakan hasil monitoring dan evaluasi (monev) publikasi kegiatan ` +
    `${programList || "program yang dipantau"} periode ${data.periode}, yang disusun secara otomatis dari seluruh sesi ` +
    `yang telah melalui proses review dan dinyatakan disetujui oleh Super Admin. Total terdapat ` +
    `${data.totalLkp} lembaga yang hasil monevnya tercakup dalam laporan ini, dan laporan ini akan ` +
    `diperbarui secara otomatis mengikuti sesi terbaru yang disetujui. Tujuan laporan adalah memberikan ` +
    `gambaran menyeluruh dan mudah dipahami mengenai keterpenuhan unsur publikasi, kepatuhan prosedur, ` +
    `pemanfaatan saluran publikasi, kelengkapan bukti dukung, serta kualitas kinerja, narasi, dan visual ` +
    `publikasi yang dihasilkan oleh lembaga pelaksana, lengkap dengan analisis atas pola dan kesenjangan ` +
    `yang ditemukan, bukan sekadar angka dan tabel.`
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
    `terjamin kualitasnya, dan isinya otomatis mengikuti sesi terakhir yang disetujui — setiap kali ` +
    `ada hasil petugas baru yang disetujui, laporan ini akan memuat data tersebut tanpa perlu disusun ulang secara manual.`
  );
}

// ------------------------------------------------------------
// Narasi deskriptif per bagian (Ya/Tidak & skala 1-4)
// ------------------------------------------------------------

function describeYesNo(items: YesNoStat[], noun: string, title: string): string {
  if (items.length === 0) return `Belum ada data ${title.toLowerCase()} yang dapat dianalisis untuk program ini.`;

  const avg = Math.round(items.reduce((a, b) => a + b.pct, 0) / items.length);
  const tinggi = items.filter((i) => i.pct >= 75).sort((a, b) => b.pct - a.pct);
  const sedang = items.filter((i) => i.pct >= 50 && i.pct < 75).sort((a, b) => b.pct - a.pct);
  const rendah = items.filter((i) => i.pct < 50).sort((a, b) => a.pct - b.pct);
  const top = best(items);
  const low = worst(items);

  const parts: string[] = [];
  parts.push(
    `Secara rata-rata, capaian ${title.toLowerCase()} berada pada angka ${avg}%, dengan capaian tertinggi ` +
      `pada "${top.label}" (${top.pct}%) dan capaian terendah pada "${low.label}" (${low.pct}%).`
  );
  if (tinggi.length > 0) {
    parts.push(
      `Dari ${items.length} ${noun} yang dinilai, ${tinggi.length} di antaranya sudah berada pada kategori ` +
        `tinggi (75% ke atas), yaitu ${joinQuoted(tinggi.map((i) => i.label))}, menandakan aspek tersebut sudah menjadi ` +
        `kebiasaan yang konsisten di sebagian besar lembaga.`
    );
  }
  if (sedang.length > 0) {
    parts.push(
      `Sebanyak ${sedang.length} ${noun} berada pada kategori sedang (50–74%), yakni ${joinQuoted(sedang.map((i) => i.label))}, ` +
        `yang berarti sudah berjalan namun belum merata di seluruh lembaga.`
    );
  }
  if (rendah.length > 0) {
    parts.push(
      `Sementara itu, ${rendah.length} ${noun} masih tergolong rendah (<50%), yaitu ${joinQuoted(rendah.map((i) => i.label))}, ` +
        `yang menunjukkan perlunya perhatian dan pendampingan lebih lanjut agar aspek-aspek tersebut tidak tertinggal.`
    );
  } else {
    parts.push(`Tidak ada ${noun} yang berada pada kategori rendah, menunjukkan capaian yang cukup merata di seluruh aspek yang dinilai.`);
  }
  return parts.join(" ");
}

function describeScale(items: ScaleStat[], title: string): string {
  if (items.length === 0) return `Belum ada data ${title.toLowerCase()} yang dapat dianalisis untuk program ini.`;

  const avg = Math.round((items.reduce((a, b) => a + b.avg, 0) / items.length) * 100) / 100;
  const top = bestScale(items);
  const low = worstScale(items);
  // "baik ke atas" = proporsi skor 3 (Baik) + skor 4 (Sangat Baik)
  const withBaikKeatas = items.map((i) => ({ item: i, baikKeatas: i.pct[2] + i.pct[3], tidakBaik: i.pct[0] + i.pct[1] }));
  const kuat = withBaikKeatas.filter((x) => x.baikKeatas >= 75).sort((a, b) => b.baikKeatas - a.baikKeatas);
  const lemah = withBaikKeatas.filter((x) => x.tidakBaik >= 50).sort((a, b) => b.tidakBaik - a.tidakBaik);

  const parts: string[] = [];
  parts.push(
    `Rata-rata skor ${title.toLowerCase()} berada pada angka ${avg} dari skala 1-4, dengan skor tertinggi pada ` +
      `"${top.label}" (rata-rata ${top.avg}) dan skor terendah pada "${low.label}" (rata-rata ${low.avg}).`
  );
  if (kuat.length > 0) {
    parts.push(
      `${kuat.length} dari ${items.length} indikator dinilai baik hingga sangat baik oleh mayoritas petugas ` +
        `(75% ke atas), antara lain ${joinQuoted(kuat.map((x) => x.item.label))}.`
    );
  }
  if (lemah.length > 0) {
    parts.push(
      `Namun, penilaian pada ${joinQuoted(lemah.map((x) => x.item.label))} masih didominasi kategori tidak baik ` +
        `hingga sangat tidak baik, sehingga perlu menjadi prioritas perbaikan ke depan.`
    );
  } else {
    parts.push(`Secara umum tidak ada indikator yang didominasi penilaian buruk, menandakan kualitas yang relatif konsisten.`);
  }
  return parts.join(" ");
}

// ------------------------------------------------------------
// Kekuatan & kelemahan publikasi per program (gaya "Pembahasan")
// ------------------------------------------------------------

type FlatYesNo = { label: string; pct: number; source: string };
type FlatScale = { label: string; avgPct: number; source: string };

function flattenYesNo(p: ProgramReport): FlatYesNo[] {
  return [
    ...p.keterpenuhan.map((i) => ({ label: i.label, pct: i.pct, source: "Keterpenuhan" })),
    ...p.kepatuhan.map((i) => ({ label: i.label, pct: i.pct, source: "Kepatuhan" })),
    ...p.saluranInternal.map((i) => ({ label: i.label, pct: i.pct, source: "Saluran internal" })),
    ...p.saluranEksternal.map((i) => ({ label: i.label, pct: i.pct, source: "Saluran eksternal" })),
    ...p.bukti.map((i) => ({ label: i.label, pct: i.pct, source: "Bukti dukung" })),
  ];
}

function flattenScale(p: ProgramReport): FlatScale[] {
  return [
    ...p.narasi.map((i) => ({ label: i.label, avgPct: Math.round((i.avg / 4) * 100), source: "Narasi" })),
    ...p.visual.map((i) => ({ label: i.label, avgPct: Math.round((i.avg / 4) * 100), source: "Visual" })),
  ];
}

export function kekuatanPublikasi(p: ProgramReport): string[] {
  const yesNo = flattenYesNo(p);
  const scale = flattenScale(p);

  let strongYesNo = yesNo.filter((i) => i.pct >= 90).sort((a, b) => b.pct - a.pct);
  let strongScale = scale.filter((i) => i.avgPct >= 80).sort((a, b) => b.avgPct - a.avgPct);

  // Jika belum ada yang memenuhi ambang tinggi, longgarkan agar tetap ada poin yang disampaikan.
  if (strongYesNo.length === 0 && strongScale.length === 0) {
    strongYesNo = [...yesNo].sort((a, b) => b.pct - a.pct).slice(0, 3);
    strongScale = [...scale].sort((a, b) => b.avgPct - a.avgPct).slice(0, 2);
  }

  const out = [
    ...strongYesNo.slice(0, 4).map((i) => `${i.source} "${i.label}" sudah sangat baik, tercapai pada ${i.pct}% sesi yang dinilai.`),
    ...strongScale.slice(0, 2).map((i) => `Kualitas ${i.source.toLowerCase()} pada aspek "${i.label}" dinilai baik hingga sangat baik oleh mayoritas petugas (±${i.avgPct}% setara skor baik ke atas).`),
  ];
  return out.length > 0 ? out : ["Belum ada aspek yang menonjol secara konsisten; seluruh aspek masih berada pada kategori sedang ke bawah."];
}

export function kelemahanPublikasi(p: ProgramReport): string[] {
  const yesNo = flattenYesNo(p);
  const scale = flattenScale(p);

  let weakYesNo = yesNo.filter((i) => i.pct <= 40).sort((a, b) => a.pct - b.pct);
  let weakScale = scale.filter((i) => i.avgPct <= 50).sort((a, b) => a.avgPct - b.avgPct);

  if (weakYesNo.length === 0 && weakScale.length === 0) {
    weakYesNo = [...yesNo].sort((a, b) => a.pct - b.pct).slice(0, 3);
    weakScale = [...scale].sort((a, b) => a.avgPct - b.avgPct).slice(0, 2);
  }

  const out = [
    ...weakYesNo.slice(0, 4).map((i) => `${i.source} "${i.label}" masih rendah, baru tercapai pada ${i.pct}% sesi — perlu menjadi prioritas perbaikan.`),
    ...weakScale.slice(0, 2).map((i) => `Kualitas ${i.source.toLowerCase()} pada aspek "${i.label}" masih di bawah standar (±${i.avgPct}% setara skor baik ke atas) dan perlu pendampingan lebih lanjut.`),
  ];
  return out.length > 0 ? out : ["Tidak ditemukan aspek yang menonjol lemah; capaian relatif merata di seluruh indikator."];
}

// ------------------------------------------------------------
// Narasi utuh per program (dipakai di halaman in-app, docx, dan pdf)
// ------------------------------------------------------------

export function programNarrative(p: ProgramReport) {
  const topProvinsi = p.provinsi[0];
  const ringkasan =
    `Program ${p.name} (${p.code}) mencakup ${p.lkpCount} lembaga yang hasil monevnya telah ` +
    `disetujui, tersebar di ${p.provinsi.length} provinsi` +
    (topProvinsi ? `, dengan konsentrasi terbanyak di ${topProvinsi.provinsi} (${topProvinsi.count} lembaga).` : ".");

  const keterpenuhan = describeYesNo(p.keterpenuhan, "unsur", "Keterpenuhan Unsur Publikasi");
  const salInternal = describeYesNo(p.saluranInternal, "saluran", "Pemanfaatan Saluran Internal");
  const salEksternal = describeYesNo(p.saluranEksternal, "saluran", "Pemanfaatan Saluran Eksternal");
  const bukti = describeYesNo(p.bukti, "jenis bukti", "Kelengkapan Bukti Dukung");
  const kepatuhan = describeYesNo(p.kepatuhan, "unsur", "Kepatuhan Prosedur");

  const kinerjaCount = p.kinerja.cells.length;
  const kinerjaTotal = p.kinerja.cells.reduce((a, c) => a + c.jumlah, 0);
  let kinerja: string;
  if (kinerjaCount === 0) {
    kinerja = "Belum ada data kinerja konten yang tercatat untuk program ini.";
  } else {
    const perLkp = new Map<string, number>();
    for (const c of p.kinerja.cells) perLkp.set(c.lkp, (perLkp.get(c.lkp) ?? 0) + c.jumlah);
    const ranked = [...perLkp.entries()].sort((a, b) => b[1] - a[1]);
    const [topLkp, topLkpTotal] = ranked[0];
    const [lowLkp, lowLkpTotal] = ranked[ranked.length - 1];
    kinerja =
      `Tercatat total ${kinerjaTotal} konten publikasi yang dihasilkan lintas ${p.kinerja.lkpList.length} ` +
      `lembaga pada ${p.kinerja.channelList.length} saluran. ${topLkp} merupakan lembaga paling aktif dengan ` +
      `${topLkpTotal} konten secara keseluruhan` +
      (ranked.length > 1
        ? `, sedangkan ${lowLkp} tercatat paling sedikit dengan ${lowLkpTotal} konten` +
          (ranked.length > 2 ? ", menunjukkan adanya kesenjangan intensitas publikasi yang cukup lebar antar lembaga." : ".")
        : ".");
  }

  const narasi = describeScale(p.narasi, "Kualitas Narasi");
  const visual = describeScale(p.visual, "Kualitas Visual");

  const kekuatan = kekuatanPublikasi(p);
  const kelemahan = kelemahanPublikasi(p);

  return { ringkasan, keterpenuhan, salInternal, salEksternal, bukti, kepatuhan, kinerja, narasi, visual, kekuatan, kelemahan };
}

// ------------------------------------------------------------
// Kesimpulan (narasi) & Rekomendasi (daftar aksi)
// ------------------------------------------------------------

export function kesimpulanNarrative(data: AggregateReportData): string[] {
  const active = data.programs.filter((p) => p.lkpCount > 0);
  if (active.length === 0) {
    return ["Belum ada sesi yang disetujui sehingga kesimpulan belum dapat disusun. Kesimpulan akan terisi otomatis begitu ada sesi yang disetujui."];
  }

  const paragraphs: string[] = [];

  const programSummaries = active.map((p) => {
    const avgKet = p.keterpenuhan.length ? Math.round(p.keterpenuhan.reduce((a, b) => a + b.pct, 0) / p.keterpenuhan.length) : null;
    const avgKep = p.kepatuhan.length ? Math.round(p.kepatuhan.reduce((a, b) => a + b.pct, 0) / p.kepatuhan.length) : null;
    const avgNarasi = p.narasi.length ? Math.round((p.narasi.reduce((a, b) => a + b.avg, 0) / p.narasi.length) * 100) / 100 : null;
    const avgVisual = p.visual.length ? Math.round((p.visual.reduce((a, b) => a + b.avg, 0) / p.visual.length) * 100) / 100 : null;
    return { p, avgKet, avgKep, avgNarasi, avgVisual };
  });

  const intro =
    `Secara keseluruhan, hasil monitoring dan evaluasi terhadap ${programSummaries
      .map((s) => `${s.p.name} (${s.p.code})`)
      .join(" dan ")} menunjukkan publikasi yang sudah berjalan, dengan capaian yang bervariasi antar aspek dan antar lembaga. ` +
    programSummaries
      .map(
        (s) =>
          `Program ${s.p.code} mencatatkan rata-rata keterpenuhan unsur sebesar ${s.avgKet ?? "-"}% dan kepatuhan prosedur sebesar ${s.avgKep ?? "-"}%, ` +
          `dengan kualitas narasi rata-rata ${s.avgNarasi ?? "-"} dan visual rata-rata ${s.avgVisual ?? "-"} dari skala 1-4.`
      )
      .join(" ");
  paragraphs.push(intro);

  // Bandingkan dua program bila keduanya aktif
  if (programSummaries.length === 2) {
    const [a, b] = programSummaries;
    if (a.avgKet != null && b.avgKet != null) {
      const stronger = a.avgKet >= b.avgKet ? a : b;
      const weaker = a.avgKet >= b.avgKet ? b : a;
      if (stronger.avgKet !== weaker.avgKet) {
        paragraphs.push(
          `Dibandingkan satu sama lain, program ${stronger.p.code} unggul pada aspek keterpenuhan unsur publikasi ` +
            `(${stronger.avgKet}% berbanding ${weaker.avgKet}% pada program ${weaker.p.code}), yang mengindikasikan ` +
            `perlunya berbagi praktik baik antar program agar standar publikasi lebih merata.`
        );
      }
    }
  }

  // Rangkum kelemahan lintas program menjadi satu paragraf penutup, masing-masing
  // diberi label kode program agar jelas kelemahan tersebut milik program mana.
  const allWeak = active.flatMap((p) =>
    kelemahanPublikasi(p)
      .slice(0, 2)
      .map((w) => `${p.code}: ${w.replace(/\s*—.*$/, "").replace(/\.$/, "")}`)
  );
  if (allWeak.length > 0) {
    paragraphs.push(
      `Beberapa kelemahan yang masih perlu menjadi fokus perbaikan pada masing-masing program meliputi: ${allWeak.join("; ")}. ` +
        `Perbaikan pada aspek-aspek tersebut akan memberi dampak signifikan terhadap kualitas publikasi secara keseluruhan pada periode berikutnya.`
    );
  }

  return paragraphs;
}

// Ambang batas supaya rekomendasi tidak menyarankan perbaikan pada indikator
// yang sebenarnya sudah mencapai (atau mendekati) nilai maksimal — contoh:
// "worst" dari sekumpulan indikator yang semuanya 100% tetap bernilai 100%,
// dan itu bukan sesuatu yang perlu "ditingkatkan".
const YES_NO_NEEDS_IMPROVEMENT = 90; // %
const SCALE_NEEDS_IMPROVEMENT = 3.5; // dari skala 1-4

export function rekomendasi(data: AggregateReportData): string[] {
  const points: string[] = [];
  for (const p of data.programs) {
    if (p.lkpCount === 0) continue;
    const lowKet = p.keterpenuhan.length ? worst(p.keterpenuhan) : null;
    const lowKep = p.kepatuhan.length ? worst(p.kepatuhan) : null;
    const lowNar = p.narasi.length ? worstScale(p.narasi) : null;
    const lowVis = p.visual.length ? worstScale(p.visual) : null;
    if (lowKet && lowKet.pct < YES_NO_NEEDS_IMPROVEMENT)
      points.push(`Pada program ${p.code}, tingkatkan pemenuhan unsur "${lowKet.label}" yang masih berada di angka ${lowKet.pct}%.`);
    if (lowKep && lowKep.pct < YES_NO_NEEDS_IMPROVEMENT)
      points.push(`Perkuat kepatuhan terhadap unsur "${lowKep.label}" pada program ${p.code} (capaian saat ini ${lowKep.pct}%).`);
    if (lowNar && lowNar.avg < SCALE_NEEDS_IMPROVEMENT)
      points.push(`Tingkatkan kualitas narasi, khususnya pada aspek "${lowNar.label}" di program ${p.code} (rata-rata skor ${lowNar.avg}).`);
    if (lowVis && lowVis.avg < SCALE_NEEDS_IMPROVEMENT)
      points.push(`Tingkatkan kualitas visual, khususnya pada aspek "${lowVis.label}" di program ${p.code} (rata-rata skor ${lowVis.avg}).`);
    if (
      (!lowKet || lowKet.pct >= YES_NO_NEEDS_IMPROVEMENT) &&
      (!lowKep || lowKep.pct >= YES_NO_NEEDS_IMPROVEMENT) &&
      (!lowNar || lowNar.avg >= SCALE_NEEDS_IMPROVEMENT) &&
      (!lowVis || lowVis.avg >= SCALE_NEEDS_IMPROVEMENT)
    ) {
      points.push(`Program ${p.code} sudah menunjukkan capaian yang sangat baik di seluruh aspek utama — pertahankan konsistensi ini pada sesi berikutnya.`);
    }
  }
  points.push("Lakukan pendampingan berkelanjutan kepada lembaga dengan capaian di bawah rata-rata agar kualitas publikasi semakin merata.");
  points.push("Dorong konsistensi tagging akun resmi dan pemanfaatan media massa/eksternal untuk memperluas jangkauan dan legitimasi publikasi.");
  return points;
}

/** @deprecated gunakan kesimpulanNarrative() + rekomendasi() secara terpisah. */
export function kesimpulanRekomendasi(data: AggregateReportData): string[] {
  return rekomendasi(data);
}
