-- ============================================================
-- MONEV PUBLIKASI 2026 - Brief Liputan: hapus elemen "Output" dan "Etika"
--
-- Brief Liputan dipakai sebagai tulisan brief tentang bagaimana wawancara
-- berlangsung (alur: kondisi awal -> tantangan -> proses -> hasil -> dampak),
-- bukan daftar output/etika publikasi. Elemen "Output" dan "Etika" dihapus
-- dari daftar 12 elemen, menyisakan 10 elemen narasi wawancara.
--
-- Ikut menghapus jawaban (story_brief_responses) yang sudah terlanjur
-- diisi petugas untuk kedua elemen ini, supaya tidak ada data yatim.
--
-- Idempoten: aman dijalankan berkali-kali.
-- ============================================================

BEGIN;

-- 1. Hapus jawaban yang sudah diisi untuk elemen "Output" / "Etika"
DELETE FROM story_brief_responses
WHERE element_id IN (
  SELECT id FROM story_brief_elements WHERE elemen IN ('Output', 'Etika')
);

-- 2. Hapus elemen "Output" dan "Etika" dari daftar
DELETE FROM story_brief_elements
WHERE elemen IN ('Output', 'Etika');

-- 3. Rapikan nomor urut (urutan) supaya tetap berurutan 1..10 tanpa lubang
WITH renumbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY urutan) AS rn
  FROM story_brief_elements
)
UPDATE story_brief_elements e
SET urutan = r.rn
FROM renumbered r
WHERE e.id = r.id;

COMMIT;
