# Deploy Monev Publikasi 2026 ke Vercel

## 1. Siapkan repository

Gunakan repository `annisapermatasari-file/monev-publikasi-2026` dan branch `manus-vercel-migration`. Branch ini berisi aplikasi Vite + Express + tRPC yang telah dilengkapi `vercel.json` dan serverless API entrypoint `api/index.ts`.

## 2. Import ke Vercel

Buka dashboard Vercel, pilih **Add New → Project**, lalu import repository GitHub `annisapermatasari-file/monev-publikasi-2026`. Pada pilihan branch, pilih `manus-vercel-migration` untuk deployment pertama.

## 3. Build settings

Biarkan Vercel membaca `vercel.json`. Nilai yang harus terlihat adalah:

| Pengaturan | Nilai |
|---|---|
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm run build` |
| Output Directory | `dist/public` |
| API Function | `api/index.ts` |

Jangan memilih preset Next.js untuk branch ini. Pilih **Other** bila Vercel meminta framework preset secara manual.

## 4. Environment variables

Tambahkan variabel berikut untuk **Production**, **Preview**, dan **Development** bila diperlukan:

| Variable | Kegunaan |
|---|---|
| `DATABASE_URL` | Koneksi MySQL/TiDB untuk users, lokasi, laporan, dan dokumentasi |
| `JWT_SECRET` | Penandatangan session |
| `VITE_APP_ID` | ID aplikasi OAuth |
| `OAUTH_SERVER_URL` | Server OAuth |
| `VITE_OAUTH_PORTAL_URL` | Portal login OAuth |
| `OWNER_OPEN_ID` | Open ID pemilik aplikasi |
| `OWNER_NAME` | Nama pemilik aplikasi |
| `BUILT_IN_FORGE_API_URL` | API storage dan LLM server-side |
| `BUILT_IN_FORGE_API_KEY` | Secret API server-side |
| `VITE_FRONTEND_FORGE_API_URL` | URL API client-side bila digunakan |
| `VITE_FRONTEND_FORGE_API_KEY` | Key client-side yang memang dirancang untuk browser |
| `VITE_GA_MEASUREMENT_ID` | Opsional, contoh `G-XXXXXXXXXX` |
| `VITE_GSC_VERIFICATION` | Opsional, token verifikasi Google Search Console |

Jangan commit secret ke GitHub dan jangan menaruh `DATABASE_URL`, `JWT_SECRET`, atau `BUILT_IN_FORGE_API_KEY` pada variabel yang diawali `VITE_`.

## 5. Domain dan OAuth

Tambahkan domain produksi pada **Settings → Domains**. Setelah domain aktif, daftarkan callback OAuth sesuai URL yang digunakan server OAuth. Callback aplikasi adalah:

```text
https://DOMAIN_ANDA/api/oauth/callback
```

Ganti `DOMAIN_ANDA` dengan domain Vercel atau custom domain yang sebenarnya.

## 6. Deploy pertama

Klik **Deploy**. Setelah selesai, buka:

```text
https://DOMAIN_ANDA/
https://DOMAIN_ANDA/robots.txt
https://DOMAIN_ANDA/sitemap.xml
```

Pastikan homepage, metadata, sitemap, dan robots dapat dibaca.

## 7. Uji API dan autentikasi

Uji bahwa endpoint API tidak diarahkan ke SPA:

```bash
curl -i https://DOMAIN_ANDA/api/trpc/auth.me?batch=1\&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D
```

Uji login OAuth dari `/login`, lalu uji dashboard, lokasi, dokumentasi, review, dan insight assistant. Bila login gagal, periksa callback URL dan cookie policy pada konfigurasi OAuth.

## 8. Promosikan ke main

Setelah deployment branch berhasil, buat Pull Request dari `manus-vercel-migration` ke `main`. Karena kedua branch memiliki histori berbeda, GitHub dapat meminta merge dengan unrelated histories atau menampilkan konflik besar. Jangan merge tanpa meninjau daftar file yang akan menggantikan project Next.js lama.

## 9. Rollback

Gunakan deployment sebelumnya di Vercel untuk rollback bila API atau OAuth belum siap. Simpan environment variables di Vercel, bukan di repository.
