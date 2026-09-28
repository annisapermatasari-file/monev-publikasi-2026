-- ============================================================
-- MONEV PUBLIKASI 2026 - Update data sesuai Surat Tugas/Nota Dinas
-- Nomor 2009/D3/DV.02.00/2026 tanggal 28 September 2026
--
-- Perubahan dari data sebelumnya:
--   1. LKP KOBER INDONESIA (Kab. Jember) diganti LKP BUTIRAN ILMU
--      (Kota Kediri, skill baru "Administrasi Perkantoran/Sekretaris")
--   2. Petugas LKP ASTI: "Eddi Saputro" -> "Sasmita W."
--   3. Petugas LKP BINA ESSA: "Iwan Aries S." dihapus dari penugasan ini
--   4. Petugas LKP MEDIA KOMPUTER: "Darmono" -> "Badrutaman"
--   5. Petugas LKP SKI COMPUTER: "BKHM" -> "Iwan Aries S."
--   6. Petugas LKP FLORENZA: "Badrutaman" -> "Darmono"
--
-- Idempoten: aman dijalankan berkali-kali (pakai IF NOT EXISTS /
-- WHERE NOT EXISTS / ON CONFLICT DO NOTHING).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Skill baru
-- ------------------------------------------------------------
INSERT INTO skills (id, name)
SELECT gen_random_uuid(), 'Administrasi Perkantoran/Sekretaris'
WHERE NOT EXISTS (
  SELECT 1 FROM skills WHERE name = 'Administrasi Perkantoran/Sekretaris'
);

-- ------------------------------------------------------------
-- 2. Nonaktifkan LKP KOBER INDONESIA (bukan hapus, biar histori Monev
--    yang mungkin sudah dibuat tidak hilang), lalu upsert LKP BUTIRAN ILMU
--    (INSERT kalau belum ada sama sekali, UPDATE kalau sudah pernah
--    dibuat oleh migrasi sebelumnya - aman dijalankan berapa kali pun,
--    apapun urutan run terhadap migrasi lokasi lain).
-- ------------------------------------------------------------
UPDATE locations
SET is_active = false
WHERE nama_lembaga = 'LKP KOBER INDONESIA';

INSERT INTO locations (
  id, provinsi, kab_kota, nama_lembaga, skill_id, program_id,
  penanggung_jawab, no_telp, alamat,
  tanggal_monev_mulai, tanggal_monev_selesai, is_active
)
SELECT
  gen_random_uuid(),
  'Jawa Timur',
  'Kota Kediri',
  'LKP BUTIRAN ILMU',
  (SELECT id FROM skills WHERE name = 'Administrasi Perkantoran/Sekretaris'),
  (SELECT id FROM programs WHERE code = 'PKK'),
  NULL,
  '081231842118',
  'Jl. Agus Salim No. 94, Bandarkidul, Mojoroto, Kota Kediri',
  '2026-10-01',
  '2026-10-06',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM locations WHERE nama_lembaga = 'LKP BUTIRAN ILMU'
);

UPDATE locations SET
  provinsi = 'Jawa Timur',
  kab_kota = 'Kota Kediri',
  skill_id = (SELECT id FROM skills WHERE name = 'Administrasi Perkantoran/Sekretaris'),
  program_id = (SELECT id FROM programs WHERE code = 'PKK'),
  no_telp = '081231842118',
  alamat = 'Jl. Agus Salim No. 94, Bandarkidul, Mojoroto, Kota Kediri',
  tanggal_monev_mulai = '2026-10-01',
  tanggal_monev_selesai = '2026-10-06',
  is_active = true
WHERE nama_lembaga = 'LKP BUTIRAN ILMU';

-- ------------------------------------------------------------
-- 3. Petugas baru: Sasmita W.
-- ------------------------------------------------------------
INSERT INTO users (id, name, username, password_hash, role, is_unit_account, is_active)
SELECT
  gen_random_uuid(),
  'Sasmita W.',
  'sasmita.w',
  (SELECT password_hash FROM users WHERE role = 'PETUGAS' AND is_unit_account = false ORDER BY created_at LIMIT 1), -- password default sama seperti petugas lain (Monev2026!)
  'PETUGAS',
  false,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'sasmita.w'
);

