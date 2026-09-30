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
    "Tata Operasi Darat /Ground Handling Bandara",
    "Tata Busana",
    "Otomotif Teknik Sepeda Motor",
    "Desain Grafis",
    "Administrasi Perkantoran/Sekretaris",
    "Tata Boga (Jasa Usaha Makanan)",
    "Pastry & Bakery",
    "Teknik Komputer",
    "Tata Kecantikan Rambut",
    "Las/Pengelasan",
  ];
  lines.push(`INSERT INTO skills (name) VALUES`);
  lines.push(skillNames.map((s) => `  (${esc(s)})`).join(",\n") + ";");
  lines.push("");

  // Locations (skill_id via subquery on unique skill name)
  // Nama petugas Monev Publikasi persis sesuai Surat Pemberitahuan Nomor
  // 2007/B/D3/DV.02.00/2026 tanggal 28 September 2026 (bukan akun login).
  const locationData: {
    provinsi: string;
    kabKota: string;
    namaLembaga: string;
    skill: string;
    penanggungJawab: string;
    noTelp: string;
    alamat: string;
    namaPetugasMonev: string;
  }[] = [
    { provinsi: "D.I. Yogyakarta", kabKota: "Kab. Sleman", namaLembaga: "LKP Total Outsource Development (TOD)", skill: "Tata Operasi Darat /Ground Handling Bandara", penanggungJawab: "ANNA HANDAYANI, S.E.", noTelp: "082136297499", alamat: "Jl. Solo Km. 10,5 No. 36 Sorogenen Rt 03 Rw 01 Kalasan, Sleman, DI Yogyakarta", namaPetugasMonev: "Supriono, Shaka Guna Pertamana" },
    { provinsi: "Jawa Barat", kabKota: "Kab. Bandung", namaLembaga: "LKP BINA ESSA", skill: "Tata Busana", penanggungJawab: "Nana Supriatna", noTelp: "081220215718", alamat: "Jl. Raya Laswi Komplek Griya Pesona No. 1C", namaPetugasMonev: "Fauziannisa Pradana Putri, Dyah S.S." },
    { provinsi: "Jawa Barat", kabKota: "Kab. Cianjur", namaLembaga: "LKP PRIMA", skill: "Otomotif Teknik Sepeda Motor", penanggungJawab: "Cep Yudi Hamdani", noTelp: "085723048026", alamat: "Jln.Perintis Kemerdekaan No.07 Pataruman RT.03 RW.11", namaPetugasMonev: "Soni W.R, Lili Dyah Ayu Candra" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Cilacap", namaLembaga: "LKP MEDIA KOMPUTER", skill: "Desain Grafis", penanggungJawab: "AGUS WIDAYAT", noTelp: "081225056446", alamat: "Jl. Kelapa Sawit No. 02, Kec. Sidareja, Kab. Cilacap, Jawa Tengah", namaPetugasMonev: "Rany Larasari, Badrutaman" },
    { provinsi: "Jawa Timur", kabKota: "Kota Kediri", namaLembaga: "LKP BUTIRAN ILMU", skill: "Administrasi Perkantoran/Sekretaris", penanggungJawab: "", noTelp: "081231842118", alamat: "Jl. Agus Salim No. 94, Bandarkidul, Mojoroto, Kota Kediri", namaPetugasMonev: "Iwan Aries S., Darmono" },
    { provinsi: "Jawa Barat", kabKota: "Kab. Bogor", namaLembaga: "LKP Viderista", skill: "Tata Boga (Jasa Usaha Makanan)", penanggungJawab: "Drs MAMAN MULYATNA", noTelp: "081384744637", alamat: "Jl. Raya Puncak Gadog No.51, RT.04/RW.02, Citeko, Kec. Cisarua, Kabupaten Bogor, Jawa Barat 16750", namaPetugasMonev: "Chrismi W., Yeni Pratiwi, Nasikin" },
    { provinsi: "Jawa Barat", kabKota: "Kota Cimahi", namaLembaga: "LKP ELIDAS", skill: "Pastry & Bakery", penanggungJawab: "ELIDA HAFNI S.E", noTelp: "081395053413", alamat: "Kompleks Taman Bukit Cibogo Blok A9 No 15, Rt.02/Rw.17, Leuwigajah, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40532", namaPetugasMonev: "Atik Riyanti, Annisa P., Nurlely" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Tegal", namaLembaga: "LKP SKI COMPUTER", skill: "Teknik Komputer", penanggungJawab: "RINA RISKIANA", noTelp: "085786666159", alamat: "Jl. Semanggi Raya No 96", namaPetugasMonev: "Ferdy H., A. Fadly" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Demak", namaLembaga: "LKP FLORENZA", skill: "Tata Kecantikan Rambut", penanggungJawab: "IRYANTI", noTelp: "085727184748", alamat: "Jl. Ki Godek Desa Bulusari Kecamatan Sayung Kabupaten Demak", namaPetugasMonev: "Agung Sulistomo, Ramdhan Noor Putra Wira" },
    { provinsi: "Jawa Tengah", kabKota: "Kab. Karanganyar", namaLembaga: "LKP ASTI", skill: "Las/Pengelasan", penanggungJawab: "Lastri, S.Sos.I.MM.", noTelp: "081228206713", alamat: "Jl. Kepuh No 10 Rt 01/03, Kel. Lalung, Kec. Karanganyar, Kab. Karanganyar, Prov. Jawa Tengah", namaPetugasMonev: "Yaya Sutarya, Faiz Ayatullah, Sasmita W., Lisvi N." },
  ];
  lines.push(`-- Locations`);
  for (const l of locationData) {
    lines.push(
      `INSERT INTO locations (provinsi, kab_kota, nama_lembaga, skill_id, penanggung_jawab, no_telp, alamat, nama_petugas_monev, tanggal_monev_mulai, tanggal_monev_selesai) VALUES (` +
        `${esc(l.provinsi)}, ${esc(l.kabKota)}, ${esc(l.namaLembaga)}, (SELECT id FROM skills WHERE name = ${esc(l.skill)}), ${esc(l.penanggungJawab)}, ${esc(l.noTelp)}, ${esc(l.alamat)}, ${esc(l.namaPetugasMonev)}, '2026-10-01', '2026-10-06');`
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

  // Tidak ada lagi akun login individu per nama petugas - login PETUGAS hanya
  // lewat 1 akun bersama per lokasi (ID Lokasi Monev, di bawah). Nama petugas
  // per lokasi sesuai Surat Pemberitahuan sudah tersimpan di kolom
  // locations.nama_petugas_monev di atas.
  void petugasHash;

  const locationAccountList: { lembaga: string; username: string; password: string }[] = [
    { lembaga: "LKP Total Outsource Development (TOD)", username: "lkp-tod", password: "TOD2026!" },
    { lembaga: "LKP BINA ESSA", username: "lkp-binaessa", password: "BinaEssa2026!" },
    { lembaga: "LKP PRIMA", username: "lkp-prima", password: "Prima2026!" },
    { lembaga: "LKP MEDIA KOMPUTER", username: "lkp-mediakomputer", password: "MediaKomputer2026!" },
    { lembaga: "LKP BUTIRAN ILMU", username: "lkp-butiranilmu", password: "ButiranIlmu2026!" },
    { lembaga: "LKP Viderista", username: "lkp-viderista", password: "Viderista2026!" },
    { lembaga: "LKP ELIDAS", username: "lkp-elidas", password: "Elidas2026!" },
    { lembaga: "LKP SKI COMPUTER", username: "lkp-skicomputer", password: "SkiComputer2026!" },
    { lembaga: "LKP FLORENZA", username: "lkp-florenza", password: "Florenza2026!" },
    { lembaga: "LKP ASTI", username: "lkp-asti", password: "Asti2026!" },
  ];
  lines.push(`-- Akun per lokasi (ID Lokasi Monev - satu-satunya cara login untuk PETUGAS)`);
  for (const l of locationAccountList) {
    const hash = await bcrypt.hash(l.password, 10);
    lines.push(
      `INSERT INTO users (name, username, password_hash, role, is_unit_account, is_active) VALUES (` +
        `${esc(`Tim Petugas - ${l.lembaga}`)}, ${esc(l.username)}, ${esc(hash)}, 'PETUGAS', true, true);`
    );
  }
  lines.push("");

  lines.push(`-- Assignments (akun lokasi -> lokasinya masing-masing)`);
  for (const l of locationAccountList) {
    lines.push(
      `INSERT INTO assignments (user_id, location_id, periode) VALUES (` +
        `(SELECT id FROM users WHERE username = ${esc(l.username)}), (SELECT id FROM locations WHERE nama_lembaga = ${esc(l.lembaga)}), '2026');`
    );
  }
  lines.push("");

  // Indicators
  const keterpenuhanPKK: [string, string][] = [
    ["Pembelajaran dan praktik keterampilan", "Sudah ada unggahan yang menunjukkan proses belajar/praktik keterampilan peserta. Contoh: foto/video peserta praktik menjahit atau video suasana kelas pelatihan diunggah ke Instagram."],
    ["Peningkatan kompetensi/kesiapan kerja", "Sudah ada publikasi yang menunjukkan peningkatan kompetensi atau kesiapan kerja peserta. Contoh: postingan testimoni peserta merasa lebih siap kerja, atau sertifikat kompetensi yang diunggah."],
    ["Kemitraan industri", "Sudah ada publikasi yang menampilkan kerja sama dengan industri/perusahaan mitra. Contoh: foto kunjungan industri, penandatanganan MoU, atau kegiatan bersama mitra industri."],
    ["Magang industri", "Sudah ada publikasi kegiatan magang peserta di industri/perusahaan. Contoh: foto/video peserta magang di lokasi perusahaan atau unggahan aktivitas magang."],
    ["Uji kompetensi", "Sudah ada publikasi pelaksanaan uji kompetensi peserta. Contoh: foto peserta mengikuti uji kompetensi atau hasil penilaian asesor yang diunggah."],
    ["Penempatan kerja", "Sudah ada publikasi yang menunjukkan peserta yang sudah bekerja/ditempatkan. Contoh: postingan \"alumni diterima kerja di ...\" atau data jumlah peserta yang terserap kerja."],
  ];
  const keterpenuhanPKW: [string, string][] = [
    ["Pembelajaran dan proses produksi", "Sudah ada unggahan proses belajar dan produksi usaha peserta. Contoh: video proses produksi kerajinan/kuliner atau foto peserta praktik produksi."],
    ["Pendampingan usaha", "Sudah ada publikasi kegiatan pendampingan usaha ke peserta. Contoh: foto sesi mentoring/konsultasi usaha atau video pendampingan langsung ke lokasi usaha peserta."],
    ["Pembentukan/rintisan usaha", "Sudah ada publikasi usaha baru yang dirintis peserta. Contoh: postingan \"usaha baru peserta ...\" atau logo/brand usaha rintisan yang diunggah."],
    ["Pemasaran digital", "Sudah ada publikasi kegiatan pemasaran digital yang dilakukan peserta. Contoh: tangkapan layar toko online peserta atau konten promosi produk di media sosial/marketplace."],
  ];
  const kepatuhan: [string, string][] = [
    ["Publikasi pada kanal/media sosial lembaga", "Konten diunggah lewat akun resmi lembaga, bukan akun pribadi perorangan. Contoh: diunggah di akun Instagram/Facebook resmi LKP, bukan akun pribadi instruktur."],
    ["Tagging akun resmi Direktorat", "Postingan menandai (tag/mention) akun resmi Direktorat Kursus dan Pelatihan. Contoh: mention @kursuskita di caption atau menandai akun tersebut di foto."],
    ["Tagging akun resmi Ditjen", "Postingan menandai akun resmi Ditjen terkait. Contoh: mention/tag akun Instagram resmi Ditjen terkait di caption."],
    ["Identitas program tercantum", "Nama program (PKK/PKW) disebutkan jelas dalam konten. Contoh: caption menyebut \"Program PKK Barista 2026\" atau ada watermark nama program di visual."],
    ["Lokasi dapat dikenali", "Nama LKP/kota/kabupaten pelaksana disebutkan atau terlihat di konten. Contoh: caption menyebut \"LKP Elidas, Kota Cimahi\" atau plang nama lembaga terlihat di video."],
    ["Tahapan kegiatan dapat dikenali", "Tahapan kegiatan (pembukaan, pelatihan, uji kompetensi, dst) jelas disebutkan/terlihat. Contoh: caption menyebut \"Hari ke-3: Uji Kompetensi\" atau ada judul tahapan di video."],
    ["Media massa nasional/lokal dimanfaatkan bila tersedia", "Ada pemberitaan di media massa, bila memang tersedia peliputan media. Contoh: tautan berita di portal berita lokal atau kliping koran tentang kegiatan program."],
  ];
  const kinerja: [string, string][] = [
    ["Jumlah konten", "Total unggahan terkait program selama periode Monev. Skor 1 = hanya 1 unggahan; Skor 2 = 2-3 unggahan; Skor 3 = 4-6 unggahan; Skor 4 = 7 unggahan atau lebih."],
    ["Ragam format", "Variasi format konten: foto, video, reels/story, artikel. Skor 1 = hanya 1 format (mis. foto saja); Skor 2 = 2 format (mis. foto & video); Skor 3 = 3 format (foto, video, reels/story); Skor 4 = 4 format atau lebih."],
    ["Konsistensi unggahan", "Keteraturan jadwal unggah selama periode kegiatan (1-6 Okt). Skor 1 = semua diunggah sekaligus di 1 hari; Skor 2 = diunggah pada 2 hari saja; Skor 3 = diunggah pada 3-4 hari berbeda; Skor 4 = diunggah hampir tiap hari kegiatan (5-6 hari)."],
    ["Keseimbangan visual dengan artikel/rilis", "Apakah konten visual diimbangi tulisan. Skor 1 = hanya visual tanpa keterangan tertulis sama sekali; Skor 2 = ada caption pendek 1 kalimat saja; Skor 3 = ada caption panjang menjelaskan kegiatan; Skor 4 = ada caption panjang dan artikel/siaran pers terpisah."],
    ["Pemanfaatan media eksternal", "Apakah publikasi menjangkau media di luar akun resmi lembaga. Skor 1 = tidak ada publikasi di luar akun sendiri; Skor 2 = dibagikan ulang oleh 1 akun komunitas/individu; Skor 3 = diliput oleh 1 media eksternal; Skor 4 = diliput lebih dari 1 media eksternal atau media massa nasional/lokal."],
    ["Distribusi lintas kanal", "Apakah konten yang sama disebarkan ke beberapa kanal media sosial. Skor 1 = hanya 1 kanal (mis. Instagram saja); Skor 2 = 2 kanal; Skor 3 = 3 kanal; Skor 4 = 4 kanal atau lebih."],
  ];
  const narasi: [string, string][] = [
    ["Kejelasan proses dan hasil", "Skor 1 = pembaca sama sekali tidak paham apa yang dikerjakan/hasilnya; Skor 2 = ada gambaran tapi masih membingungkan; Skor 3 = cukup jelas walau perlu dibaca ulang; Skor 4 = langsung jelas tanpa penjelasan tambahan (mis. \"peserta belajar menjahit 2 minggu, kini bisa membuat 3 model baju\")."],
    ["Ringkas dan fokus", "Skor 1 = sangat bertele-tele, melebar jauh dari topik; Skor 2 = panjang dan masih ada bagian tidak relevan; Skor 3 = cukup ringkas, sedikit melebar; Skor 4 = 3-5 kalimat, semua langsung ke inti cerita."],
    ["Alur cerita runtut", "Skor 1 = cerita meloncat-loncat, sulit diikuti; Skor 2 = alur ada tapi urutannya kadang membingungkan; Skor 3 = cukup runtut dengan sedikit bagian tidak berurutan; Skor 4 = mengalir logis: kondisi awal - proses - hasil."],
    ["Data cerita baik mendukung", "Skor 1 = tidak ada angka/data sama sekali; Skor 2 = ada klaim tanpa angka jelas (mis. \"banyak yang berhasil\"); Skor 3 = ada 1 data konkret (mis. \"15 peserta lulus\"); Skor 4 = ada beberapa data konkret (mis. \"lulus 18 dari 20 peserta, omzet naik 25%\")."],
    ["Kutipan peserta/mitra", "Skor 1 = tidak ada kutipan sama sekali; Skor 2 = ada kutipan tapi hanya parafrase dari LKP; Skor 3 = ada 1 kutipan langsung dari peserta/mitra; Skor 4 = ada lebih dari 1 kutipan langsung, mis. \"Sekarang saya berani buka usaha sendiri\"."],
    ["Orientasi dampak", "Skor 1 = tidak menyebut dampak apa pun bagi peserta; Skor 2 = dampak disebut secara umum tanpa detail; Skor 3 = ada 1 dampak konkret bagi peserta; Skor 4 = dampak konkret dan spesifik, mis. \"penghasilan bertambah Rp1 juta/bulan\"."],
    ["Human story", "Skor 1 = sepenuhnya laporan formal tanpa elemen personal; Skor 2 = ada sedikit elemen personal tapi masih kaku; Skor 3 = elemen personal cukup terasa; Skor 4 = cerita personal/emosional yang kuat dan relate-able."],
    ["Tantangan menuju keberhasilan", "Skor 1 = tidak ada tantangan disebutkan sama sekali; Skor 2 = tantangan disebut sekilas tanpa detail; Skor 3 = tantangan dijelaskan cukup detail; Skor 4 = tantangan dan proses mengatasinya dijelaskan jelas sebelum hasil akhir."],
    ["Kolaborasi/partisipasi", "Skor 1 = hanya LKP sendiri, tidak ada pihak lain disebut; Skor 2 = ada 1 pihak lain disebut sekilas; Skor 3 = ada 1-2 pihak lain (mitra/instruktur/pemda) dijelaskan perannya; Skor 4 = beberapa pihak dengan peran masing-masing dijelaskan jelas."],
    ["Kompetensi relevan dan pemberdayaan", "Skor 1 = tidak ada hubungan antara keterampilan dan pemberdayaan nyata; Skor 2 = disebut sekilas tanpa contoh nyata; Skor 3 = ada 1 contoh nyata pemberdayaan (kerja/usaha); Skor 4 = hubungan keterampilan-pemberdayaan dijelaskan jelas dengan contoh nyata."],
  ];
  const visual: [string, string][] = [
    ["Pencahayaan", "Skor 1 = gambar/video gelap total atau backlit parah (subjek gelap karena cahaya dari belakang); Skor 2 = pencahayaan kurang di sebagian besar konten; Skor 3 = cukup terang dengan sedikit bagian kurang; Skor 4 = terang dan merata di seluruh konten."],
    ["Komposisi", "Skor 1 = subjek terpotong aneh/tata letak berantakan; Skor 2 = subjek terlihat tapi tata letak kurang rapi; Skor 3 = tata letak cukup rapi dengan sedikit kekurangan; Skor 4 = subjek jadi fokus, tata letak rapi dan seimbang."],
    ["Stabilitas gambar/video", "Skor 1 = goyang/blur berlebihan di sebagian besar video; Skor 2 = goyang di beberapa bagian; Skor 3 = cukup stabil dengan sedikit goyangan; Skor 4 = stabil sepenuhnya, tidak goyang/blur."],
    ["Relevansi visual", "Skor 1 = visual generik, tidak nyambung dengan cerita (mis. foto stok dari internet); Skor 2 = visual agak nyambung tapi kurang spesifik; Skor 3 = visual cukup menggambarkan kegiatan; Skor 4 = visual benar-benar menggambarkan kegiatan/topik secara spesifik."],
    ["Kualitas audio/testimoni", "Skor 1 = suara tidak terdengar/tertutup bising (mis. angin, kendaraan); Skor 2 = suara terdengar tapi kurang jelas; Skor 3 = cukup jelas dengan sedikit gangguan; Skor 4 = jernih dan jelas sepenuhnya."],
    ["Identitas peserta/lokasi/lembaga", "Skor 1 = tidak ada identitas yang terlihat sama sekali; Skor 2 = ada identitas tapi samar/tidak jelas; Skor 3 = identitas terlihat pada sebagian konten; Skor 4 = identitas peserta, lokasi, dan lembaga terlihat jelas (mis. plang nama LKP, seragam program)."],
    ["Kelengkapan konteks", "Skor 1 = hanya close-up tanpa konteks sama sekali; Skor 2 = konteks minim, sebagian besar close-up; Skor 3 = konteks cukup, ada gambaran situasi/tempat; Skor 4 = konteks lengkap, jelas menunjukkan situasi dan tempat."],
    ["Kesiapan tayang", "Skor 1 = resolusi pecah/buram, tidak layak tayang; Skor 2 = kualitas kurang, perlu banyak edit ulang; Skor 3 = kualitas cukup, perlu sedikit edit; Skor 4 = siap tayang langsung tanpa edit ulang."],
  ];

  lines.push(`-- Indicators`);
  const insIndicator = (category: string, scope: string | null, label: string, respType: string, urutan: number, deskripsi: string | null = null) =>
    lines.push(
      `INSERT INTO indicators (category, program_scope, label, deskripsi, response_type, urutan) VALUES ('${category}', ${scope ? `'${scope}'` : "NULL"}, ${esc(label)}, ${esc(deskripsi)}, '${respType}', ${urutan});`
    );
  keterpenuhanPKK.forEach(([l, d], i) => insIndicator("KETERPENUHAN", "PKK", l, "BOOLEAN", i + 1, d));
  keterpenuhanPKW.forEach(([l, d], i) => insIndicator("KETERPENUHAN", "PKW", l, "BOOLEAN", i + 1, d));
  kepatuhan.forEach(([l, d], i) => insIndicator("KEPATUHAN", null, l, "BOOLEAN", i + 1, d));
  kinerja.forEach(([l, d], i) => insIndicator("KINERJA", null, l, "SCALE_1_4", i + 1, d));
  narasi.forEach(([l, d], i) => insIndicator("NARASI", null, l, "SCALE_1_4", i + 1, d));
  visual.forEach(([l, d], i) => insIndicator("VISUAL", null, l, "SCALE_1_4", i + 1, d));
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
  const evidencePKK = ["Foto/video pembelajaran & praktik", "Video landscape 3–5 menit (YouTube)", "Bukti peningkatan kompetensi/kesiapan kerja", "Bukti kemitraan industri", "Bukti magang industri", "Testimoni peserta/lulusan", "Uji kompetensi/sertifikasi", "Penempatan kerja", "Testimoni mitra/HR/pembimbing", "Artikel/siaran pers"];
  const evidencePKW = ["Foto/video pembelajaran & produksi", "Video landscape 3–5 menit (YouTube)", "Bukti pendampingan usaha", "Bukti rintisan usaha", "Testimoni peserta", "Testimoni mitra usaha", "Aktivitas bisnis/usaha lulusan", "Bukti penjualan/katalog/marketplace", "Artikel/siaran pers"];
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
  lines.push("-- SELESAI. Login: superadmin/Admin2026! | viewer/Viewer2026! | PETUGAS hanya lewat akun per lokasi (lkp-xxx), lihat locationAccountList");

  writeFileSync("/mnt/user-data/outputs/seed_data.sql", lines.join("\n"));
  console.log("Generated /mnt/user-data/outputs/seed_data.sql with", lines.length, "lines");
}

main();
