-- Ganti bantuan indikator Kinerja "Jumlah konten" agar pakai rentang unggahan
-- yang lebih realistis (kelipatan 20) alih-alih angka kecil 1-7.
-- Idempoten - aman dijalankan berulang.
BEGIN;

UPDATE indicators SET deskripsi = 'Total unggahan terkait program selama periode Monev. Skor 1 = 1-20 unggahan; Skor 2 = 21-40 unggahan; Skor 3 = 41-60 unggahan; Skor 4 = 61 unggahan atau lebih.'
  WHERE category = 'KINERJA' AND label = 'Jumlah konten';

COMMIT;
