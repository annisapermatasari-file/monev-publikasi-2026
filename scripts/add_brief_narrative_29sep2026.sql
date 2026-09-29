-- ============================================================
-- MONEV PUBLIKASI 2026 - Brief Liputan jadi satu tulisan narasi
--
-- Sebelumnya Brief Liputan diisi per-elemen (kotak isian terpisah untuk
-- tiap satu dari 10 elemen). Sekarang 10 elemen itu hanya ditampilkan
-- sebagai daftar poin panduan tertulis, dan petugas menulis SATU brief
-- naratif utuh di kolom "brief_narrative" pada monev_sessions.
--
-- Idempoten: aman dijalankan berkali-kali (IF NOT EXISTS).
-- ============================================================

ALTER TABLE monev_sessions
  ADD COLUMN IF NOT EXISTS brief_narrative text;
