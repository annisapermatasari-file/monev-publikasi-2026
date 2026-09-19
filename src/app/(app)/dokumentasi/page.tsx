import { auth } from "@/lib/auth";
import { db } from "@/db";
import { assignments, locations, mediaAssets, monevSessions, programs } from "@/db/schema";
import { and, eq, exists } from "drizzle-orm";
import { ExternalLink, FileText, Image as ImageIcon, Video } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  ESTABLISHING_SHOT: "Establishing shot",
  PROSES_BELAJAR: "Proses belajar",
  CLOSE_UP_KETERAMPILAN: "Close-up keterampilan",
  INTERAKSI_PESERTA_INSTRUKTUR: "Interaksi peserta",
  PRODUK_HASIL: "Produk / hasil",
  MITRA: "Mitra",
  TESTIMONI: "Testimoni",
  AKTIVITAS_KERJA_USAHA: "Aktivitas kerja / usaha",
  BUKTI_PENDUKUNG: "Bukti pendukung",
};

function AssetIcon({ fileType }: { fileType: string }) {
  if (fileType === "video") return <Video className="h-5 w-5" />;
  if (fileType === "document") return <FileText className="h-5 w-5" />;
  return <ImageIcon className="h-5 w-5" />;
}

export default async function DokumentasiPage() {
  const session = await auth();
  const user = session!.user;
  const rows = await db
    .select({
      id: mediaAssets.id,
      fileUrl: mediaAssets.fileUrl,
      fileType: mediaAssets.fileType,
      category: mediaAssets.category,
      caption: mediaAssets.caption,
      createdAt: mediaAssets.createdAt,
      namaLembaga: locations.namaLembaga,
      provinsi: locations.provinsi,
      programCode: programs.code,
      programName: programs.name,
    })
    .from(mediaAssets)
    .innerJoin(monevSessions, eq(mediaAssets.sessionId, monevSessions.id))
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .where(
      user.role === "PETUGAS"
        ? and(
            eq(locations.isActive, true),
            exists(
              db
                .select({ id: assignments.id })
                .from(assignments)
                .where(and(eq(assignments.locationId, locations.id), eq(assignments.userId, user.id)))
            )
          )
        : eq(locations.isActive, true)
    )
    .orderBy(mediaAssets.createdAt);

  const categories = [...new Set(rows.map((row) => row.category))];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">Phase 6 / Documentation desk</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Gallery kegiatan komunikasi</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Kumpulan foto, video, dan bukti visual dari lokasi monev yang siap ditinjau kembali.
          </p>
        </div>
        <div className="rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] px-4 py-3 text-right">
          <p className="text-2xl font-semibold text-slate-900">{rows.length}</p>
          <p className="text-xs text-slate-500">aset terdokumentasi</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c5d1bf] bg-[#fbfcf8] px-6 py-16 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-lime-600" />
          <p className="mt-3 text-sm font-medium text-slate-700">Belum ada dokumentasi.</p>
          <p className="mt-1 text-sm text-slate-400">Tambahkan link foto atau video dari langkah Dokumentasi di wizard Monev.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((asset) => (
            <a
              key={asset.id}
              href={asset.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] transition-all hover:-translate-y-0.5 hover:border-lime-400 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <div className="flex h-36 items-center justify-center bg-[#e8eee2] text-lime-800">
                <AssetIcon fileType={asset.fileType} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-lime-700">
                      {CATEGORY_LABELS[asset.category] ?? asset.category}
                    </p>
                    <p className="mt-1 font-medium text-slate-900">{asset.namaLembaga}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-lime-700" />
                </div>
                <p className="mt-1 text-xs text-slate-500">{asset.provinsi} · {asset.programCode}</p>
                {asset.caption && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{asset.caption}</p>}
              </div>
            </a>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <p className="mt-6 text-xs text-slate-400">Menampilkan {categories.length} kategori dokumentasi dari seluruh sesi yang memiliki aset.</p>
      )}
    </div>
  );
}