-- ============================================================
-- MONEV PUBLIKASI 2026 - Bukti Publikasi: ganti label "Video YouTube 7–15
-- menit" menjadi "Video landscape 3–5 menit" (PKK & PKW)
--
-- Idempoten: aman dijalankan berkali-kali.
-- ============================================================

BEGIN;

UPDATE evidence_types
SET label = 'Video landscape 3–5 menit'
WHERE label = 'Video YouTube 7–15 menit';

COMMIT;
