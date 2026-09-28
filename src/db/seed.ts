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
    },
    {
      provinsi: "Jawa Timur",
      kabKota: "Kota Kediri",
      namaLembaga: "LKP BUTIRAN ILMU",
      program: "PKK" as const,
      skill: "Administrasi Perkantoran/Sekretaris",
      penanggungJawab: "",
      noTelp: "081231842118",
      alamat: "Jl. Agus Salim No. 94, Bandarkidul, Mojoroto, Kota Kediri",
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
        tanggalMonevMulai: tglMulai,
        tanggalMonevSelesai: tglSelesai,
      }))
    )
    .returning();
  const locationIdByLembaga = (nama: string) =>
    locationRows.find((l) => l.namaLembaga === nama)!.id;

  // ------------------------------------------------------------
  // 4. USERS (dari Rekap Petugas Monev Publikasi.xlsx)
  //    Catatan: "BKHM" dan "Setditjen" adalah akun unit/tim (dipakai
  //    berulang di beberapa lokasi), bukan individu - ditandai isUnitAccount.
  // ------------------------------------------------------------
  const defaultPasswordHash = await bcrypt.hash("Monev2026!", 10);

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

  // daftar petugas unik dari kolom "Petugas Monev Publikasi" (sheet "surtug")
  type OfficerDef = { name: string; username: string; isUnit?: boolean };
  const officerList: OfficerDef[] = [
    { name: "Yaya Sutarya", username: "yaya.sutarya" },
    { name: "Eddi Saputro", username: "eddi.saputro" },
    { name: "Faiz Ayatullah", username: "faiz.ayatullah" },
    { name: "Lisvi", username: "lisvi" },
    { name: "Supriono", username: "supriono" },
    { name: "Setditjen", username: "setditjen", isUnit: true },
    { name: "Iwan Aries S.", username: "iwan.aries" },
    { name: "Dyah", username: "dyah" },
    { name: "Soni Ramadhan", username: "soni.ramadhan" },
    { name: "BKHM", username: "bkhm", isUnit: true },
    { name: "Darmono", username: "darmono" },
    { name: "Ferdi", username: "ferdi" },
    { name: "Chrismi Widjajanti", username: "chrismi.widjajanti" },
    { name: "Yeni Pratiwi", username: "yeni.pratiwi" },
    { name: "Nasikin", username: "nasikin" },
    { name: "Atik Riyanti", username: "atik.riyanti" },
    { name: "Anisa Permatasari", username: "anisa.permatasari" },
    { name: "Nurlely", username: "nurlely" },
    { name: "Fadly", username: "fadly" },
    { name: "Badrutaman", username: "badrutaman" },
  ];

  const officerRows = await db
    .insert(users)
    .values(
      officerList.map((o) => ({
        name: o.name,
        username: o.username,
        passwordHash: defaultPasswordHash,
        role: "PETUGAS" as const,
        isUnitAccount: !!o.isUnit,
        isActive: true,
      }))
    )
    .returning();
  const officerId = (name: string) => officerRows.find((o) => o.name === name)!.id;

  // ------------------------------------------------------------
  // 5. ASSIGNMENTS (petugas -> lokasi, dari Rekap Petugas)
  // ------------------------------------------------------------
  const assignmentMap: { lembaga: string; petugas: string[] }[] = [
    { lembaga: "LKP ASTI", petugas: ["Yaya Sutarya", "Eddi Saputro", "Faiz Ayatullah", "Lisvi"] },
    { lembaga: "LKP Total Outsource Development (TOD)", petugas: ["Supriono", "Setditjen"] },
    { lembaga: "LKP BINA ESSA", petugas: ["Setditjen", "Iwan Aries S.", "Dyah"] },
    { lembaga: "LKP PRIMA", petugas: ["Soni Ramadhan", "BKHM"] },
    { lembaga: "LKP MEDIA KOMPUTER", petugas: ["BKHM", "Darmono"] },
    { lembaga: "LKP BUTIRAN ILMU", petugas: ["BKHM", "Ferdi"] },
    { lembaga: "LKP Viderista", petugas: ["Chrismi Widjajanti", "Yeni Pratiwi", "Nasikin"] },
    { lembaga: "LKP ELIDAS", petugas: ["Atik Riyanti", "Anisa Permatasari", "Nurlely"] },
    { lembaga: "LKP SKI COMPUTER", petugas: ["BKHM", "Fadly"] },
    { lembaga: "LKP FLORENZA", petugas: ["Setditjen", "Badrutaman"] },
  ];

  await db.insert(assignments).values(
    assignmentMap.flatMap((a) =>
      a.petugas.map((p) => ({
        userId: officerId(p),
        locationId: locationIdByLembaga(a.lembaga),
        periode: "2026",
      }))
    )
  );

  // ------------------------------------------------------------
  // 6. INDICATORS - KETERPENUHAN (beda per program, dari instrumen xlsx)
  // ------------------------------------------------------------
  const keterpenuhanPKK = [
    "Pembelajaran dan praktik keterampilan",
    "Peningkatan kompetensi/kesiapan kerja",
    "Kemitraan industri",
    "Magang industri",
    "Uji kompetensi",
    "Penempatan kerja",
  ];
  const keterpenuhanPKW = [
    "Pembelajaran dan proses produksi",
    "Pendampingan usaha",
    "Pembentukan/rintisan usaha",
    "Pemasaran digital",
  ];

  // ------------------------------------------------------------
  // 7. INDICATORS - KEPATUHAN (sama untuk kedua program)
  // ------------------------------------------------------------
  const kepatuhan = [
    "Publikasi pada kanal/media sosial lembaga",
    "Tagging akun resmi Direktorat",
    "Tagging akun resmi Ditjen",
    "Identitas program tercantum",
    "Lokasi dapat dikenali",
    "Tahapan kegiatan dapat dikenali",
    "Media massa nasional/lokal dimanfaatkan bila tersedia",
  ];

  // ------------------------------------------------------------
  // 8. INDICATORS - KINERJA (skala 1-4, sama untuk kedua program)
  // ------------------------------------------------------------
  const kinerja = [
    "Jumlah konten",
    "Ragam format",
    "Konsistensi unggahan",
    "Keseimbangan visual dengan artikel/rilis",
    "Pemanfaatan media eksternal",
    "Distribusi lintas kanal",
  ];

  // ------------------------------------------------------------
  // 9. INDICATORS - NARASI (skala 1-4, sama untuk kedua program)
  // ------------------------------------------------------------
  const narasi = [
    "Kejelasan proses dan hasil",
    "Ringkas dan fokus",
    "Alur cerita runtut",
    "Data capaian mendukung",
    "Kutipan peserta/mitra",
    "Orientasi dampak",
    "Human story",
    "Tantangan menuju keberhasilan",
    "Kolaborasi/partisipasi",
    "Kompetensi relevan dan pemberdayaan",
  ];

  // ------------------------------------------------------------
  // 10. INDICATORS - VISUAL (skala 1-4, sama untuk kedua program)
  // ------------------------------------------------------------
  const visual = [
    "Pencahayaan",
    "Komposisi",
    "Stabilitas gambar/video",
    "Relevansi visual",
    "Kualitas audio/testimoni",
    "Identitas peserta/lokasi/lembaga",
    "Kelengkapan konteks",
    "Kesiapan tayang",
  ];

  const indicatorRows: (typeof indicators.$inferInsert)[] = [
    ...keterpenuhanPKK.map((label, i) => ({
      category: "KETERPENUHAN" as const,
      programScope: "PKK" as const,
      label,
      responseType: "BOOLEAN" as const,
      urutan: i + 1,
    })),
    ...keterpenuhanPKW.map((label, i) => ({
      category: "KETERPENUHAN" as const,
      programScope: "PKW" as const,
      label,
      responseType: "BOOLEAN" as const,
      urutan: i + 1,
    })),
    ...kepatuhan.map((label, i) => ({
      category: "KEPATUHAN" as const,
      programScope: null,
      label,
      responseType: "BOOLEAN" as const,
      urutan: i + 1,
    })),
    ...kinerja.map((label, i) => ({
      category: "KINERJA" as const,
      programScope: null,
      label,
      responseType: "SCALE_1_4" as const,
      urutan: i + 1,
    })),
    ...narasi.map((label, i) => ({
      category: "NARASI" as const,
      programScope: null,
      label,
      responseType: "SCALE_1_4" as const,
      urutan: i + 1,
    })),
    ...visual.map((label, i) => ({
      category: "VISUAL" as const,
      programScope: null,
      label,
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
    "Video YouTube 7–15 menit",
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
    "Video YouTube 7–15 menit",
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
  // 13. STORY BRIEF ELEMENTS (12 elemen, sama untuk kedua program)
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
    {
      elemen: "Output",
      arahan: "Foto pilihan, video vertikal, video 7–15 menit bila ditetapkan, kutipan, caption, bahan rilis",
    },
    {
      elemen: "Etika",
      arahan: "Persetujuan dokumentasi; tidak menampilkan data pribadi sensitif; klaim terverifikasi",
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
  console.log("Login PETUGAS     -> username: <nama.petugas> | password: Monev2026!");
  console.log("Contoh:", officerRows.map((o) => o.username).join(", "));
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
