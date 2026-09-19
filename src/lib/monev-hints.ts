export const STEP_INTRO: Record<number, string> = {
  1: "Konfirmasi data lokasi dan program sebelum mulai. Pastikan sesuai kondisi LKP saat kunjungan — kalau ada yang berubah (PJ, no. telp), hubungi admin untuk update di menu Lokasi.",
  2: 'Centang "Ya" kalau tahapan ini SUDAH DIPUBLIKASIKAN (ada unggahan/bukti), "Tidak" kalau belum ada publikasinya sama sekali. Ini menilai publikasinya, bukan menilai apakah kegiatannya sudah terjadi.',
  3: "Centang kanal yang benar-benar dipakai LKP untuk mempublikasikan program ini. Isi jumlah konten dan satu contoh link supaya mudah diverifikasi nanti.",
  4: "Centang jenis bukti yang tersedia, lalu tempel link ke tempat bukti itu disimpan (folder Google Drive, link YouTube, dst). Kalau ada data capaian (jumlah peserta, nilai penjualan, dst) atau kutipan testimoni, catat juga — ini bahan penting untuk laporan.",
  5: "Ini soal ATURAN publikasi, bukan soal bagus-tidaknya konten: apakah tagging akun resmi, identitas program, dan lokasi sudah dicantumkan sesuai ketentuan.",
  6: "Nilai performa publikasi secara keseluruhan — seberapa rutin, beragam, dan konsisten kontennya diunggah selama periode Monev.",
  7: "Nilai kualitas CERITA-nya: apakah publikasi menunjukkan proses, hasil, dan dampak nyata bagi peserta (human story) — bukan sekadar dokumentasi kegiatan berlangsung.",
  8: "Nilai kualitas TEKNIS visual dan audionya — pencahayaan, kestabilan gambar, kejelasan suara saat wawancara/testimoni, dst.",
  9: "Susun kerangka cerita liputan mengikuti alur: kondisi awal → tantangan → proses → hasil → dampak. Ini jadi acuan tim liputan menyusun konten publikasi berikutnya, jadi isi sedetail yang Anda temukan di lapangan.",
  10: "Wawancarai minimal satu peserta/alumni untuk mendapat human story, dan mitra industri/usaha kalau ada. Pilih peran narasumber dulu — daftar pertanyaan akan muncul otomatis sesuai perannya, dan boleh Anda edit sesuai jawaban aslinya.",
  11: "Kumpulkan link foto/video per kategori (proses belajar, hasil kerja, testimoni, dst). Cukup tempel link ke tempat filenya disimpan (Drive/YouTube) — tidak perlu upload dari sini.",
  12: "Ringkasan otomatis dari semua yang sudah Anda isi di step sebelumnya. Rekomendasi di bawah muncul sendiri kalau sistem mendeteksi ada bagian yang perlu diperkuat — bukan penilaian pribadi Anda.",
  13: "Submit akan mengirim seluruh data ini ke Direktorat untuk direview. Pastikan semua bagian sudah lengkap dulu — kalau nanti ditolak reviewer, Anda masih bisa perbaiki dan submit ulang.",
};

export const SCALE_LEGEND = [
  { v: 1, label: "Sangat Tidak Baik" },
  { v: 2, label: "Tidak Baik" },
  { v: 3, label: "Baik" },
  { v: 4, label: "Sangat Baik" },
];

export const BOOLEAN_CATEGORY_HINT: Record<"KETERPENUHAN" | "KEPATUHAN", string> = {
  KETERPENUHAN:
    '"Ya" = tahapan ini sudah punya bukti publikasi (foto/video/tautan). "Tidak" = belum dipublikasikan sama sekali, meski kegiatannya sudah berjalan.',
  KEPATUHAN:
    '"Ya" = ketentuan ini sudah dipenuhi di publikasi yang ada. Kalau publikasinya sendiri belum ada, jawab "Tidak" — tidak bisa dinilai patuh kalau belum dipublikasikan.',
};