-- ------------------------------------------------------------
-- 4. Reconcile assignment: LKP ASTI (Eddi Saputro -> Sasmita W.)
-- ------------------------------------------------------------
DELETE FROM assignments
WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP ASTI')
  AND user_id = (SELECT id FROM users WHERE username = 'eddi.saputro');

INSERT INTO assignments (id, user_id, location_id, periode)
SELECT gen_random_uuid(),
       (SELECT id FROM users WHERE username = 'sasmita.w'),
       (SELECT id FROM locations WHERE nama_lembaga = 'LKP ASTI'),
       '2026'
WHERE NOT EXISTS (
  SELECT 1 FROM assignments
  WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP ASTI')
    AND user_id = (SELECT id FROM users WHERE username = 'sasmita.w')
);

-- ------------------------------------------------------------
-- 5. Reconcile assignment: LKP BINA ESSA (hapus Iwan Aries S.)
-- ------------------------------------------------------------
DELETE FROM assignments
WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP BINA ESSA')
  AND user_id = (SELECT id FROM users WHERE username = 'iwan.aries');

-- ------------------------------------------------------------
-- 6. Reconcile assignment: LKP MEDIA KOMPUTER (Darmono -> Badrutaman)
-- ------------------------------------------------------------
DELETE FROM assignments
WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP MEDIA KOMPUTER')
  AND user_id = (SELECT id FROM users WHERE username = 'darmono');

INSERT INTO assignments (id, user_id, location_id, periode)
SELECT gen_random_uuid(),
       (SELECT id FROM users WHERE username = 'badrutaman'),
       (SELECT id FROM locations WHERE nama_lembaga = 'LKP MEDIA KOMPUTER'),
       '2026'
WHERE NOT EXISTS (
  SELECT 1 FROM assignments
  WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP MEDIA KOMPUTER')
    AND user_id = (SELECT id FROM users WHERE username = 'badrutaman')
);

-- ------------------------------------------------------------
-- 7. Assignment untuk LKP BUTIRAN ILMU (pengganti LKP KOBER INDONESIA):
--    BKHM + Ferdi (assignment lama di KOBER INDONESIA dibiarkan sebagai
--    histori, tidak dihapus - lokasinya sudah dinonaktifkan di langkah 2)
-- ------------------------------------------------------------
INSERT INTO assignments (id, user_id, location_id, periode)
SELECT gen_random_uuid(), u.id,
       (SELECT id FROM locations WHERE nama_lembaga = 'LKP BUTIRAN ILMU'),
       '2026'
FROM users u
WHERE u.username IN ('bkhm', 'ferdi')
  AND NOT EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP BUTIRAN ILMU')
      AND a.user_id = u.id
  );

-- ------------------------------------------------------------
-- 8. Reconcile assignment: LKP SKI COMPUTER (BKHM -> Iwan Aries S.)
-- ------------------------------------------------------------
DELETE FROM assignments
WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP SKI COMPUTER')
  AND user_id = (SELECT id FROM users WHERE username = 'bkhm');

INSERT INTO assignments (id, user_id, location_id, periode)
SELECT gen_random_uuid(),
       (SELECT id FROM users WHERE username = 'iwan.aries'),
       (SELECT id FROM locations WHERE nama_lembaga = 'LKP SKI COMPUTER'),
       '2026'
WHERE NOT EXISTS (
  SELECT 1 FROM assignments
  WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP SKI COMPUTER')
    AND user_id = (SELECT id FROM users WHERE username = 'iwan.aries')
);

-- ------------------------------------------------------------
-- 9. Reconcile assignment: LKP FLORENZA (Badrutaman -> Darmono)
-- ------------------------------------------------------------
DELETE FROM assignments
WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP FLORENZA')
  AND user_id = (SELECT id FROM users WHERE username = 'badrutaman');

INSERT INTO assignments (id, user_id, location_id, periode)
SELECT gen_random_uuid(),
       (SELECT id FROM users WHERE username = 'darmono'),
       (SELECT id FROM locations WHERE nama_lembaga = 'LKP FLORENZA'),
       '2026'
WHERE NOT EXISTS (
  SELECT 1 FROM assignments
  WHERE location_id = (SELECT id FROM locations WHERE nama_lembaga = 'LKP FLORENZA')
    AND user_id = (SELECT id FROM users WHERE username = 'darmono')
);

COMMIT;
