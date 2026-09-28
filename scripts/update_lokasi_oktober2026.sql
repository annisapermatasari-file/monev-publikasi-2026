-- ============================================================
-- MONEV PUBLIKASI 2026 - Update data lokasi & petugas
-- Sumber: Nota Dinas Nomor 2009/D3/DV.02.00/2026, 28 September 2026
-- Jadwal Monev berubah: 24-26 September 2026 -> 1-6 Oktober 2026
-- Aman dijalankan berulang kali (idempotent). Tidak menghapus data,
-- tidak menyentuh akun riri/superadmin/viewer.
-- ============================================================

BEGIN;

-- 1. Tambah kolom program_id ke locations (kalau belum ada)
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "program_id" varchar(36);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'locations_program_id_programs_id_fk'
  ) THEN
    ALTER TABLE "locations"
      ADD CONSTRAINT "locations_program_id_programs_id_fk"
      FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id");
  END IF;
END $$;

-- 2. Skill baru yang dipakai lokasi baru
INSERT INTO "skills" (name) VALUES
  ('Tata Operasi Darat /Ground Handling Bandara'),
  ('Tata Busana'),
  ('Otomotif Teknik Sepeda Motor'),
  ('Desain Grafis'),
  ('Administrasi Perkantoran/Sekretaris')
ON CONFLICT (name) DO NOTHING;

-- 3. Nonaktifkan lokasi lama yang sudah diganti (tetap tersimpan sebagai riwayat)
UPDATE "locations" SET is_active = false, updated_at = now()
WHERE nama_lembaga IN ('LKP "AFTA VISION"', 'LKP Firmansyah', 'LKP RAMONA', 'LKP BINA BANGSA BERSAMA', 'LKP BERDIKARI')
  AND is_active = true;

-- 4. Insert 5 lokasi baru (yang menggantikan slot di atas + 2 lokasi baru murni)
INSERT INTO "locations" (provinsi, kab_kota, nama_lembaga, skill_id, program_id, penanggung_jawab, no_telp, alamat, tanggal_monev_mulai, tanggal_monev_selesai)
SELECT 'D.I. Yogyakarta', 'Kab. Sleman', 'LKP Total Outsource Development (TOD)',
       (SELECT id FROM skills WHERE name = 'Tata Operasi Darat /Ground Handling Bandara'),
       (SELECT id FROM programs WHERE code = 'PKK'),
       'ANNA HANDAYANI, S.E.', '082136297499',
       'Jl. Solo Km. 10,5 No. 36 Sorogenen Rt 03 Rw 01 Kalasan, Sleman, DI Yogyakarta',
       '2026-10-01', '2026-10-06'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE nama_lembaga = 'LKP Total Outsource Development (TOD)');

INSERT INTO "locations" (provinsi, kab_kota, nama_lembaga, skill_id, program_id, penanggung_jawab, no_telp, alamat, tanggal_monev_mulai, tanggal_monev_selesai)
SELECT 'Jawa Barat', 'Kab. Bandung', 'LKP BINA ESSA',
       (SELECT id FROM skills WHERE name = 'Tata Busana'),
       (SELECT id FROM programs WHERE code = 'PKK'),
       'Nana Supriatna', '081220215718',
       'Jl. Raya Laswi Komplek Griya Pesona No. 1C',
       '2026-10-01', '2026-10-06'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE nama_lembaga = 'LKP BINA ESSA');

INSERT INTO "locations" (provinsi, kab_kota, nama_lembaga, skill_id, program_id, penanggung_jawab, no_telp, alamat, tanggal_monev_mulai, tanggal_monev_selesai)
SELECT 'Jawa Barat', 'Kab. Cianjur', 'LKP PRIMA',
       (SELECT id FROM skills WHERE name = 'Otomotif Teknik Sepeda Motor'),
       (SELECT id FROM programs WHERE code = 'PKK'),
       'Cep Yudi Hamdani', '085723048026',
       'Jln.Perintis Kemerdekaan No.07 Pataruman RT.03 RW.11',
       '2026-10-01', '2026-10-06'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE nama_lembaga = 'LKP PRIMA');

