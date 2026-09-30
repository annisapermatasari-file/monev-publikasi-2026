-- Tambah/perbarui bantuan pengisian (deskripsi) + contoh konkret untuk
-- SETIAP indikator instrumen Monev Publikasi, termasuk Keterpenuhan dan
-- Kepatuhan yang sebelumnya belum punya bantuan sama sekali. Juga
-- menyelaraskan nama indikator NARASI "Data capaian mendukung" menjadi
-- "Data cerita baik mendukung" sesuai istilah baru yang dipakai di
-- langkah Bukti Publikasi. Idempoten - aman dijalankan berulang kali.
BEGIN;

-- ============================================================
-- KETERPENUHAN - PKK
-- ============================================================
UPDATE indicators SET deskripsi = 'Sudah ada unggahan yang menunjukkan proses belajar/praktik keterampilan peserta. Contoh: foto/video peserta praktik menjahit atau video suasana kelas pelatihan diunggah ke Instagram.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKK' AND label = 'Pembelajaran dan praktik keterampilan';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi yang menunjukkan peningkatan kompetensi atau kesiapan kerja peserta. Contoh: postingan testimoni peserta merasa lebih siap kerja, atau sertifikat kompetensi yang diunggah.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKK' AND label = 'Peningkatan kompetensi/kesiapan kerja';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi yang menampilkan kerja sama dengan industri/perusahaan mitra. Contoh: foto kunjungan industri, penandatanganan MoU, atau kegiatan bersama mitra industri.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKK' AND label = 'Kemitraan industri';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi kegiatan magang peserta di industri/perusahaan. Contoh: foto/video peserta magang di lokasi perusahaan atau unggahan aktivitas magang.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKK' AND label = 'Magang industri';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi pelaksanaan uji kompetensi peserta. Contoh: foto peserta mengikuti uji kompetensi atau hasil penilaian asesor yang diunggah.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKK' AND label = 'Uji kompetensi';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi yang menunjukkan peserta yang sudah bekerja/ditempatkan. Contoh: postingan "alumni diterima kerja di ..." atau data jumlah peserta yang terserap kerja.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKK' AND label = 'Penempatan kerja';

-- ============================================================
-- KETERPENUHAN - PKW
-- ============================================================
UPDATE indicators SET deskripsi = 'Sudah ada unggahan proses belajar dan produksi usaha peserta. Contoh: video proses produksi kerajinan/kuliner atau foto peserta praktik produksi.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKW' AND label = 'Pembelajaran dan proses produksi';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi kegiatan pendampingan usaha ke peserta. Contoh: foto sesi mentoring/konsultasi usaha atau video pendampingan langsung ke lokasi usaha peserta.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKW' AND label = 'Pendampingan usaha';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi usaha baru yang dirintis peserta. Contoh: postingan "usaha baru peserta ..." atau logo/brand usaha rintisan yang diunggah.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKW' AND label = 'Pembentukan/rintisan usaha';
UPDATE indicators SET deskripsi = 'Sudah ada publikasi kegiatan pemasaran digital yang dilakukan peserta. Contoh: tangkapan layar toko online peserta atau konten promosi produk di media sosial/marketplace.'
  WHERE category = 'KETERPENUHAN' AND program_scope = 'PKW' AND label = 'Pemasaran digital';

-- ============================================================
-- KEPATUHAN
-- ============================================================
UPDATE indicators SET deskripsi = 'Konten diunggah lewat akun resmi lembaga, bukan akun pribadi perorangan. Contoh: diunggah di akun Instagram/Facebook resmi LKP, bukan akun pribadi instruktur.'
  WHERE category = 'KEPATUHAN' AND label = 'Publikasi pada kanal/media sosial lembaga';
UPDATE indicators SET deskripsi = 'Postingan menandai (tag/mention) akun resmi Direktorat Kursus dan Pelatihan. Contoh: mention @kursuskita di caption atau menandai akun tersebut di foto.'
  WHERE category = 'KEPATUHAN' AND label = 'Tagging akun resmi Direktorat';
UPDATE indicators SET deskripsi = 'Postingan menandai akun resmi Ditjen terkait. Contoh: mention/tag akun Instagram resmi Ditjen terkait di caption.'
  WHERE category = 'KEPATUHAN' AND label = 'Tagging akun resmi Ditjen';
UPDATE indicators SET deskripsi = 'Nama program (PKK/PKW) disebutkan jelas dalam konten. Contoh: caption menyebut "Program PKK Barista 2026" atau ada watermark nama program di visual.'
  WHERE category = 'KEPATUHAN' AND label = 'Identitas program tercantum';
UPDATE indicators SET deskripsi = 'Nama LKP/kota/kabupaten pelaksana disebutkan atau terlihat di konten. Contoh: caption menyebut "LKP Elidas, Kota Cimahi" atau plang nama lembaga terlihat di video.'
  WHERE category = 'KEPATUHAN' AND label = 'Lokasi dapat dikenali';
