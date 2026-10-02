-- Tambah kolom checklist "mengerti" di langkah Brief Liputan, menggantikan
-- kolom tulisan bebas (brief_narrative) yang sudah tidak dipakai di UI.
-- Idempoten - aman dijalankan berulang.
BEGIN;

ALTER TABLE monev_sessions
  ADD COLUMN IF NOT EXISTS brief_acknowledged boolean NOT NULL DEFAULT false;

COMMIT;
