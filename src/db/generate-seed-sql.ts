import bcrypt from "bcryptjs";
import { writeFileSync } from "fs";

function esc(s: string | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}

async function main() {
  const lines: string[] = [];
  lines.push("-- ============================================================");
  lines.push("-- SEED DATA: Monev Publikasi 2026 (PKK & PKW)");
  lines.push("-- Jalankan SETELAH migration (0000_damp_mongu.sql) di Neon SQL Editor");
  lines.push("-- ============================================================");
  lines.push("");

  // Programs
  lines.push(`INSERT INTO programs (code, name) VALUES`);
  lines.push(`  ('PKK', 'Pendidikan Kecakapan Kerja'),`);
  lines.push(`  ('PKW', 'Pendidikan Kecakapan Wirausaha');`);
  lines.push("");

  // Skills
  const skillNames = [
    "Perbaikan Telepon Seluler",
    "Tata Rias Pengantin",
    "Tata Kecantikan Kulit",
    "Tata Boga (Jasa Usaha Makanan)",
    "Pastry & Bakery",
    "Mekanik Sepeda Motor",
    "Teknik Komputer",
    "Tata Kecantikan Rambut",
    "Las/Pengelasan",
    "Mengelas",
  ];
  lines.push(`INSERT INTO skills (name) VALUES`);
  lines.push(skillNames.map((s) => `  (${esc(s)})`).join(",\n") + ";");
  lines.push("");

  // Locations (skill_id via subquery on unique skill name)
  const locationData: {
    provinsi: string;
    kabKota: string;
    namaLembaga: string;
    skill: string;
    penanggungJawab: string;
    noTelp: string;
    alamat: string;
  }[] = [
    { provinsi: "D.I. Yogyakarta", kabKota: "Kab. Sleman", namaLembaga: 'LKP "AFTA VISION"', skill: "Perbaikan Telepon Seluler", penanggungJawab: "SUKESMIYATI, A.Md.", noTelp: "085732215088", alamat: "Jl. Selokan Mataram No.5C Kaliurang KM 4.5 CT III" },
    { provinsi: "D.K.I. Jakarta", kabKota: "Kota Jakarta Utara", namaLembaga: "LKP Firmansyah", skill: "Tata Rias Pengantin", penanggungJawab: "NURLELIAWATI", noTelp: "081315970119", alamat: "Jl. Mahoni Gg.3 Blok B No.4" },
    { provinsi: "Jawa Barat", kabKota: "Kab. Indramayu", namaLembaga: "LKP RAMONA", skill: "Tata Kecantikan Kulit", penanggungJawab: "ELIJANA", noTelp: "08122201252", alamat: "Jln. Raya Bulak No.476" },
    { provinsi: "Jawa Barat", kabKota: "Kab. Bogor", namaLembaga: "LKP Viderista", skill: "Tata Boga (Jasa Usaha Makanan)", penanggungJawab: "Drs MAMAN MULYATNA", noTelp: "081384744637", alamat: "Jl. Raya Puncak Gadog No.51, RT.04/RW.02, Citeko, Kec. Cisarua, Kabupaten Bogor, Jawa Barat 16750" },
    { provinsi: "Jawa Barat", kabKota: "Kota Cimahi", namaLembaga: "LKP ELIDAS", skill: "Pastry & Bakery", penanggungJawab: "ELIDA HAFNI S.E", noTelp: "081395053413", alamat: "Kompleks Taman Bukit Cibogo Blok A9 No 15, Rt.02/Rw.17, Leuwigajah, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40532" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Cilacap", namaLembaga: "LKP BINA BANGSA BERSAMA", skill: "Mekanik Sepeda Motor", penanggungJawab: "Mukholid Anshori, S.Pd", noTelp: "082227717751", alamat: "JL. MENUR NO. 10, RT.02 / RW.04" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Tegal", namaLembaga: "LKP SKI COMPUTER", skill: "Teknik Komputer", penanggungJawab: "RINA RISKIANA", noTelp: "085786666159", alamat: "Jl. Semanggi Raya No 96" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Demak", namaLembaga: "LKP FLORENZA", skill: "Tata Kecantikan Rambut", penanggungJawab: "IRYANTI", noTelp: "085727184748", alamat: "Jl. Ki Godek Desa Bulusari Kecamatan Sayung Kabupaten Demak" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Karanganyar", namaLembaga: "LKP ASTI", skill: "Las/Pengelasan", penanggungJawab: "Lastri, S.Sos.I.MM.", noTelp: "081228206713", alamat: "Jl. Kepuh No 10 Rt 01/03, Kel. Lalung, Kec. Karanganyar, Kab. Karanganyar, Prov. Jawa Tengah" },
    { provinsi: "Jawa Timur", kabKota: "Kab. Blitar", namaLembaga: "LKP BERDIKARI", skill: "Mengelas", penanggungJawab: "Rizki Saputra Wibisono, S.Tr.Kom", noTelp: "085815061715", alamat: "Dusun Bukur" },
  ];
  lines.push(`-- Locations`);
  for (const l of locationData) {
    lines.push(
      `INSERT INTO locations (provinsi, kab_kota, nama_lembaga, skill_id, penanggung_jawab, no_telp, alamat, tanggal_monev_mulai, tanggal_monev_selesai) VALUES (` +
        `${esc(l.provinsi)}, ${esc(l.kabKota)}, ${esc(l.namaLembaga)}, (SELECT id FROM skills WHERE name = ${esc(l.skill)}), ${esc(l.penanggungJawab)}, ${esc(l.noTelp)}, ${esc(l.alamat)}, '2026-09-24', '2026-09-26');`
    );
  }
  lines.push("");

  // Users
  const superAdminHash = await bcrypt.hash("Admin2026!", 10);
  const viewerHash = await bcrypt.hash("Viewer2026!", 10);
  const petugasHash = await bcrypt.hash("Monev2026!", 10);

  lines.push(`-- Users`);
  lines.push(
    `INSERT INTO users (name, username, email, password_hash, role, is_active) VALUES (` +
      `'Super Admin', 'superadmin', 'superadmin@kemendikdasmen.go.id', ${esc(superAdminHash)}, 'SUPER_ADMIN', true);`
  );
  lines.push(
    `INSERT INTO users (name, username, email, password_hash, role, is_active) VALUES (` +
      `'Pimpinan Direktorat', 'viewer', 'pimpinan@kemendikdasmen.go.id', ${esc(viewerHash)}, 'VIEWER', true);`
  );

  type OfficerDef = { name: string; username: string; isUnit?: boolean };
  const officerList: OfficerDef[] = [
    { name: "Yaya Sutarya", username: "yaya.sutarya" },
    { name: "Eddi Saputro", username: "eddi.saputro" },
    { name: "Faiz Ayatullah", username: "faiz.ayatullah" },
    { name: "Lisvi", username: "lisvi" },
    { name: "Supriono", username: "supriono" },
    { name: "Setditjen", username: "setditjen", isUnit: true },
    { name: "BKHM", username: "bkhm", isUnit: true },
    { name: "Nurleily", username: "nurleily" },
    { name: "Fadly", username: "fadly" },
    { name: "Soni Ramadhan", username: "soni.ramadhan" },
    { name: "Chrismi Widjajanti", username: "chrismi.widjajanti" },
    { name: "Yeni Pratiwi", username: "yeni.pratiwi" },
    { name: "Nasikin", username: "nasikin" },
    { name: "Atik Riyanti", username: "atik.riyanti" },
    { name: "Anisa Permatasari", username: "anisa.permatasari" },
    { name: "Darmono", username: "darmono" },
    { name: "Dyah", username: "dyah" },
    { name: "Badrutaman", username: "badrutaman" },
    { name: "Ferdi", username: "ferdi" },
  ];
  for (const o of officerList) {
    lines.push(
      `INSERT INTO users (name, username, password_hash, role, is_unit_account, is_active) VALUES (` +
        `${esc(o.name)}, ${esc(o.username)}, ${esc(petugasHash)}, 'PETUGAS', ${o.isUnit ? "true" : "false"}, true);`
    );
  }
  lines.push("");

  // Assignments (via subqueries on username + nama_lembaga)
  const assignmentMap: { lembaga: string; petugas: string[] }[] = [
    { lembaga: "LKP ASTI", petugas: ["yaya.sutarya", "eddi.saputro", "faiz.ayatullah", "lisvi"] },
    { lembaga: 'LKP "AFTA VISION"', petugas: ["supriono", "setditjen"] },
    { lembaga: "LKP Firmansyah", petugas: ["bkhm", "nurleily", "fadly"] },
    { lembaga: "LKP RAMONA", petugas: ["setditjen", "soni.ramadhan"] },
    { lembaga: "LKP Viderista", petugas: ["chrismi.widjajanti", "yeni.pratiwi", "nasikin"] },
    { lembaga: "LKP ELIDAS", petugas: ["atik.riyanti", "anisa.permatasari"] },
    { lembaga: "LKP BINA BANGSA BERSAMA", petugas: ["bkhm", "darmono"] },
    { lembaga: "LKP SKI COMPUTER", petugas: ["bkhm", "dyah"] },
    { lembaga: "LKP FLORENZA", petugas: ["setditjen", "badrutaman"] },
    { lembaga: "LKP BERDIKARI", petugas: ["bkhm", "ferdi"] },
  ];
  lines.push(`-- Assignments`);
  for (const a of assignmentMap) {
    for (const username of a.petugas) {
      lines.push(
        `INSERT INTO assignments (user_id, location_id, periode) VALUES (` +
          `(SELECT id FROM users WHERE username = ${esc(username)}), (SELECT id FROM locations WHERE nama_lembaga = ${esc(a.lembaga)}), '2026');`
      );
    }
  }
  lines.push("");

  // Indicators
  const keterpenuhanPKK = ["Pembelajaran dan praktik keterampilan", "Peningkatan kompetensi/kesiapan kerja", "Kemitraan industri", "Magang industri", "Uji kompetensi", "Penempatan kerja"];
  const keterpenuhanPKW = ["Pembelajaran dan proses produksi", "Pendampingan usaha", "Pembentukan/rintisan usaha", "Pemasaran digital"];
  const kepatuhan = ["Publikasi pada kanal/media sosial lembaga", "Tagging akun resmi Direktorat", "Tagging akun resmi Ditjen", "Identitas program tercantum", "Lokasi dapat dikenali", "Tahapan kegiatan dapat dikenali", "Media massa nasional/lokal dimanfaatkan bila tersedia"];
  const kinerja = ["Jumlah konten", "Ragam format", "Konsistensi unggahan", "Keseimbangan visual dengan artikel/rilis", "Pemanfaatan media eksternal", "Distribusi lintas kanal"];
  const narasi = ["Kejelasan proses dan hasil", "Ringkas dan fokus", "Alur cerita runtut", "Data capaian mendukung", "Kutipan peserta/mitra", "Orientasi dampak", "Human story", "Tantangan menuju keberhasilan", "Kolaborasi/partisipasi", "Kompetensi relevan dan pemberdayaan"];
  const visual = ["Pencahayaan", "Komposisi", "Stabilitas gambar/video", "Relevansi visual", "Kualitas audio/testimoni", "Identitas peserta/lokasi/lembaga", "Kelengkapan konteks", "Kesiapan tayang"];

  lines.push(`-- Indicators`);
  const insIndicator = (category: string, scope: string | null, label: string, respType: string, urutan: number) =>
    lines.push(
      `INSERT INTO indicators (category, program_scope, label, response_type, urutan) VALUES ('${category}', ${scope ? `'${scope}'` : "NULL"}, ${esc(label)}, '${respType}', ${urutan});`
    );
  keterpenuhanPKK.forEach((l, i) => insIndicator("KETERPENUHAN", "PKK", l, "BOOLEAN", i + 1));
  keterpenuhanPKW.forEach((l, i) => insIndicator("KETERPENUHAN", "PKW", l, "BOOLEAN", i + 1));
  kepatuhan.forEach((l, i) => insIndicator("KEPATUHAN", null, l, "BOOLEAN", i + 1));
  kinerja.forEach((l, i) => insIndicator("KINERJA", null, l, "SCALE_1_4", i + 1));
  narasi.forEach((l, i) => insIndicator("NARASI", null, l, "SCALE_1_4", i + 1));
  visual.forEach((l, i) => insIndicator("VISUAL", null, l, "SCALE_1_4", i + 1));
  lines.push("");

  // Publication channels
  lines.push(`-- Publication Channels`);
  const channels: [string, string, number][] = [
    ["Instagram", "INTERNAL", 1], ["Facebook", "INTERNAL", 2], ["YouTube", "INTERNAL", 3], ["TikTok", "INTERNAL", 4],
    ["Website/Blog", "INTERNAL", 5], ["X/Twitter", "INTERNAL", 6], ["WhatsApp/Telegram/Komunitas", "INTERNAL", 7],
    ["Media online/portal berita", "EKSTERNAL", 8], ["Media cetak", "EKSTERNAL", 9], ["TV/Radio nasional/lokal", "EKSTERNAL", 10],
  ];
  for (const [name, type, urutan] of channels) {
    lines.push(`INSERT INTO publication_channels (name, type, urutan) VALUES (${esc(name)}, '${type}', ${urutan});`);
  }
  lines.push("");

  // Evidence types
  const evidencePKK = ["Foto/video pembelajaran & praktik", "Video YouTube 7–15 menit", "Bukti peningkatan kompetensi/kesiapan kerja", "Bukti kemitraan industri", "Bukti magang industri", "Testimoni peserta/lulusan", "Uji kompetensi/sertifikasi", "Penempatan kerja", "Testimoni mitra/HR/pembimbing", "Artikel/siaran pers"];
  const evidencePKW = ["Foto/video pembelajaran & produksi", "Video YouTube 7–15 menit", "Bukti pendampingan usaha", "Bukti rintisan usaha", "Testimoni peserta", "Testimoni mitra usaha", "Aktivitas bisnis/usaha lulusan", "Bukti penjualan/katalog/marketplace", "Artikel/siaran pers"];
  lines.push(`-- Evidence Types`);
  evidencePKK.forEach((l, i) => lines.push(`INSERT INTO evidence_types (program_scope, label, urutan) VALUES ('PKK', ${esc(l)}, ${i + 1});`));
  evidencePKW.forEach((l, i) => lines.push(`INSERT INTO evidence_types (program_scope, label, urutan) VALUES ('PKW', ${esc(l)}, ${i + 1});`));
  lines.push("");

  // Story brief elements
  const briefElements: [string, string | null][] = [
    ["Subjek utama", "Peserta/lulusan, dilengkapi instruktur/pengelola dan mitra"],
    ["Kondisi awal", "Bagaimana kondisi sebelum program?"],
    ["Tantangan", "Apa tantangan utama?"],
    ["Proses", "Apa yang dipelajari/dilakukan dan dukungan yang diterima?"],
    ["Perubahan", "Keterampilan/perubahan apa yang paling terasa?"],
    ["Hasil/dampak", "Kerja, usaha, produk, penjualan, sertifikasi, dll."],
    ["Rencana ke depan", null],
    ["Mitra", "Alasan bermitra, kompetensi yang dibutuhkan, kualitas peserta, kelanjutan"],
    ["Data", "Peserta, kompetensi/sertifikasi, produk/jasa, penempatan, magang, penjualan/omzet bila relevan dan terverifikasi"],
    ["Visual wajib", "Lokasi, proses, close-up keterampilan, interaksi, hasil kerja, mitra, testimoni, aktivitas kerja/usaha"],
    ["Output", "Foto pilihan, video vertikal, video 7–15 menit bila ditetapkan, kutipan, caption, bahan rilis"],
    ["Etika", "Persetujuan dokumentasi; tidak menampilkan data pribadi sensitif; klaim terverifikasi"],
  ];
  lines.push(`-- Story Brief Elements`);
  briefElements.forEach(([elemen, arahan], i) =>
    lines.push(`INSERT INTO story_brief_elements (urutan, elemen, arahan) VALUES (${i + 1}, ${esc(elemen)}, ${esc(arahan)});`)
  );
  lines.push("");

  // Interview question templates
  const pertanyaanPeserta = [
    "Sebelum program, bagaimana kondisi/kebutuhan Anda?",
    "Keterampilan apa yang paling berubah?",
    "Apa yang sudah dilakukan setelah program?",
    "Apa hasil konkret yang dicapai?",
    "Apa tantangan yang masih dihadapi?",
    "Apa rencana berikutnya?",
  ];
  const pertanyaanMitra = [
    "Mengapa Bapak/Ibu/lembaga bermitra dengan LKP ini?",
    "Kompetensi/keterampilan apa yang paling dibutuhkan dari peserta/lulusan?",
    "Bagaimana kualitas peserta/lulusan yang sudah magang, bekerja, atau bermitra di tempat Bapak/Ibu?",
    "Apa bentuk dukungan yang diberikan kepada LKP/peserta (mis. tempat magang, pelatihan tambahan, penyerapan kerja)?",
    "Bagaimana rencana kelanjutan kerja sama ke depan?",
  ];
  lines.push(`-- Interview Question Templates`);
  const roleScopesGeneric = ["PESERTA", "ALUMNI", "INSTRUKTUR", "PENGELOLA", "LAINNYA"];
  for (const role of roleScopesGeneric) {
    pertanyaanPeserta.forEach((p, i) =>
      lines.push(`INSERT INTO interview_question_templates (role_scope, urutan, pertanyaan) VALUES ('${role}', ${i + 1}, ${esc(p)});`)
    );
  }
  pertanyaanMitra.forEach((p, i) =>
    lines.push(`INSERT INTO interview_question_templates (role_scope, urutan, pertanyaan) VALUES ('MITRA', ${i + 1}, ${esc(p)});`)
  );

  lines.push("");
  lines.push("-- SELESAI. Login: superadmin/Admin2026! | viewer/Viewer2026! | <username petugas>/Monev2026!");

  writeFileSync("/mnt/user-data/outputs/seed_data.sql", lines.join("\n"));
  console.log("Generated /mnt/user-data/outputs/seed_data.sql with", lines.length, "lines");
}

main();