INSERT INTO "locations" (provinsi, kab_kota, nama_lembaga, skill_id, program_id, penanggung_jawab, no_telp, alamat, tanggal_monev_mulai, tanggal_monev_selesai)
SELECT 'Jawa Tengah', 'Kab. Cilacap', 'LKP MEDIA KOMPUTER',
       (SELECT id FROM skills WHERE name = 'Desain Grafis'),
       (SELECT id FROM programs WHERE code = 'PKK'),
       'AGUS WIDAYAT', '081225056446',
       'Jl. Kelapa Sawit No. 02, Kec. Sidareja, Kab. Cilacap, Jawa Tengah',
       '2026-10-01', '2026-10-06'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE nama_lembaga = 'LKP MEDIA KOMPUTER');

INSERT INTO "locations" (provinsi, kab_kota, nama_lembaga, skill_id, program_id, penanggung_jawab, no_telp, alamat, tanggal_monev_mulai, tanggal_monev_selesai)
SELECT 'Jawa Timur', 'Kota Kediri', 'LKP BUTIRAN ILMU',
       (SELECT id FROM skills WHERE name = 'Administrasi Perkantoran/Sekretaris'),
       (SELECT id FROM programs WHERE code = 'PKK'),
       NULL, '081231842118',
       'Jl. Agus Salim No. 94, Bandarkidul, Mojoroto, Kota Kediri',
       '2026-10-01', '2026-10-06'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE nama_lembaga = 'LKP BUTIRAN ILMU');

-- Jika script rekap sebelumnya pernah dijalankan, nonaktifkan target yang tidak
-- tercantum pada Nota Dinas dan pertahankan sebagai riwayat.
UPDATE "locations" SET is_active = false, updated_at = now()
WHERE nama_lembaga = 'LKP KOBER INDONESIA' AND is_active = true;

-- 5. Pastikan seluruh data 10 sasaran surat tepat, aktif, dan terjadwal
UPDATE "locations" SET
  provinsi = 'D.I. Yogyakarta', kab_kota = 'Kab. Sleman',
  skill_id = (SELECT id FROM skills WHERE name = 'Tata Operasi Darat /Ground Handling Bandara'),
  program_id = (SELECT id FROM programs WHERE code = 'PKK'),
  penanggung_jawab = 'ANNA HANDAYANI, S.E.', no_telp = '082136297499',
  alamat = 'Jl. Solo Km. 10,5 No. 36 Sorogenen Rt 03 Rw 01 Kalasan, Sleman, DI Yogyakarta',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP Total Outsource Development (TOD)';
UPDATE "locations" SET
  provinsi = 'Jawa Barat', kab_kota = 'Kab. Bandung',
  skill_id = (SELECT id FROM skills WHERE name = 'Tata Busana'),
  program_id = (SELECT id FROM programs WHERE code = 'PKK'),
  penanggung_jawab = 'Nana Supriatna', no_telp = '081220215718',
  alamat = 'Jl. Raya Laswi Komplek Griya Pesona No. 1C',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP BINA ESSA';
UPDATE "locations" SET
  provinsi = 'Jawa Barat', kab_kota = 'Kab. Cianjur',
  skill_id = (SELECT id FROM skills WHERE name = 'Otomotif Teknik Sepeda Motor'),
  program_id = (SELECT id FROM programs WHERE code = 'PKK'),
  penanggung_jawab = 'Cep Yudi Hamdani', no_telp = '085723048026',
  alamat = 'Jln.Perintis Kemerdekaan No.07 Pataruman RT.03 RW.11',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP PRIMA';
UPDATE "locations" SET
  provinsi = 'Jawa Tengah', kab_kota = 'Kab. Cilacap',
  skill_id = (SELECT id FROM skills WHERE name = 'Desain Grafis'),
  program_id = (SELECT id FROM programs WHERE code = 'PKK'),
  penanggung_jawab = 'AGUS WIDAYAT', no_telp = '081225056446',
  alamat = 'Jl. Kelapa Sawit No. 02, Kec. Sidareja, Kab. Cilacap, Jawa Tengah',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP MEDIA KOMPUTER';
