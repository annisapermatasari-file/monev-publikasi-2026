-- ============================================================
-- MONEV PUBLIKASI 2026 - Perbaikan 2 hal:
--
-- 1. Label "Video landscape 3–5 menit" diperjelas jadi "Video landscape
--    3–5 menit (YouTube)" (PKK & PKW) supaya operator tahu video ini
--    diunggah/dijadikan konten di kanal YouTube.
--
-- 2. Tambah kolom "deskripsi" di tabel indicators sebagai bantuan/kejelasan
--    untuk operator saat menilai indikator Kinerja, Narasi, dan Visual
--    (penilaian konten & media sosial) supaya penilaian antar petugas
--    lebih konsisten.
--
-- Idempoten: aman dijalankan berkali-kali.
-- ============================================================

BEGIN;

-- 1. Label video
UPDATE evidence_types
SET label = 'Video landscape 3–5 menit (YouTube)'
WHERE label = 'Video landscape 3–5 menit';

-- 2. Kolom deskripsi + isi bantuan penilaian
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS deskripsi text;

-- KINERJA
UPDATE indicators SET deskripsi = 'Total unggahan terkait program selama periode Monev. Skor tinggi = banyak unggahan; skor rendah = hanya 1-2 unggahan.' WHERE category = 'KINERJA' AND label = 'Jumlah konten';
UPDATE indicators SET deskripsi = 'Variasi format konten: foto, video, reels/story, artikel. Skor tinggi = pakai lebih dari 2 format berbeda; skor rendah = hanya 1 format saja.' WHERE category = 'KINERJA' AND label = 'Ragam format';
UPDATE indicators SET deskripsi = 'Keteraturan jadwal unggah selama periode kegiatan. Skor tinggi = ada unggahan hampir tiap hari kegiatan; skor rendah = menumpuk di 1 hari atau baru diunggah lama setelah kegiatan selesai.' WHERE category = 'KINERJA' AND label = 'Konsistensi unggahan';
UPDATE indicators SET deskripsi = 'Apakah konten visual (foto/video) diimbangi tulisan (caption panjang, artikel, siaran pers), bukan cuma visual tanpa konteks tertulis.' WHERE category = 'KINERJA' AND label = 'Keseimbangan visual dengan artikel/rilis';
UPDATE indicators SET deskripsi = 'Apakah publikasi juga menjangkau media di luar akun resmi lembaga (media massa, akun komunitas/influencer, dll), bukan hanya di akun sendiri.' WHERE category = 'KINERJA' AND label = 'Pemanfaatan media eksternal';
UPDATE indicators SET deskripsi = 'Apakah konten yang sama disebarkan ke beberapa kanal media sosial (Instagram, Facebook, TikTok, YouTube, dst), bukan hanya satu platform.' WHERE category = 'KINERJA' AND label = 'Distribusi lintas kanal';

-- NARASI
UPDATE indicators SET deskripsi = 'Pembaca/penonton bisa memahami dengan jelas apa yang dikerjakan peserta dan apa hasilnya, tanpa perlu penjelasan tambahan.' WHERE category = 'NARASI' AND label = 'Kejelasan proses dan hasil';
UPDATE indicators SET deskripsi = 'Narasi langsung ke inti cerita, tidak bertele-tele atau melebar ke hal yang tidak relevan.' WHERE category = 'NARASI' AND label = 'Ringkas dan fokus';
UPDATE indicators SET deskripsi = 'Cerita mengalir logis: kondisi awal → proses → hasil, bukan meloncat-loncat.' WHERE category = 'NARASI' AND label = 'Alur cerita runtut';
UPDATE indicators SET deskripsi = 'Ada angka/data konkret yang mendukung klaim (jumlah peserta lulus, nilai penjualan, dst), bukan hanya klaim tanpa bukti.' WHERE category = 'NARASI' AND label = 'Data capaian mendukung';
UPDATE indicators SET deskripsi = 'Ada kutipan langsung dari peserta atau mitra, bukan hanya narasi dari sudut pandang lembaga.' WHERE category = 'NARASI' AND label = 'Kutipan peserta/mitra';
UPDATE indicators SET deskripsi = 'Cerita menonjolkan dampak bagi peserta (perubahan hidup, pekerjaan, usaha), bukan sekadar dokumentasi kegiatan berlangsung.' WHERE category = 'NARASI' AND label = 'Orientasi dampak';
UPDATE indicators SET deskripsi = 'Ada elemen personal/emosional yang membuat cerita relate-able, bukan sekadar laporan formal.' WHERE category = 'NARASI' AND label = 'Human story';
UPDATE indicators SET deskripsi = 'Cerita menunjukkan kesulitan/tantangan yang dihadapi sebelum berhasil, bukan hanya menampilkan hasil akhir yang mulus.' WHERE category = 'NARASI' AND label = 'Tantangan menuju keberhasilan';
UPDATE indicators SET deskripsi = 'Cerita menunjukkan keterlibatan berbagai pihak (mitra, instruktur, pemda, dst), bukan hanya LKP sendirian.' WHERE category = 'NARASI' AND label = 'Kolaborasi/partisipasi';
UPDATE indicators SET deskripsi = 'Cerita menghubungkan keterampilan yang dipelajari dengan pemberdayaan nyata (kerja/usaha), bukan sekadar pelatihan tanpa tindak lanjut.' WHERE category = 'NARASI' AND label = 'Kompetensi relevan dan pemberdayaan';

-- VISUAL
UPDATE indicators SET deskripsi = 'Gambar/video cukup terang dan tidak backlit (subjek tidak gelap karena cahaya dari belakang).' WHERE category = 'VISUAL' AND label = 'Pencahayaan';
UPDATE indicators SET deskripsi = 'Tata letak visual: subjek jadi fokus, tidak terpotong aneh, tidak terlalu ramai/berantakan.' WHERE category = 'VISUAL' AND label = 'Komposisi';
UPDATE indicators SET deskripsi = 'Video tidak goyang/blur berlebihan saat direkam.' WHERE category = 'VISUAL' AND label = 'Stabilitas gambar/video';
UPDATE indicators SET deskripsi = 'Visual yang dipakai benar-benar menggambarkan kegiatan/topik yang diceritakan, bukan visual generik yang tidak nyambung.' WHERE category = 'VISUAL' AND label = 'Relevansi visual';
UPDATE indicators SET deskripsi = 'Kejernihan suara saat wawancara/testimoni — tidak berisik, terdengar jelas.' WHERE category = 'VISUAL' AND label = 'Kualitas audio/testimoni';
UPDATE indicators SET deskripsi = 'Dari visual bisa dikenali siapa pesertanya, di LKP mana, dan lembaga apa (misal ada plang nama, seragam, dsb).' WHERE category = 'VISUAL' AND label = 'Identitas peserta/lokasi/lembaga';
UPDATE indicators SET deskripsi = 'Visual memberi konteks yang cukup (bukan cuma close-up tanpa keterangan situasi/tempat).' WHERE category = 'VISUAL' AND label = 'Kelengkapan konteks';
UPDATE indicators SET deskripsi = 'Materi visual sudah siap dipakai langsung untuk publikasi (resolusi cukup, tidak buram, tidak perlu banyak edit ulang).' WHERE category = 'VISUAL' AND label = 'Kesiapan tayang';

COMMIT;
