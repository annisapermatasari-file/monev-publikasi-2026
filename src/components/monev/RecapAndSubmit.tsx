"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSession } from "@/lib/actions/monev";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function RecapCards({
  recap,
  recommendations,
}: {
  recap: {
    keterpenuhan: number;
    kepatuhan: number;
    kinerja: number | null;
    narasi: number | null;
    visual: number | null;
  };
  recommendations: { kode: string; teks: string }[];
}) {
  const cards = [
    { label: "Keterpenuhan", value: `${recap.keterpenuhan}%` },
    { label: "Kepatuhan", value: `${recap.kepatuhan}%` },
    { label: "Kinerja Publikasi", value: recap.kinerja !== null ? `${recap.kinerja}/4` : "—" },
    { label: "Kualitas Narasi", value: recap.narasi !== null ? `${recap.narasi}/4` : "—" },
    { label: "Kualitas Visual", value: recap.visual !== null ? `${recap.visual}/4` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-900">Rekomendasi Otomatis</p>
        {recommendations.length === 0 ? (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Tidak ada gap signifikan terdeteksi.
          </p>
        ) : (
          <ul className="space-y-2">
            {recommendations.map((r) => (
              <li
                key={r.kode}
                className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {r.teks}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SubmitPanel({
  sessionId,
  complete,
  missing,
}: {
  sessionId: string;
  complete: boolean;
  missing: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  function handleSubmit() {
    setSubmitting(true);
    setError(null);
    startTransition(async () => {
      const res = await submitSession(sessionId);
      setSubmitting(false);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/monev?submitted=1");
    });
  }

  return (
    <div className="space-y-4">
      {complete ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Semua bagian sudah lengkap. Siap disubmit untuk review.
        </p>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="mb-1 font-medium">Masih ada {missing.length} bagian yang belum lengkap:</p>
          <ul className="list-inside list-disc space-y-0.5">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Mengirim..." : "Submit untuk Review"}
      </button>
    </div>
  );
}