UPDATE indicators SET deskripsi = 'Tahapan kegiatan (pembukaan, pelatihan, uji kompetensi, dst) jelas disebutkan/terlihat. Contoh: caption menyebut "Hari ke-3: Uji Kompetensi" atau ada judul tahapan di video.'
  WHERE category = 'KEPATUHAN' AND label = 'Tahapan kegiatan dapat dikenali';
UPDATE indicators SET deskripsi = 'Ada pemberitaan di media massa, bila memang tersedia peliputan media. Contoh: tautan berita di portal berita lokal atau kliping koran tentang kegiatan program.'
  WHERE category = 'KEPATUHAN' AND label = 'Media massa nasional/lokal dimanfaatkan bila tersedia';

-- ============================================================
-- KINERJA (skala 1-4)
-- ============================================================
UPDATE indicators SET deskripsi = 'Total unggahan terkait program selama periode Monev. Skor tinggi = banyak unggahan; skor rendah = hanya 1-2 unggahan. Contoh skor 4: 10+ unggahan selama periode Monev; contoh skor 1: hanya 1 unggahan.'
  WHERE category = 'KINERJA' AND label = 'Jumlah konten';
UPDATE indicators SET deskripsi = 'Variasi format konten: foto, video, reels/story, artikel. Skor tinggi = pakai lebih dari 2 format berbeda; skor rendah = hanya 1 format saja. Contoh skor 4: ada foto, video, dan reels; contoh skor 1: hanya foto saja.'
  WHERE category = 'KINERJA' AND label = 'Ragam format';
UPDATE indicators SET deskripsi = 'Keteraturan jadwal unggah selama periode kegiatan. Skor tinggi = ada unggahan hampir tiap hari kegiatan; skor rendah = menumpuk di 1 hari atau baru diunggah lama setelah kegiatan selesai. Contoh skor 4: unggahan tersebar tiap hari selama 6 hari kegiatan; contoh skor 1: semua diunggah sekaligus di hari terakhir.'
  WHERE category = 'KINERJA' AND label = 'Konsistensi unggahan';
UPDATE indicators SET deskripsi = 'Apakah konten visual (foto/video) diimbangi tulisan (caption panjang, artikel, siaran pers), bukan cuma visual tanpa konteks tertulis. Contoh: foto kegiatan disertai caption panjang atau artikel di website lembaga, bukan hanya foto tanpa keterangan.'
  WHERE category = 'KINERJA' AND label = 'Keseimbangan visual dengan artikel/rilis';
UPDATE indicators SET deskripsi = 'Apakah publikasi juga menjangkau media di luar akun resmi lembaga (media massa, akun komunitas/influencer, dll), bukan hanya di akun sendiri. Contoh: diliput media lokal atau dibagikan ulang oleh akun komunitas/influencer.'
  WHERE category = 'KINERJA' AND label = 'Pemanfaatan media eksternal';
UPDATE indicators SET deskripsi = 'Apakah konten yang sama disebarkan ke beberapa kanal media sosial (Instagram, Facebook, TikTok, YouTube, dst), bukan hanya satu platform. Contoh: konten yang sama diunggah di Instagram, Facebook, dan TikTok sekaligus.'
  WHERE category = 'KINERJA' AND label = 'Distribusi lintas kanal';

-- ============================================================
-- NARASI (skala 1-4) - termasuk rename "Data capaian mendukung"
-- ============================================================
UPDATE indicators SET deskripsi = 'Pembaca/penonton bisa memahami dengan jelas apa yang dikerjakan peserta dan apa hasilnya, tanpa perlu penjelasan tambahan. Contoh: caption menjelaskan "peserta belajar menjahit selama 2 minggu, kini sudah bisa membuat 3 model baju" - jelas tanpa perlu tanya lagi.'
  WHERE category = 'NARASI' AND label = 'Kejelasan proses dan hasil';
UPDATE indicators SET deskripsi = 'Narasi langsung ke inti cerita, tidak bertele-tele atau melebar ke hal yang tidak relevan. Contoh: caption 3-5 kalimat langsung ke inti, bukan 2 paragraf yang melebar ke hal lain.'
  WHERE category = 'NARASI' AND label = 'Ringkas dan fokus';
UPDATE indicators SET deskripsi = 'Cerita mengalir logis: kondisi awal -> proses -> hasil, bukan meloncat-loncat. Contoh: cerita dimulai dari kondisi peserta sebelum ikut program, proses belajar, lalu hasil akhirnya.'
  WHERE category = 'NARASI' AND label = 'Alur cerita runtut';
UPDATE indicators SET label = 'Data cerita baik mendukung',
  deskripsi = 'Ada angka/data konkret yang mendukung klaim (jumlah peserta lulus, nilai penjualan, dst), bukan hanya klaim tanpa bukti. Contoh: caption menyebut "lulus 18 dari 20 peserta" atau "omzet meningkat 25%", bukan hanya klaim "banyak yang berhasil" tanpa angka.'
  WHERE category = 'NARASI' AND label IN ('Data capaian mendukung', 'Data cerita baik mendukung');
