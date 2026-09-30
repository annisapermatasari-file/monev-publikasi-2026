-- Ganti bantuan pengisian indikator skala 1-4 (Kinerja, Narasi, Visual)
-- agar memberi kriteria/angka untuk SETIAP level (Skor 1, 2, 3, 4), bukan
-- cuma contoh skor tinggi vs rendah. Idempoten - aman dijalankan berulang.
BEGIN;

-- ============================================================
-- KINERJA
-- ============================================================
UPDATE indicators SET deskripsi = 'Total unggahan terkait program selama periode Monev. Skor 1 = hanya 1 unggahan; Skor 2 = 2-3 unggahan; Skor 3 = 4-6 unggahan; Skor 4 = 7 unggahan atau lebih.'
  WHERE category = 'KINERJA' AND label = 'Jumlah konten';
UPDATE indicators SET deskripsi = 'Variasi format konten: foto, video, reels/story, artikel. Skor 1 = hanya 1 format (mis. foto saja); Skor 2 = 2 format (mis. foto & video); Skor 3 = 3 format (foto, video, reels/story); Skor 4 = 4 format atau lebih.'
  WHERE category = 'KINERJA' AND label = 'Ragam format';
UPDATE indicators SET deskripsi = 'Keteraturan jadwal unggah selama periode kegiatan (1-6 Okt). Skor 1 = semua diunggah sekaligus di 1 hari; Skor 2 = diunggah pada 2 hari saja; Skor 3 = diunggah pada 3-4 hari berbeda; Skor 4 = diunggah hampir tiap hari kegiatan (5-6 hari).'
  WHERE category = 'KINERJA' AND label = 'Konsistensi unggahan';
UPDATE indicators SET deskripsi = 'Apakah konten visual diimbangi tulisan. Skor 1 = hanya visual tanpa keterangan tertulis sama sekali; Skor 2 = ada caption pendek 1 kalimat saja; Skor 3 = ada caption panjang menjelaskan kegiatan; Skor 4 = ada caption panjang dan artikel/siaran pers terpisah.'
  WHERE category = 'KINERJA' AND label = 'Keseimbangan visual dengan artikel/rilis';
UPDATE indicators SET deskripsi = 'Apakah publikasi menjangkau media di luar akun resmi lembaga. Skor 1 = tidak ada publikasi di luar akun sendiri; Skor 2 = dibagikan ulang oleh 1 akun komunitas/individu; Skor 3 = diliput oleh 1 media eksternal; Skor 4 = diliput lebih dari 1 media eksternal atau media massa nasional/lokal.'
  WHERE category = 'KINERJA' AND label = 'Pemanfaatan media eksternal';
UPDATE indicators SET deskripsi = 'Apakah konten yang sama disebarkan ke beberapa kanal media sosial. Skor 1 = hanya 1 kanal (mis. Instagram saja); Skor 2 = 2 kanal; Skor 3 = 3 kanal; Skor 4 = 4 kanal atau lebih.'
  WHERE category = 'KINERJA' AND label = 'Distribusi lintas kanal';

-- ============================================================
-- NARASI
-- ============================================================
UPDATE indicators SET deskripsi = 'Skor 1 = pembaca sama sekali tidak paham apa yang dikerjakan/hasilnya; Skor 2 = ada gambaran tapi masih membingungkan; Skor 3 = cukup jelas walau perlu dibaca ulang; Skor 4 = langsung jelas tanpa penjelasan tambahan (mis. "peserta belajar menjahit 2 minggu, kini bisa membuat 3 model baju").'
  WHERE category = 'NARASI' AND label = 'Kejelasan proses dan hasil';
UPDATE indicators SET deskripsi = 'Skor 1 = sangat bertele-tele, melebar jauh dari topik; Skor 2 = panjang dan masih ada bagian tidak relevan; Skor 3 = cukup ringkas, sedikit melebar; Skor 4 = 3-5 kalimat, semua langsung ke inti cerita.'
  WHERE category = 'NARASI' AND label = 'Ringkas dan fokus';
UPDATE indicators SET deskripsi = 'Skor 1 = cerita meloncat-loncat, sulit diikuti; Skor 2 = alur ada tapi urutannya kadang membingungkan; Skor 3 = cukup runtut dengan sedikit bagian tidak berurutan; Skor 4 = mengalir logis: kondisi awal - proses - hasil.'
  WHERE category = 'NARASI' AND label = 'Alur cerita runtut';
UPDATE indicators SET deskripsi = 'Skor 1 = tidak ada angka/data sama sekali; Skor 2 = ada klaim tanpa angka jelas (mis. "banyak yang berhasil"); Skor 3 = ada 1 data konkret (mis. "15 peserta lulus"); Skor 4 = ada beberapa data konkret (mis. "lulus 18 dari 20 peserta, omzet naik 25%").'
  WHERE category = 'NARASI' AND label IN ('Data capaian mendukung', 'Data cerita baik mendukung');
UPDATE indicators SET deskripsi = 'Skor 1 = tidak ada kutipan sama sekali; Skor 2 = ada kutipan tapi hanya parafrase dari LKP; Skor 3 = ada 1 kutipan langsung dari peserta/mitra; Skor 4 = ada lebih dari 1 kutipan langsung, mis. "Sekarang saya berani buka usaha sendiri".'
  WHERE category = 'NARASI' AND label = 'Kutipan peserta/mitra';
