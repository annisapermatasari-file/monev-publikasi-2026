# DESIGN.md — Monev Publikasi 2026

Ringkas, dipakai sebagai acuan konsistensi lintas halaman (dashboard, lokasi, petugas,
wizard Monev di phase berikutnya). Bukan landing page marketing — ini dashboard kerja
pemerintah: tenang, jelas, cepat dipakai di lapangan (termasuk dari HP).

## 1. Tema Visual

Institutional-minimal. Netral (slate), satu aksen gelap untuk aksi utama (bukan warna
mencolok), satu panel gradasi gelap dipakai HANYA di sisi penjelasan (hero login) —
bukan di area kerja (dashboard/form), supaya kontras tetap tinggi dan tidak melelahkan
mata saat dipakai berjam-jam.

## 2. Warna

| Role | Value | Pemakaian |
|---|---|---|
| `--surface` | `#f8fafc` (slate-50) | Background halaman |
| `--surface-card` | `#ffffff` | Card, form |
| `--border` | `#e2e8f0` (slate-200) | Border card/input |
| `--text-primary` | `#0f172a` (slate-900) | Judul, teks utama |
| `--text-secondary` | `#64748b` (slate-500) | Label, deskripsi |
| `--text-muted` | `#94a3b8` (slate-400) | Placeholder, teks tersier |
| `--action` | `#0f172a` (slate-900) | Tombol utama |
| `--action-hover` | `#1e293b` (slate-800) | Hover tombol utama |
| `--danger` | `#dc2626` (red-600) | Error, aksi hapus |
| `--success` | `#059669` (emerald-600) | Status aktif/selesai |
| Hero gradient | `#0b1220 → #111827` + radial indigo/sky 30-35% opacity | Hanya panel hero login |

Tidak menambah warna baru tanpa alasan — sesuai prinsip *simplicity* Apple design.

## 3. Tipografi

Font sistem (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`) — tidak pakai
web font eksternal (independen dari network pihak ketiga, dan sudah punya optical
sizing bawaan tiap OS).

| Level | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| Hero display | `clamp(2rem, 4vw, 2.75rem)` | 1.08 | `-0.02em` | 600 |
| Page title (h1) | `1.5rem` (24px) | 1.2 | `-0.01em` | 600 |
| Section title (h2) | `0.875rem` (14px) | 1.4 | `0` | 600 |
| Body | `0.875rem` (14px) | 1.5 | `0` | 400 |
| Label/meta | `0.75–0.8125rem` (12–13px) | 1.4 | `0` | 500 |

Aturan: heading besar → tracking negatif; body/label → tracking `0`. Jangan pakai satu
`letter-spacing` untuk semua ukuran.

## 4. Spacing & Layout

- Skala 4px (Tailwind default: 1=4px, 2=8px, 3=12px, 4=16px, 6=24px...).
- Card padding: `p-5`–`p-6`. Border-radius: `rounded-lg` (8px) untuk card/table, `rounded-xl` (12px) untuk input/button.
- Container: `max-w-5xl` untuk halaman list/dashboard, `max-w-2xl`–`max-w-3xl` untuk form/detail.
- Sidebar tetap 256px (`w-64`), disembunyikan di layar sempit (mobile pakai halaman penuh, sidebar menyusul jadi bottom-nav/drawer di phase lapangan).

## 5. Komponen

**Button primary**: `bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5`,
feedback tekan `active:scale-[0.98]` dengan transisi CSS 100ms (bukan spring) — instan,
sesuai prinsip *response* Apple design.

**Input**: `border-slate-200 bg-slate-50 rounded-xl`, saat fokus: `border-slate-400
bg-white ring-4 ring-slate-100`. Tidak ada animasi masuk/keluar pada fokus — harus
instan.

**Card**: `border border-slate-200 bg-white rounded-lg`, tanpa shadow berat (`shadow-sm`
maksimal) — flat, bukan skeuomorphic.

## 6. Motion — Aturan Baku (Apple design, dikoreksi)

**Kesalahan yang diperbaiki**: sebelumnya pakai `damping: 1` pada Motion library dan
mengira itu "damping ratio" (1.0 = critically damped). Itu keliru — di Motion,
`damping` adalah koefisien fisik mentah, bukan rasio; nilai `1` dengan `stiffness`
default justru under-damped (mantul). Parameter designer-friendly yang benar di Motion
adalah **`bounce` + `duration`**, persis seperti contoh di `apple-design` skill.

| Konteks | Konfigurasi | Alasan |
|---|---|---|
| Entrance halaman (fade+slide) | `{ type: "spring", bounce: 0, duration: 0.4–0.5 }` | Elemen muncul sendiri, bukan hasil gesture — tidak boleh overshoot |
| Stagger list (feature, stats) | sama, `staggerChildren: 0.06–0.09` | Konsisten, tidak mantul |
| Error/validasi | Fade + `y` kecil, `bounce: 0`, TANPA shake berosilasi | Shake horizontal berkesan "main-main"; dashboard pemerintah butuh tenang dan jelas, bukan playful |
| Tombol ditekan | CSS `active:scale-[0.98] transition-transform duration-100` | Feedback instan saat pointer-down, bukan animasi terpisah |
| **Kapan boleh bounce** | Hanya untuk interaksi bergestur/momentum (drag kartu, flick) — TIDAK ADA di app ini saat ini | Wizard Monev nanti kalau ada swipe-between-step baru boleh pakai `bounce: 0.15–0.2` |

**Default seluruh app: `bounce: 0` (critically damped).** Jangan tambah bounce di
tempat lain tanpa alasan gestur yang jelas.

## 7. Aksesibilitas

- `prefers-reduced-motion: reduce` → semua spring diganti fade sederhana (`duration:
  0.15`, tanpa translate).
- `prefers-reduced-transparency: reduce` → panel `backdrop-blur` di hero jadi solid.
- `prefers-contrast: more` → border putih transparan di hero dipertegas.

Sudah diimplementasikan di `globals.css` dan komponen terkait.
