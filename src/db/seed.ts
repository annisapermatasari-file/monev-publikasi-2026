import "dotenv/config";
import { db, client } from "./index";
import bcrypt from "bcryptjs";
import {
  users,
  programs,
  skills,
  locations,
  assignments,
  indicators,
  publicationChannels,
  evidenceTypes,
  storyBriefElements,
  interviewQuestionTemplates,
} from "./schema";

async function main() {
  console.log("Seeding MONEV PUBLIKASI 2026...");

  // ------------------------------------------------------------
  // 1. PROGRAMS
  // ------------------------------------------------------------
  const programRows = await db
    .insert(programs)
    .values([
      { code: "PKK", name: "Pendidikan Kecakapan Kerja" },
      { code: "PKW", name: "Pendidikan Kecakapan Wirausaha" },
    ])
    .returning();

  // ------------------------------------------------------------
  // 2. SKILLS (jenis keterampilan, dari KAK Lampiran + Rekap Petugas)
  // ------------------------------------------------------------
  const skillNames = [
    "Tata Operasi Darat /Ground Handling Bandara",
    "Tata Busana",
    "Otomotif Teknik Sepeda Motor",
    "Desain Grafis",
    "Barista",
    "Tata Boga (Jasa Usaha Makanan)",
    "Pastry & Bakery",
    "Teknik Komputer",
    "Tata Kecantikan Rambut",
    "Las/Pengelasan",
    "Administrasi Perkantoran/Sekretaris",
  ];
  const skillRows = await db
    .insert(skills)
    .values(skillNames.map((name) => ({ name })))
    .returning();
  const skillId = (name: string) => skillRows.find((s) => s.name === name)!.id;

  // ------------------------------------------------------------
  // 3. LOCATIONS (10 lokasi, dari Rekap Petugas Monev Publikasi PKK dan PKW
  //    versi terbaru - jadwal Monev 1-6 Oktober 2026)
  // ------------------------------------------------------------
  const tglMulai = new Date("2026-10-01");
  const tglSelesai = new Date("2026-10-06");

  const programRowByCode = (code: "PKK" | "PKW") => programRows.find((p) => p.code === code)!.id;

  // Nama petugas Monev Publikasi persis sesuai Surat Pemberitahuan Nomor
  // 2007/B/D3/DV.02.00/2026 tanggal 28 September 2026 (bukan akun login).
  const locationData = [
    {
      provinsi: "D.I. Yogyakarta",
      kabKota: "Kab. Sleman",
      namaLembaga: "LKP Total Outsource Development (TOD)",
      program: "PKK" as const,
      skill: "Tata Operasi Darat /Ground Handling Bandara",
      penanggungJawab: "ANNA HANDAYANI, S.E.",
      noTelp: "082136297499",
      alamat: "Jl. Solo Km. 10,5 No. 36 Sorogenen Rt 03 Rw 01 Kalasan, Sleman, DI Yogyakarta",
      namaPetugasMonev: "Supriono, Shaka Guna Pertamana",
    },
    {
      provinsi: "Jawa Barat",
      kabKota: "Kab. Bandung",
      namaLembaga: "LKP BINA ESSA",
      program: "PKK" as const,
      skill: "Tata Busana",
      penanggungJawab: "Nana Supriatna",
      noTelp: "081220215718",
      alamat: "Jl. Raya Laswi Komplek Griya Pesona No. 1C",
      namaPetugasMonev: "Fauziannisa Pradana Putri, Dyah S.S.",
    },
    {
      provinsi: "Jawa Barat",
      kabKota: "Kab. Cianjur",
      namaLembaga: "LKP PRIMA",
      program: "PKK" as const,
      skill: "Otomotif Teknik Sepeda Motor",
      penanggungJawab: "Cep Yudi Hamdani",
      noTelp: "085723048026",
      alamat: "Jln.Perintis Kemerdekaan No.07 Pataruman RT.03 RW.11",
      namaPetugasMonev: "Soni W.R, Lili Dyah Ayu Candra",
    },
    {
      provinsi: "Jawa Tengah",
      kabKota: "Kab. Cilacap",
      namaLembaga: "LKP MEDIA KOMPUTER",
      program: "PKK" as const,
      skill: "Desain Grafis",
      penanggungJawab: "AGUS WIDAYAT",
      noTelp: "081225056446",
      alamat: "Jl. Kelapa Sawit No. 02, Kec. Sidareja, Kab. Cilacap, Jawa Tengah",
      namaPetugasMonev: "Rany Larasari, Badrutaman",
    },
    {
      provinsi: "Jawa Timur",
      kabKota: "Kota Kediri",
      namaLembaga: "LKP BUTIRAN ILMU",
      program: "PKK" as const,
      skill: "Administrasi Perkantoran/Sekretaris",
      penanggungJawab: null,
      noTelp: "081231842118",
      alamat: "Jl. Agus Salim No. 94, Bandarkidul, Mojoroto, Kota Kediri",
      namaPetugasMonev: "Iwan Aries S., Darmono",
    },
    {
      provinsi: "Jawa Barat",
      kabKota: "Kab. Bogor",
      namaLembaga: "LKP Viderista",
      program: "PKW" as const,
      skill: "Tata Boga (Jasa Usaha Makanan)",
      penanggungJawab: "Drs MAMAN MULYATNA",
      noTelp: "081384744637",
      alamat: "Jl. Raya Puncak Gadog No.51, RT.04/RW.02, Citeko, Kec. Cisarua, Kabupaten Bogor, Jawa Barat 16750",
      namaPetugasMonev: "Chrismi W., Yeni Pratiwi, Nasikin",
    },
    {
      provinsi: "Jawa Barat",
      kabKota: "Kota Cimahi",
      namaLembaga: "LKP ELIDAS",
      program: "PKW" as const,
      skill: "Pastry & Bakery",
      penanggungJawab: "ELIDA HAFNI S.E",
      noTelp: "081395053413",
      alamat:
        "Kompleks Taman Bukit Cibogo Blok A9 No 15, Rt.02/Rw.17, Leuwigajah, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40532",
      namaPetugasMonev: "Atik Riyanti, Annisa P., Nurlely",
    },
    {
      provinsi: "Jawa Tengah",
      kabKota: "Kab. Tegal",
      namaLembaga: "LKP SKI COMPUTER",
      program: "PKW" as const,
      skill: "Teknik Komputer",
      penanggungJawab: "RINA RISKIANA",
      noTelp: "085786666159",
      alamat: "Jl. Semanggi Raya No 96",
      namaPetugasMonev: "Ferdy H., A. Fadly",
    },
    {
      provinsi: "Jawa Tengah",
      kabKota: "Kab. Demak",
      namaLembaga: "LKP FLORENZA",
      program: "PKW" as const,
      skill: "Tata Kecantikan Rambut",
      penanggungJawab: "IRYANTI",
      noTelp: "085727184748",
      alamat: "Jl. Ki Godek Desa Bulusari Kecamatan Sayung Kabupaten Demak",
      namaPetugasMonev: "Agung Sulistomo, Ramdhan Noor Putra Wira",
    },
    {
      provinsi: "Jawa Tengah",
      kabKota: "Kab. Karanganyar",
      namaLembaga: "LKP ASTI",
      program: "PKW" as const,
      skill: "Las/Pengelasan",
      penanggungJawab: "Lastri, S.Sos.I.MM.",
      noTelp: "081228206713",
      alamat: "Jl. Kepuh No 10 Rt 01/03, Kel. Lalung, Kec. Karanganyar, Kab. Karanganyar, Prov. Jawa Tengah",
      namaPetugasMonev: "Yaya Sutarya, Faiz Ayatullah, Sasmita W., Lisvi N.",
    },
  ];

  const locationRows = await db
    .insert(locations)
    .values(
      locationData.map((l) => ({
        provinsi: l.provinsi,
        kabKota: l.kabKota,
        namaLembaga: l.namaLembaga,
        skillId: skillId(l.skill),
        programId: programRowByCode(l.program),
        penanggungJawab: l.penanggungJawab,
        noTelp: l.noTelp,
        alamat: l.alamat,
        namaPetugasMonev: l.namaPetugasMonev,
        tanggalMonevMulai: tglMulai,
        tanggalMonevSelesai: tglSelesai,
      }))
    )
    .returning();
  const locationIdByLembaga = (nama: string) =>
    locationRows.find((l) => l.namaLembaga === nama)!.id;

  // ------------------------------------------------------------
  // 4. USERS
  //    Login petugas HANYA lewat 1 akun bersama per lokasi (ID Lokasi Monev,
  //    lihat bagian 5) - tidak ada lagi akun login individu per nama petugas.
  //    Nama petugas per lokasi sesuai Surat Pemberitahuan disimpan di
  //    locations.namaPetugasMonev (lihat bagian 3), bukan sebagai akun.
  // ------------------------------------------------------------
  await db
    .insert(users)
    .values({
      name: "Super Admin",
      username: "superadmin",
      email: "superadmin@kemendikdasmen.go.id",
      passwordHash: await bcrypt.hash("Admin2026!", 10),
      role: "SUPER_ADMIN",
      isActive: true,
    })
    .returning();

  await db
    .insert(users)
    .values({
      name: "Pimpinan Direktorat",
      username: "viewer",
      email: "pimpinan@kemendikdasmen.go.id",
      passwordHash: await bcrypt.hash("Viewer2026!", 10),
      role: "VIEWER",
      isActive: true,
    })
    .returning();

  // ------------------------------------------------------------
  // 5. AKUN PER LOKASI (1 login dipakai bersama oleh tim petugas yang
  //     berangkat ke LKP tsb - satu-satunya cara login untuk PETUGAS;
  //     nama masing-masing anggota tim ada di locations.namaPetugasMonev).
  // ------------------------------------------------------------
  type LocationAccountDef = { lembaga: string; username: string; password: string };
  const locationAccountList: LocationAccountDef[] = [
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

  const locationAccountRows = await db
    .insert(users)
    .values(
      await Promise.all(
        locationAccountList.map(async (l) => ({
          name: `Tim Petugas - ${l.lembaga}`,
          username: l.username,
          passwordHash: await bcrypt.hash(l.password, 10),
          role: "PETUGAS" as const,
          isUnitAccount: true, // dipakai bersama oleh beberapa petugas
          isActive: true,
        }))
      )
    )
    .returning();

  await db.insert(assignments).values(
    locationAccountList.map((l, i) => ({
      userId: locationAccountRows[i].id,
      locationId: locationIdByLembaga(l.lembaga),
      periode: "2026",
    }))
  );

  // ------------------------------------------------------------
  // 6. INDICATORS - KETERPENUHAN (beda per program, dari instrumen xlsx)
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // 7. INDICATORS - KEPATUHAN (sama untuk kedua program)
  // ------------------------------------------------------------
  const kepatuhan: [string, string][] = [
    ["Publikasi pada kanal/media sosial lembaga", "Konten diunggah lewat akun resmi lembaga, bukan akun pribadi perorangan. Contoh: diunggah di akun Instagram/Facebook resmi LKP, bukan akun pribadi instruktur."],
    ["Tagging akun resmi Direktorat", "Postingan menandai (tag/mention) akun resmi Direktorat Kursus dan Pelatihan. Contoh: mention @kursuskita di caption atau menandai akun tersebut di foto."],
    ["Tagging akun resmi Ditjen", "Postingan menandai akun resmi Ditjen terkait. Contoh: mention/tag akun Instagram resmi Ditjen terkait di caption."],
    ["Identitas program tercantum", "Nama program (PKK/PKW) disebutkan jelas dalam konten. Contoh: caption menyebut \"Program PKK Barista 2026\" atau ada watermark nama program di visual."],
    ["Lokasi dapat dikenali", "Nama LKP/kota/kabupaten pelaksana disebutkan atau terlihat di konten. Contoh: caption menyebut \"LKP Elidas, Kota Cimahi\" atau plang nama lembaga terlihat di video."],
    ["Tahapan kegiatan dapat dikenali", "Tahapan kegiatan (pembukaan, pelatihan, uji kompetensi, dst) jelas disebutkan/terlihat. Contoh: caption menyebut \"Hari ke-3: Uji Kompetensi\" atau ada judul tahapan di video."],
    ["Media massa nasional/lokal dimanfaatkan bila tersedia", "Ada pemberitaan di media massa, bila memang tersedia peliputan media. Contoh: tautan berita di portal berita lokal atau kliping koran tentang kegiatan program."],
  ];

  // ------------------------------------------------------------
  // 8. INDICATORS - KINERJA (skala 1-4, sama untuk kedua program)
  // ------------------------------------------------------------
  const kinerja: [string, string][] = [
    ["Jumlah konten", "Total unggahan terkait program selama periode Monev. Skor tinggi = banyak unggahan; skor rendah = hanya 1-2 unggahan. Contoh skor 4: 10+ unggahan selama periode Monev; contoh skor 1: hanya 1 unggahan."],
    ["Ragam format", "Variasi format konten: foto, video, reels/story, artikel. Skor tinggi = pakai lebih dari 2 format berbeda; skor rendah = hanya 1 format saja. Contoh skor 4: ada foto, video, dan reels; contoh skor 1: hanya foto saja."],
    ["Konsistensi unggahan", "Keteraturan jadwal unggah selama periode kegiatan. Skor tinggi = ada unggahan hampir tiap hari kegiatan; skor rendah = menumpuk di 1 hari atau baru diunggah lama setelah kegiatan selesai. Contoh skor 4: unggahan tersebar tiap hari selama 6 hari kegiatan; contoh skor 1: semua diunggah sekaligus di hari terakhir."],
    ["Keseimbangan visual dengan artikel/rilis", "Apakah konten visual (foto/video) diimbangi tulisan (caption panjang, artikel, siaran pers), bukan cuma visual tanpa konteks tertulis. Contoh: foto kegiatan disertai caption panjang atau artikel di website lembaga, bukan hanya foto tanpa keterangan."],
    ["Pemanfaatan media eksternal", "Apakah publikasi juga menjangkau media di luar akun resmi lembaga (media massa, akun komunitas/influencer, dll), bukan hanya di akun sendiri. Contoh: diliput media lokal atau dibagikan ulang oleh akun komunitas/influencer."],
    ["Distribusi lintas kanal", "Apakah konten yang sama disebarkan ke beberapa kanal media sosial (Instagram, Facebook, TikTok, YouTube, dst), bukan hanya satu platform. Contoh: konten yang sama diunggah di Instagram, Facebook, dan TikTok sekaligus."],
  ];

  // ------------------------------------------------------------
  // 9. INDICATORS - NARASI (skala 1-4, sama untuk kedua program)
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // 10. INDICATORS - VISUAL (skala 1-4, sama untuk kedua program)
  // ------------------------------------------------------------
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

  const indicatorRows: (typeof indicators.$inferInsert)[] = [
    ...keterpenuhanPKK.map(([label, deskripsi], i) => ({
      category: "KETERPENUHAN" as const,
      programScope: "PKK" as const,
      label,
      deskripsi,
      responseType: "BOOLEAN" as const,
      urutan: i + 1,
    })),
    ...keterpenuhanPKW.map(([label, deskripsi], i) => ({
      category: "KETERPENUHAN" as const,
      programScope: "PKW" as const,
      label,
      deskripsi,
      responseType: "BOOLEAN" as const,
      urutan: i + 1,
    })),
    ...kepatuhan.map(([label, deskripsi], i) => ({
      category: "KEPATUHAN" as const,
      programScope: null,
      label,
      deskripsi,
      responseType: "BOOLEAN" as const,
      urutan: i + 1,
    })),
    ...kinerja.map(([label, deskripsi], i) => ({
      category: "KINERJA" as const,
      programScope: null,
      label,
      deskripsi,
      responseType: "SCALE_1_4" as const,
      urutan: i + 1,
    })),
    ...narasi.map(([label, deskripsi], i) => ({
      category: "NARASI" as const,
      programScope: null,
      label,
      deskripsi,
      responseType: "SCALE_1_4" as const,
      urutan: i + 1,
    })),
    ...visual.map(([label, deskripsi], i) => ({
      category: "VISUAL" as const,
      programScope: null,
      label,
      deskripsi,
      responseType: "SCALE_1_4" as const,
      urutan: i + 1,
    })),
  ];
  await db.insert(indicators).values(indicatorRows);

  // ------------------------------------------------------------
  // 11. PUBLICATION CHANNELS
  // ------------------------------------------------------------
  await db.insert(publicationChannels).values([
    { name: "Instagram", type: "INTERNAL", urutan: 1 },
    { name: "Facebook", type: "INTERNAL", urutan: 2 },
    { name: "YouTube", type: "INTERNAL", urutan: 3 },
    { name: "TikTok", type: "INTERNAL", urutan: 4 },
    { name: "Website/Blog", type: "INTERNAL", urutan: 5 },
    { name: "X/Twitter", type: "INTERNAL", urutan: 6 },
    { name: "WhatsApp/Telegram/Komunitas", type: "INTERNAL", urutan: 7 },
    { name: "Media online/portal berita", type: "EKSTERNAL", urutan: 8 },
    { name: "Media cetak", type: "EKSTERNAL", urutan: 9 },
    { name: "TV/Radio nasional/lokal", type: "EKSTERNAL", urutan: 10 },
  ]);

  // ------------------------------------------------------------
  // 12. EVIDENCE TYPES (beda per program)
  // ------------------------------------------------------------
  const evidencePKK = [
    "Foto/video pembelajaran & praktik",
    "Video landscape 3–5 menit (YouTube)",
    "Bukti peningkatan kompetensi/kesiapan kerja",
    "Bukti kemitraan industri",
    "Bukti magang industri",
    "Testimoni peserta/lulusan",
    "Uji kompetensi/sertifikasi",
    "Penempatan kerja",
    "Testimoni mitra/HR/pembimbing",
    "Artikel/siaran pers",
  ];
  const evidencePKW = [
    "Foto/video pembelajaran & produksi",
    "Video landscape 3–5 menit (YouTube)",
    "Bukti pendampingan usaha",
    "Bukti rintisan usaha",
    "Testimoni peserta",
    "Testimoni mitra usaha",
    "Aktivitas bisnis/usaha lulusan",
    "Bukti penjualan/katalog/marketplace",
    "Artikel/siaran pers",
  ];
  await db.insert(evidenceTypes).values([
    ...evidencePKK.map((label, i) => ({ programScope: "PKK" as const, label, urutan: i + 1 })),
    ...evidencePKW.map((label, i) => ({ programScope: "PKW" as const, label, urutan: i + 1 })),
  ]);

  // ------------------------------------------------------------
  // 13. STORY BRIEF ELEMENTS (10 elemen narasi wawancara, sama untuk kedua program)
  // ------------------------------------------------------------
  const briefElements = [
    { elemen: "Subjek utama", arahan: "Peserta/lulusan, dilengkapi instruktur/pengelola dan mitra" },
    { elemen: "Kondisi awal", arahan: "Bagaimana kondisi sebelum program?" },
    { elemen: "Tantangan", arahan: "Apa tantangan utama?" },
    { elemen: "Proses", arahan: "Apa yang dipelajari/dilakukan dan dukungan yang diterima?" },
    { elemen: "Perubahan", arahan: "Keterampilan/perubahan apa yang paling terasa?" },
    { elemen: "Hasil/dampak", arahan: "Kerja, usaha, produk, penjualan, sertifikasi, dll." },
    { elemen: "Rencana ke depan", arahan: null },
    { elemen: "Mitra", arahan: "Alasan bermitra, kompetensi yang dibutuhkan, kualitas peserta, kelanjutan" },
    {
      elemen: "Data",
      arahan:
        "Peserta, kompetensi/sertifikasi, produk/jasa, penempatan, magang, penjualan/omzet bila relevan dan terverifikasi",
    },
    {
      elemen: "Visual wajib",
      arahan: "Lokasi, proses, close-up keterampilan, interaksi, hasil kerja, mitra, testimoni, aktivitas kerja/usaha",
    },
  ];
  await db
    .insert(storyBriefElements)
    .values(briefElements.map((b, i) => ({ urutan: i + 1, elemen: b.elemen, arahan: b.arahan })));

  // ------------------------------------------------------------
  // 14. INTERVIEW QUESTION TEMPLATES (direkonsiliasi: xlsx + KAK + brief)
  // ------------------------------------------------------------
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

  await db.insert(interviewQuestionTemplates).values([
    ...pertanyaanPeserta.map((p, i) => ({ roleScope: "PESERTA" as const, urutan: i + 1, pertanyaan: p })),
    ...pertanyaanPeserta.map((p, i) => ({ roleScope: "ALUMNI" as const, urutan: i + 1, pertanyaan: p })),
    ...pertanyaanMitra.map((p, i) => ({ roleScope: "MITRA" as const, urutan: i + 1, pertanyaan: p })),
    // fallback generik untuk instruktur/pengelola/lainnya
    ...pertanyaanPeserta.map((p, i) => ({ roleScope: "INSTRUKTUR" as const, urutan: i + 1, pertanyaan: p })),
    ...pertanyaanPeserta.map((p, i) => ({ roleScope: "PENGELOLA" as const, urutan: i + 1, pertanyaan: p })),
    ...pertanyaanPeserta.map((p, i) => ({ roleScope: "LAINNYA" as const, urutan: i + 1, pertanyaan: p })),
  ]);

  console.log("Seed selesai.");
  console.log("=".repeat(50));
  console.log("Login SUPER_ADMIN -> username: superadmin | password: Admin2026!");
  console.log("Login VIEWER      -> username: viewer     | password: Viewer2026!");
  console.log("Login PETUGAS -> hanya lewat akun per lokasi (ID Lokasi Monev), lihat tabel di bawah");
  console.log(
    locationAccountList.map((l) => `${l.lembaga}: ${l.username} / ${l.password}`).join("\n")
  );
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