UPDATE indicators SET deskripsi = 'Skor 1 = tidak menyebut dampak apa pun bagi peserta; Skor 2 = dampak disebut secara umum tanpa detail; Skor 3 = ada 1 dampak konkret bagi peserta; Skor 4 = dampak konkret dan spesifik, mis. "penghasilan bertambah Rp1 juta/bulan".'
  WHERE category = 'NARASI' AND label = 'Orientasi dampak';
UPDATE indicators SET deskripsi = 'Skor 1 = sepenuhnya laporan formal tanpa elemen personal; Skor 2 = ada sedikit elemen personal tapi masih kaku; Skor 3 = elemen personal cukup terasa; Skor 4 = cerita personal/emosional yang kuat dan relate-able.'
  WHERE category = 'NARASI' AND label = 'Human story';
UPDATE indicators SET deskripsi = 'Skor 1 = tidak ada tantangan disebutkan sama sekali; Skor 2 = tantangan disebut sekilas tanpa detail; Skor 3 = tantangan dijelaskan cukup detail; Skor 4 = tantangan dan proses mengatasinya dijelaskan jelas sebelum hasil akhir.'
  WHERE category = 'NARASI' AND label = 'Tantangan menuju keberhasilan';
UPDATE indicators SET deskripsi = 'Skor 1 = hanya LKP sendiri, tidak ada pihak lain disebut; Skor 2 = ada 1 pihak lain disebut sekilas; Skor 3 = ada 1-2 pihak lain (mitra/instruktur/pemda) dijelaskan perannya; Skor 4 = beberapa pihak dengan peran masing-masing dijelaskan jelas.'
  WHERE category = 'NARASI' AND label = 'Kolaborasi/partisipasi';
UPDATE indicators SET deskripsi = 'Skor 1 = tidak ada hubungan antara keterampilan dan pemberdayaan nyata; Skor 2 = disebut sekilas tanpa contoh nyata; Skor 3 = ada 1 contoh nyata pemberdayaan (kerja/usaha); Skor 4 = hubungan keterampilan-pemberdayaan dijelaskan jelas dengan contoh nyata.'
  WHERE category = 'NARASI' AND label = 'Kompetensi relevan dan pemberdayaan';

-- ============================================================
-- VISUAL
-- ============================================================
UPDATE indicators SET deskripsi = 'Skor 1 = gambar/video gelap total atau backlit parah (subjek gelap karena cahaya dari belakang); Skor 2 = pencahayaan kurang di sebagian besar konten; Skor 3 = cukup terang dengan sedikit bagian kurang; Skor 4 = terang dan merata di seluruh konten.'
  WHERE category = 'VISUAL' AND label = 'Pencahayaan';
UPDATE indicators SET deskripsi = 'Skor 1 = subjek terpotong aneh/tata letak berantakan; Skor 2 = subjek terlihat tapi tata letak kurang rapi; Skor 3 = tata letak cukup rapi dengan sedikit kekurangan; Skor 4 = subjek jadi fokus, tata letak rapi dan seimbang.'
  WHERE category = 'VISUAL' AND label = 'Komposisi';
UPDATE indicators SET deskripsi = 'Skor 1 = goyang/blur berlebihan di sebagian besar video; Skor 2 = goyang di beberapa bagian; Skor 3 = cukup stabil dengan sedikit goyangan; Skor 4 = stabil sepenuhnya, tidak goyang/blur.'
  WHERE category = 'VISUAL' AND label = 'Stabilitas gambar/video';
UPDATE indicators SET deskripsi = 'Skor 1 = visual generik, tidak nyambung dengan cerita (mis. foto stok dari internet); Skor 2 = visual agak nyambung tapi kurang spesifik; Skor 3 = visual cukup menggambarkan kegiatan; Skor 4 = visual benar-benar menggambarkan kegiatan/topik secara spesifik.'
  WHERE category = 'VISUAL' AND label = 'Relevansi visual';
UPDATE indicators SET deskripsi = 'Skor 1 = suara tidak terdengar/tertutup bising (mis. angin, kendaraan); Skor 2 = suara terdengar tapi kurang jelas; Skor 3 = cukup jelas dengan sedikit gangguan; Skor 4 = jernih dan jelas sepenuhnya.'
  WHERE category = 'VISUAL' AND label = 'Kualitas audio/testimoni';
UPDATE indicators SET deskripsi = 'Skor 1 = tidak ada identitas yang terlihat sama sekali; Skor 2 = ada identitas tapi samar/tidak jelas; Skor 3 = identitas terlihat pada sebagian konten; Skor 4 = identitas peserta, lokasi, dan lembaga terlihat jelas (mis. plang nama LKP, seragam program).'
  WHERE category = 'VISUAL' AND label = 'Identitas peserta/lokasi/lembaga';
UPDATE indicators SET deskripsi = 'Skor 1 = hanya close-up tanpa konteks sama sekali; Skor 2 = konteks minim, sebagian besar close-up; Skor 3 = konteks cukup, ada gambaran situasi/tempat; Skor 4 = konteks lengkap, jelas menunjukkan situasi dan tempat.'
  WHERE category = 'VISUAL' AND label = 'Kelengkapan konteks';
UPDATE indicators SET deskripsi = 'Skor 1 = resolusi pecah/buram, tidak layak tayang; Skor 2 = kualitas kurang, perlu banyak edit ulang; Skor 3 = kualitas cukup, perlu sedikit edit; Skor 4 = siap tayang langsung tanpa edit ulang.'
  WHERE category = 'VISUAL' AND label = 'Kesiapan tayang';

COMMIT;