UPDATE "locations" SET
  provinsi = 'Jawa Timur', kab_kota = 'Kota Kediri',
  skill_id = (SELECT id FROM skills WHERE name = 'Administrasi Perkantoran/Sekretaris'),
  program_id = (SELECT id FROM programs WHERE code = 'PKK'),
  penanggung_jawab = NULL, no_telp = '081231842118',
  alamat = 'Jl. Agus Salim No. 94, Bandarkidul, Mojoroto, Kota Kediri',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP BUTIRAN ILMU';
UPDATE "locations" SET
  provinsi = 'Jawa Barat', kab_kota = 'Kab. Bogor',
  skill_id = (SELECT id FROM skills WHERE name = 'Tata Boga (Jasa Usaha Makanan)'),
  program_id = (SELECT id FROM programs WHERE code = 'PKW'),
  penanggung_jawab = 'Drs MAMAN MULYATNA', no_telp = '081384744637',
  alamat = 'Jl. Raya Puncak Gadog No.51, RT.04/RW.02, Citeko, Kec. Cisarua, Kabupaten Bogor, Jawa Barat 16750',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP Viderista';
UPDATE "locations" SET
  provinsi = 'Jawa Barat', kab_kota = 'Kota Cimahi',
  skill_id = (SELECT id FROM skills WHERE name = 'Pastry & Bakery'),
  program_id = (SELECT id FROM programs WHERE code = 'PKW'),
  penanggung_jawab = 'ELIDA HAFNI S.E', no_telp = '081395053413',
  alamat = 'Kompleks Taman Bukit Cibogo Blok A9 No 15, Rt.02/Rw.17, Leuwigajah, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40532',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP ELIDAS';
UPDATE "locations" SET
  provinsi = 'Jawa Tengah', kab_kota = 'Kab. Tegal',
  skill_id = (SELECT id FROM skills WHERE name = 'Teknik Komputer'),
  program_id = (SELECT id FROM programs WHERE code = 'PKW'),
  penanggung_jawab = 'RINA RISKIANA', no_telp = '085786666159',
  alamat = 'Jl. Semanggi Raya No 96',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP SKI COMPUTER';
UPDATE "locations" SET
  provinsi = 'Jawa Tengah', kab_kota = 'Kab. Demak',
  skill_id = (SELECT id FROM skills WHERE name = 'Tata Kecantikan Rambut'),
  program_id = (SELECT id FROM programs WHERE code = 'PKW'),
  penanggung_jawab = 'IRYANTI', no_telp = '085727184748',
  alamat = 'Jl. Ki Godek Desa Bulusari Kecamatan Sayung Kabupaten Demak',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP FLORENZA';
UPDATE "locations" SET
  provinsi = 'Jawa Tengah', kab_kota = 'Kab. Karanganyar',
  skill_id = (SELECT id FROM skills WHERE name = 'Las/Pengelasan'),
  program_id = (SELECT id FROM programs WHERE code = 'PKW'),
  penanggung_jawab = 'Lastri, S.Sos.I.MM.', no_telp = '081228206713',
  alamat = 'Jl. Kepuh No 10 Rt 01/03, Kel. Lalung, Kec. Karanganyar, Kab. Karanganyar, Prov. Jawa Tengah',
  is_active = true, tanggal_monev_mulai = '2026-10-01', tanggal_monev_selesai = '2026-10-06', updated_at = now()
WHERE nama_lembaga = 'LKP ASTI';

-- Deactivate anything outside the official ten-location list without deleting history.
UPDATE "locations" SET is_active = false, updated_at = now()
WHERE is_active = true AND nama_lembaga NOT IN (
  'LKP Total Outsource Development (TOD)', 'LKP BINA ESSA', 'LKP PRIMA',
  'LKP MEDIA KOMPUTER', 'LKP BUTIRAN ILMU', 'LKP Viderista', 'LKP ELIDAS',
  'LKP SKI COMPUTER', 'LKP FLORENZA', 'LKP ASTI'
);

