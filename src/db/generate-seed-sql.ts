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
    ["Jumlah konten", "Total unggahan terkait program selama periode Monev. Skor tinggi = banyak unggahan; skor rendah = hanya 1-2 unggahan. Contoh skor 4: 10+ unggahan selama periode Monev; contoh skor 1: hanya 1 unggahan."],
    ["Ragam format", "Variasi format konten: foto, video, reels/story, artikel. Skor tinggi = pakai lebih dari 2 format berbeda; skor rendah = hanya 1 format saja. Contoh skor 4: ada foto, video, dan reels; contoh skor 1: hanya foto saja."],
    ["Konsistensi unggahan", "Keteraturan jadwal unggah selama periode kegiatan. Skor tinggi = ada unggahan hampir tiap hari kegiatan; skor rendah = menumpuk di 1 hari atau baru diunggah lama setelah kegiatan selesai. Contoh skor 4: unggahan tersebar tiap hari selama 6 hari kegiatan; contoh skor 1: semua diunggah sekaligus di hari terakhir."],
    ["Keseimbangan visual dengan artikel/rilis", "Apakah konten visual (foto/video) diimbangi tulisan (caption panjang, artikel, siaran pers), bukan cuma visual tanpa konteks tertulis. Contoh: foto kegiatan disertai caption panjang atau artikel di website lembaga, bukan hanya foto tanpa keterangan."],
    ["Pemanfaatan media eksternal", "Apakah publikasi juga menjangkau media di luar akun resmi lembaga (media massa, akun komunitas/influencer, dll), bukan hanya di akun sendiri. Contoh: diliput media lokal atau dibagikan ulang oleh akun komunitas/influencer."],
    ["Distribusi lintas kanal", "Apakah konten yang sama disebarkan ke beberapa kanal media sosial (Instagram, Facebook, TikTok, YouTube, dst), bukan hanya satu platform. Contoh: konten yang sama diunggah di Instagram, Facebook, dan TikTok sekaligus."],
  ];
  const narasi: [string, string][] = [
    ["Kejelasan proses dan hasil", "Pembaca/penonton bisa memahami dengan jelas apa yang dikerjakan peserta dan apa hasilnya, tanpa perlu penjelasan tambahan. Contoh: caption menjelaskan \"peserta belajar menjahit selama 2 minggu, kini sudah bisa membuat 3 model baju\" — jelas tanpa perlu tanya lagi."],
    ["Ringkas dan fokus", "Narasi langsung ke inti cerita, tidak bertele-tele atau melebar ke hal yang tidak relevan. Contoh: caption 3-5 kalimat langsung ke inti, bukan 2 paragraf yang melebar ke hal lain."],
    ["Alur cerita runtut", "Cerita mengalir logis: kondisi awal → proses → hasil, bukan meloncat-loncat. Contoh: cerita dimulai dari kondisi peserta sebelum ikut program, proses belajar, lalu hasil akhirnya."],
    ["Data cerita baik mendukung", "Ada angka/data konkret yang mendukung klaim (jumlah peserta lulus, nilai penjualan, dst), bukan hanya klaim tanpa bukti. Contoh: caption menyebut \"lulus 18 dari 20 peserta\" atau \"omzet meningkat 25%\", bukan hanya klaim \"banyak yang berhasil\" tanpa angka."],
    ["Kutipan peserta/mitra", "Ada kutipan langsung dari peserta atau mitra, bukan hanya narasi dari sudut pandang lembaga. Contoh: ada kutipan langsung \"Sekarang saya berani buka usaha sendiri\" dari peserta, bukan hanya narasi dari LKP."],
    ["Orientasi dampak", "Cerita menonjolkan dampak bagi peserta (perubahan hidup, pekerjaan, usaha), bukan sekadar dokumentasi kegiatan berlangsung. Contoh: cerita menonjolkan \"kini penghasilan peserta bertambah Rp1 juta/bulan\", bukan hanya \"kegiatan berjalan lancar\"."],
    ["Human story", "Ada elemen personal/emosional yang membuat cerita relate-able, bukan sekadar laporan formal. Contoh: ada cerita personal seperti latar belakang peserta sebelum ikut program dan perjuangannya, bukan sekadar laporan kegiatan."],
    ["Tantangan menuju keberhasilan", "Cerita menunjukkan kesulitan/tantangan yang dihadapi sebelum berhasil, bukan hanya menampilkan hasil akhir yang mulus. Contoh: cerita menyebut kesulitan awal peserta (modal terbatas, belum percaya diri) sebelum akhirnya berhasil."],
    ["Kolaborasi/partisipasi", "Cerita menunjukkan keterlibatan berbagai pihak (mitra, instruktur, pemda, dst), bukan hanya LKP sendirian. Contoh: cerita menyebut peran instruktur, mitra industri, atau pemerintah daerah, bukan hanya LKP sendiri."],
    ["Kompetensi relevan dan pemberdayaan", "Cerita menghubungkan keterampilan yang dipelajari dengan pemberdayaan nyata (kerja/usaha), bukan sekadar pelatihan tanpa tindak lanjut. Contoh: cerita menghubungkan keterampilan menjahit yang dipelajari dengan usaha konveksi yang dirintis peserta setelahnya."],
  ];
  const visual: [string, string][] = [
    ["Pencahayaan", "Gambar/video cukup terang dan tidak backlit (subjek tidak gelap karena cahaya dari belakang). Contoh skor rendah: video gelap karena direkam membelakangi jendela (backlit)."],
    ["Komposisi", "Tata letak visual: subjek jadi fokus, tidak terpotong aneh, tidak terlalu ramai/berantakan. Contoh: subjek berada di tengah/sepertiga bidang foto, tidak terpotong kepala/tangan."],
    ["Stabilitas gambar/video", "Video tidak goyang/blur berlebihan saat direkam. Contoh skor rendah: video goyang karena direkam sambil jalan tanpa stabilizer."],
    ["Relevansi visual", "Visual yang dipakai benar-benar menggambarkan kegiatan/topik yang diceritakan, bukan visual generik yang tidak nyambung. Contoh skor rendah: memakai foto generik dari internet yang tidak menggambarkan kegiatan sebenarnya."],
    ["Kualitas audio/testimoni", "Kejernihan suara saat wawancara/testimoni — tidak berisik, terdengar jelas. Contoh skor rendah: suara wawancara tertutup suara angin/bising kendaraan."],
    ["Identitas peserta/lokasi/lembaga", "Dari visual bisa dikenali siapa pesertanya, di LKP mana, dan lembaga apa (misal ada plang nama, seragam, dsb). Contoh: terlihat plang nama LKP atau seragam program di video."],
    ["Kelengkapan konteks", "Visual memberi konteks yang cukup (bukan cuma close-up tanpa keterangan situasi/tempat). Contoh skor rendah: hanya close-up wajah tanpa terlihat suasana ruang kelas/lokasi kegiatan."],
    ["Kesiapan tayang", "Materi visual sudah siap dipakai langsung untuk publikasi (resolusi cukup, tidak buram, tidak perlu banyak edit ulang). Contoh skor rendah: video buram/resolusi pecah sehingga perlu direkam ulang sebelum dipakai untuk publikasi."],
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
