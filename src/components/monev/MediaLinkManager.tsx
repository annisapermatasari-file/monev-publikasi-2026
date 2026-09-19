"use client";

import { useState, useTransition } from "react";
import { addMediaAsset, deleteMediaAsset } from "@/lib/actions/monev";
import { Trash2, Plus, ExternalLink, Image as ImageIcon, Video } from "lucide-react";

const CATEGORIES = [
  { value: "ESTABLISHING_SHOT", label: "Establishing Shot" },
  { value: "PROSES_BELAJAR", label: "Proses Belajar" },
  { value: "CLOSE_UP_KETERAMPILAN", label: "Close-up Keterampilan" },
  { value: "INTERAKSI_PESERTA_INSTRUKTUR", label: "Interaksi Peserta-Instruktur" },
  { value: "PRODUK_HASIL", label: "Produk/Hasil" },
  { value: "MITRA", label: "Mitra" },
  { value: "TESTIMONI", label: "Testimoni" },
  { value: "AKTIVITAS_KERJA_USAHA", label: "Aktivitas Kerja/Usaha" },
  { value: "BUKTI_PENDUKUNG", label: "Bukti Pendukung" },
];

type Asset = {
  id: string;
  category: string;
  fileUrl: string;
  fileType: string;
  caption: string | null;
};

export function MediaLinkManager({ sessionId, initial }: { sessionId: string; initial: Asset[] }) {
  const [assets, setAssets] = useState(initial);
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [, startTransition] = useTransition();

  function handleAdd() {
    if (!fileUrl.trim()) return;
    const optimistic: Asset = {
      id: `temp-${Date.now()}`,
      category,
      fileUrl: fileUrl.trim(),
      fileType,
      caption: caption || null,
    };
    setAssets((prev) => [...prev, optimistic]);
    startTransition(async () => {
      await addMediaAsset(sessionId, {
        category,
        fileUrl: fileUrl.trim(),
        fileType,
        caption: caption || undefined,
      });
    });
    setFileUrl("");
    setCaption("");
  }

  function handleRemove(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (!id.startsWith("temp-")) {
      startTransition(async () => {
        await deleteMediaAsset(sessionId, id);
      });
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">
        Tempel link foto/video (Google Drive, YouTube, dsb) per kategori dokumentasi — bukan unggah file.
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-900">Tambah Dokumentasi</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value as "image" | "video")}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="image">Foto</option>
            <option value="video">Video</option>
          </select>
        </div>
        <input
          placeholder="Link foto/video"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
        />
        <input
          placeholder="Keterangan (opsional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
        />
        <button
          onClick={handleAdd}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {assets.map((a) => (
          <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                {a.fileType === "video" ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                {CATEGORIES.find((c) => c.value === a.category)?.label}
              </div>
              <button onClick={() => handleRemove(a.id)} className="text-slate-400 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <a
              href={a.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 flex items-center gap-1 truncate text-xs text-slate-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{a.fileUrl}</span>
            </a>
            {a.caption && <p className="mt-1 text-xs text-slate-400">{a.caption}</p>}
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <p className="text-center text-sm text-slate-400">Belum ada dokumentasi ditambahkan.</p>
      )}
    </div>
  );
}