-- 6. Petugas baru dari sheet "surtug"
INSERT INTO "users" (name, username, password_hash, role, is_unit_account, is_active)
SELECT 'Iwan Aries S.', 'iwan.aries', (SELECT password_hash FROM users WHERE username = 'setditjen'), 'PETUGAS', false, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'iwan.aries');

INSERT INTO "users" (name, username, password_hash, role, is_unit_account, is_active)
SELECT 'Nurlely', 'nurlely', (SELECT password_hash FROM users WHERE username = 'setditjen'), 'PETUGAS', false, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'nurlely');

-- 7. Reset & tulis ulang assignment untuk 5 lokasi yang tetap ada (nama sama,
--    hanya daftar petugasnya sedikit berubah)
DELETE FROM assignments WHERE location_id IN (
  SELECT id FROM locations WHERE nama_lembaga IN ('LKP ELIDAS', 'LKP SKI COMPUTER')
) AND periode = '2026';

INSERT INTO assignments (user_id, location_id, periode)
SELECT u.id, l.id, '2026'
FROM (VALUES ('atik.riyanti'), ('anisa.permatasari'), ('nurlely')) AS v(username)
JOIN users u ON u.username = v.username
CROSS JOIN (SELECT id FROM locations WHERE nama_lembaga = 'LKP ELIDAS') l
ON CONFLICT DO NOTHING;

INSERT INTO assignments (user_id, location_id, periode)
SELECT u.id, l.id, '2026'
FROM (VALUES ('bkhm'), ('fadly')) AS v(username)
JOIN users u ON u.username = v.username
CROSS JOIN (SELECT id FROM locations WHERE nama_lembaga = 'LKP SKI COMPUTER') l
ON CONFLICT DO NOTHING;

-- 8. Assignment untuk 5 lokasi baru
INSERT INTO assignments (user_id, location_id, periode)
SELECT u.id, l.id, '2026'
FROM (VALUES ('supriono'), ('setditjen')) AS v(username)
JOIN users u ON u.username = v.username
CROSS JOIN (SELECT id FROM locations WHERE nama_lembaga = 'LKP Total Outsource Development (TOD)') l
ON CONFLICT DO NOTHING;

INSERT INTO assignments (user_id, location_id, periode)
SELECT u.id, l.id, '2026'
FROM (VALUES ('setditjen'), ('iwan.aries'), ('dyah')) AS v(username)
JOIN users u ON u.username = v.username
CROSS JOIN (SELECT id FROM locations WHERE nama_lembaga = 'LKP BINA ESSA') l
ON CONFLICT DO NOTHING;

INSERT INTO assignments (user_id, location_id, periode)
SELECT u.id, l.id, '2026'
FROM (VALUES ('soni.ramadhan'), ('bkhm')) AS v(username)
JOIN users u ON u.username = v.username
CROSS JOIN (SELECT id FROM locations WHERE nama_lembaga = 'LKP PRIMA') l
ON CONFLICT DO NOTHING;

INSERT INTO assignments (user_id, location_id, periode)
SELECT u.id, l.id, '2026'
FROM (VALUES ('bkhm'), ('darmono')) AS v(username)
JOIN users u ON u.username = v.username
CROSS JOIN (SELECT id FROM locations WHERE nama_lembaga = 'LKP MEDIA KOMPUTER') l
ON CONFLICT DO NOTHING;

INSERT INTO assignments (user_id, location_id, periode)
SELECT u.id, l.id, '2026'
FROM (VALUES ('bkhm'), ('ferdi')) AS v(username)
JOIN users u ON u.username = v.username
CROSS JOIN (SELECT id FROM locations WHERE nama_lembaga = 'LKP BUTIRAN ILMU') l
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================
-- Verifikasi cepat setelah dijalankan:
-- SELECT provinsi, kab_kota, nama_lembaga, is_active FROM locations ORDER BY is_active DESC, provinsi;
-- ============================================================
