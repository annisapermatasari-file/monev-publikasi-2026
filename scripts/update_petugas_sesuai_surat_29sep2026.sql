-- ============================================================
-- MONEV PUBLIKASI 2026 - Sinkronkan petugas dengan Surat Pemberitahuan
-- Nomor 2007/B/D3/DV.02.00/2026 tanggal 28 September 2026
--
-- 1. Tambah kolom locations.nama_petugas_monev (nama petugas per lokasi
--    persis sesuai surat - bukan akun login).
-- 2. Isi/perbarui nama petugas per lokasi.
-- 3. Hapus semua akun login PETUGAS yang BUKAN akun per-lokasi (lkp-xxx),
--    termasuk akun individu lama (yaya.sutarya, dst) dan akun unit lama
--    (setditjen, bkhm) - login PETUGAS sekarang hanya lewat ID Lokasi
--    Monev (akun lkp-xxx yang sudah ada).
--
-- Idempotent - aman dijalankan berulang kali.
-- ============================================================

BEGIN;

ALTER TABLE locations ADD COLUMN IF NOT EXISTS nama_petugas_monev text;

UPDATE locations SET nama_petugas_monev = 'Supriono, Shaka Guna Pertamana'
  WHERE nama_lembaga = 'LKP Total Outsource Development (TOD)';
UPDATE locations SET nama_petugas_monev = 'Fauziannisa Pradana Putri, Dyah S.S.'
  WHERE nama_lembaga = 'LKP BINA ESSA';
UPDATE locations SET nama_petugas_monev = 'Soni W.R, Lili Dyah Ayu Candra'
  WHERE nama_lembaga = 'LKP PRIMA';
UPDATE locations SET nama_petugas_monev = 'Rany Larasari, Badrutaman'
  WHERE nama_lembaga = 'LKP MEDIA KOMPUTER';
UPDATE locations SET nama_petugas_monev = 'Iwan Aries S., Darmono'
  WHERE nama_lembaga = 'LKP BUTIRAN ILMU';
UPDATE locations SET nama_petugas_monev = 'Chrismi W., Yeni Pratiwi, Nasikin'
  WHERE nama_lembaga = 'LKP Viderista';
UPDATE locations SET nama_petugas_monev = 'Atik Riyanti, Annisa P., Nurlely'
  WHERE nama_lembaga = 'LKP ELIDAS';
UPDATE locations SET nama_petugas_monev = 'Ferdy H., A. Fadly'
  WHERE nama_lembaga = 'LKP SKI COMPUTER';
UPDATE locations SET nama_petugas_monev = 'Agung Sulistomo, Ramdhan Noor Putra Wira'
  WHERE nama_lembaga = 'LKP FLORENZA';
UPDATE locations SET nama_petugas_monev = 'Yaya Sutarya, Faiz Ayatullah, Sasmita W., Lisvi N.'
  WHERE nama_lembaga = 'LKP ASTI';

-- Hapus akun login PETUGAS lama yang bukan akun per-lokasi (assignments
-- ikut terhapus otomatis lewat ON DELETE CASCADE).
DELETE FROM users WHERE role = 'PETUGAS' AND username NOT LIKE 'lkp-%';

COMMIT;
