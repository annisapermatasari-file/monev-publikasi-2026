-- ============================================================
-- MONEV PUBLIKASI 2026 - Tambah 1 akun login per lokasi/LKP
--
-- Supaya tim petugas yang berangkat ke satu LKP cukup pakai satu
-- login bersama (tidak perlu tiap orang ingat username masing-masing).
-- Akun ini DITAMBAHKAN di samping akun individu yang sudah ada,
-- bukan menggantikannya.
--
-- PENTING: password di bawah pakai bcrypt hash yang di-generate di luar
-- SQL ini (lihat catatan). Ganti nilai *_HASH sebelum dijalankan kalau
-- generate ulang, atau langsung pakai hash yang sudah disiapkan.
--
-- Idempoten: aman dijalankan berkali-kali.
-- ============================================================

BEGIN;

-- Tabel sementara: username, nama tampilan, nama_lembaga, password_hash
-- (password_hash diisi lewat parameter di bawah - lihat instruksi push)
DO $$
DECLARE
  akun RECORD;
BEGIN
  FOR akun IN
    SELECT * FROM (VALUES
      ('lkp-tod',           'Tim Petugas - LKP Total Outsource Development (TOD)', 'LKP Total Outsource Development (TOD)'),
      ('lkp-binaessa',      'Tim Petugas - LKP BINA ESSA',                          'LKP BINA ESSA'),
      ('lkp-prima',         'Tim Petugas - LKP PRIMA',                              'LKP PRIMA'),
      ('lkp-mediakomputer', 'Tim Petugas - LKP MEDIA KOMPUTER',                     'LKP MEDIA KOMPUTER'),
      ('lkp-butiranilmu',   'Tim Petugas - LKP BUTIRAN ILMU',                       'LKP BUTIRAN ILMU'),
      ('lkp-viderista',     'Tim Petugas - LKP Viderista',                          'LKP Viderista'),
      ('lkp-elidas',        'Tim Petugas - LKP ELIDAS',                             'LKP ELIDAS'),
      ('lkp-skicomputer',   'Tim Petugas - LKP SKI COMPUTER',                       'LKP SKI COMPUTER'),
      ('lkp-florenza',      'Tim Petugas - LKP FLORENZA',                           'LKP FLORENZA'),
      ('lkp-asti',          'Tim Petugas - LKP ASTI',                               'LKP ASTI')
    ) AS t(username, nama, lembaga)
  LOOP
    -- insert user kalau belum ada (password di-set NULL dulu, di-update oleh
    -- pernyataan UPDATE terpisah per akun di bawah karena tiap lokasi
    -- passwordnya beda)
    INSERT INTO users (id, name, username, password_hash, role, is_unit_account, is_active)
    SELECT gen_random_uuid(), akun.nama, akun.username, 'PLACEHOLDER_WILL_BE_SET_BELOW', 'PETUGAS', true, true
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = akun.username);

    -- assignment ke lokasi (kalau belum ada)
    INSERT INTO assignments (id, user_id, location_id, periode)
    SELECT gen_random_uuid(),
           (SELECT id FROM users WHERE username = akun.username),
           (SELECT id FROM locations WHERE nama_lembaga = akun.lembaga),
           '2026'
    WHERE NOT EXISTS (
      SELECT 1 FROM assignments
      WHERE user_id = (SELECT id FROM users WHERE username = akun.username)
        AND location_id = (SELECT id FROM locations WHERE nama_lembaga = akun.lembaga)
    );
  END LOOP;
END $$;

-- Set password masing-masing akun (bcrypt hash, cost 10).
-- Password plaintext (untuk dibagikan ke petugas):
--   lkp-tod           -> TOD2026!
--   lkp-binaessa      -> BinaEssa2026!
--   lkp-prima         -> Prima2026!
--   lkp-mediakomputer -> MediaKomputer2026!
--   lkp-butiranilmu   -> ButiranIlmu2026!
--   lkp-viderista     -> Viderista2026!
--   lkp-elidas        -> Elidas2026!
--   lkp-skicomputer   -> SkiComputer2026!
--   lkp-florenza      -> Florenza2026!
--   lkp-asti          -> Asti2026!
UPDATE users SET password_hash = '$2b$10$jRPLS3fJOM9tv0Gt6p61aeKrknSejtIe45k87UakLAO6qFncWYtEK' WHERE username = 'lkp-tod';
UPDATE users SET password_hash = '$2b$10$.CfDOyjWgxcKy6/MqAuoPOZOPolEeavWGMPxn8nepOGwv6p8gVbSW' WHERE username = 'lkp-binaessa';
UPDATE users SET password_hash = '$2b$10$767hiL6uhGF4PIVsUF93VO/eeDa8R9CimipUJA4gopKye/FJZrXVe' WHERE username = 'lkp-prima';
UPDATE users SET password_hash = '$2b$10$C.KqWmQW.7SuWZJdImiskeOxaehPoDw6AOsyKhKfY6eIOvBoPFyve' WHERE username = 'lkp-mediakomputer';
UPDATE users SET password_hash = '$2b$10$ydqpm9NKHZ.8kn2j//yFUujoXiGCwKPklrKoys1AUTFftF/TsANY2' WHERE username = 'lkp-butiranilmu';
UPDATE users SET password_hash = '$2b$10$LlISR6qGS116ZUGWPssZDOO8HxBiOXUe42f5c6YKKRTHRO7wwAEDm' WHERE username = 'lkp-viderista';
UPDATE users SET password_hash = '$2b$10$Wvl/D3qZXamEFyWPp56cX.RekmXy5DsUgyJdjDiEAPqUdeOWc8V0e' WHERE username = 'lkp-elidas';
UPDATE users SET password_hash = '$2b$10$7vhPVNuOyM4qcuQxy51mRulv.uu9XkBDA8jBEcR5RQ66vk7q5/vxC' WHERE username = 'lkp-skicomputer';
UPDATE users SET password_hash = '$2b$10$SPMhxHhioJU3Gv51wN6F0OqOxQMpaJw.Xn388bbo.17IPIX4Otjdu' WHERE username = 'lkp-florenza';
UPDATE users SET password_hash = '$2b$10$3gPKVnUqukm7yQEkPa83Sue0UGgVP3CJTHBTP6BdjGBWMa.FaHMv.' WHERE username = 'lkp-asti';

COMMIT;