UPDATE indicators SET deskripsi = 'Ada kutipan langsung dari peserta atau mitra, bukan hanya narasi dari sudut pandang lembaga. Contoh: ada kutipan langsung "Sekarang saya berani buka usaha sendiri" dari peserta, bukan hanya narasi dari LKP.'
  WHERE category = 'NARASI' AND label = 'Kutipan peserta/mitra';
UPDATE indicators SET deskripsi = 'Cerita menonjolkan dampak bagi peserta (perubahan hidup, pekerjaan, usaha), bukan sekadar dokumentasi kegiatan berlangsung. Contoh: cerita menonjolkan "kini penghasilan peserta bertambah Rp1 juta/bulan", bukan hanya "kegiatan berjalan lancar".'
  WHERE category = 'NARASI' AND label = 'Orientasi dampak';
UPDATE indicators SET deskripsi = 'Ada elemen personal/emosional yang membuat cerita relate-able, bukan sekadar laporan formal. Contoh: ada cerita personal seperti latar belakang peserta sebelum ikut program dan perjuangannya, bukan sekadar laporan kegiatan.'
  WHERE category = 'NARASI' AND label = 'Human story';
UPDATE indicators SET deskripsi = 'Cerita menunjukkan kesulitan/tantangan yang dihadapi sebelum berhasil, bukan hanya menampilkan hasil akhir yang mulus. Contoh: cerita menyebut kesulitan awal peserta (modal terbatas, belum percaya diri) sebelum akhirnya berhasil.'
  WHERE category = 'NARASI' AND label = 'Tantangan menuju keberhasilan';
UPDATE indicators SET deskripsi = 'Cerita menunjukkan keterlibatan berbagai pihak (mitra, instruktur, pemda, dst), bukan hanya LKP sendirian. Contoh: cerita menyebut peran instruktur, mitra industri, atau pemerintah daerah, bukan hanya LKP sendiri.'
  WHERE category = 'NARASI' AND label = 'Kolaborasi/partisipasi';
UPDATE indicators SET deskripsi = 'Cerita menghubungkan keterampilan yang dipelajari dengan pemberdayaan nyata (kerja/usaha), bukan sekadar pelatihan tanpa tindak lanjut. Contoh: cerita menghubungkan keterampilan menjahit yang dipelajari dengan usaha konveksi yang dirintis peserta setelahnya.'
  WHERE category = 'NARASI' AND label = 'Kompetensi relevan dan pemberdayaan';

-- ============================================================
-- VISUAL (skala 1-4)
-- ============================================================
UPDATE indicators SET deskripsi = 'Gambar/video cukup terang dan tidak backlit (subjek tidak gelap karena cahaya dari belakang). Contoh skor rendah: video gelap karena direkam membelakangi jendela (backlit).'
  WHERE category = 'VISUAL' AND label = 'Pencahayaan';
UPDATE indicators SET deskripsi = 'Tata letak visual: subjek jadi fokus, tidak terpotong aneh, tidak terlalu ramai/berantakan. Contoh: subjek berada di tengah/sepertiga bidang foto, tidak terpotong kepala/tangan.'
  WHERE category = 'VISUAL' AND label = 'Komposisi';
UPDATE indicators SET deskripsi = 'Video tidak goyang/blur berlebihan saat direkam. Contoh skor rendah: video goyang karena direkam sambil jalan tanpa stabilizer.'
  WHERE category = 'VISUAL' AND label = 'Stabilitas gambar/video';
UPDATE indicators SET deskripsi = 'Visual yang dipakai benar-benar menggambarkan kegiatan/topik yang diceritakan, bukan visual generik yang tidak nyambung. Contoh skor rendah: memakai foto generik dari internet yang tidak menggambarkan kegiatan sebenarnya.'
  WHERE category = 'VISUAL' AND label = 'Relevansi visual';
UPDATE indicators SET deskripsi = 'Kejernihan suara saat wawancara/testimoni - tidak berisik, terdengar jelas. Contoh skor rendah: suara wawancara tertutup suara angin/bising kendaraan.'
  WHERE category = 'VISUAL' AND label = 'Kualitas audio/testimoni';
UPDATE indicators SET deskripsi = 'Dari visual bisa dikenali siapa pesertanya, di LKP mana, dan lembaga apa (misal ada plang nama, seragam, dsb). Contoh: terlihat plang nama LKP atau seragam program di video.'
  WHERE category = 'VISUAL' AND label = 'Identitas peserta/lokasi/lembaga';
UPDATE indicators SET deskripsi = 'Visual memberi konteks yang cukup (bukan cuma close-up tanpa keterangan situasi/tempat). Contoh skor rendah: hanya close-up wajah tanpa terlihat suasana ruang kelas/lokasi kegiatan.'
  WHERE category = 'VISUAL' AND label = 'Kelengkapan konteks';
UPDATE indicators SET deskripsi = 'Materi visual sudah siap dipakai langsung untuk publikasi (resolusi cukup, tidak buram, tidak perlu banyak edit ulang). Contoh skor rendah: video buram/resolusi pecah sehingga perlu direkam ulang sebelum dipakai untuk publikasi.'
  WHERE category = 'VISUAL' AND label = 'Kesiapan tayang';

COMMIT;
