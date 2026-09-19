"use client";

import { useState, useTransition } from "react";
import { saveEvidence } from "@/lib/actions/monev";
import { Check, ExternalLink } from "lucide-react";

type EvidenceRow = {
  type: { id: string; label: string };
  evidence: {
    ada: boolean;
    fileUrl: string | null;
    dataCapaian: string | null;
    kutipanTestimoni: string | null;
  } | null;
};

export function EvidenceList({ sessionId, items }: { sessionId: string; items: EvidenceRow[] }) {
  const [state, setState] = useState(
    Object.fromEntries(
      items.map((it) => [
        it.type.id,
        {
          ada: it.evidence?.ada ?? false,
          fileUrl: it.evidence?.fileUrl ?? "",
          dataCapaian: it.evidence?.dataCapaian ?? "",
          kutipanTestimoni: it.evidence?.kutipanTestimoni ?? "",
        },
      ])
    )
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function update(id: string, patch: Partial<(typeof state)[string]>) {
    setState((s) => ({ ...s, [id]: { ...s[id], ...patch } }));
  }

  function persist(id: string) {
    const d = state[id];
    startTransition(async () => {
      await saveEvidence(sessionId, id, {
        ada: d.ada,
        fileUrl: d.fileUrl || undefined,
        dataCapaian: d.dataCapaian || undefined,
        kutipanTestimoni: d.kutipanTestimoni || undefined,
      });
      setSavedId(id);
      setTimeout(() => setSavedId((c) => (c === id ? null : c)), 1200);
    });
  }

  return (
    <div className="space-y-3">
      <p className="mb-1 text-xs text-slate-400">
        Isi tautan ke tempat bukti disimpan (Google Drive, YouTube, dsb) — bukan unggah file.
      </p>
      {items.map(({ type }) => {
        const s = state[type.id];
        return (
          <div key={type.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  checked={s.ada}
                  onChange={(e) => {
                    update(type.id, { ada: e.target.checked });
                    persist(type.id);
                  }}
                  className="rounded border-slate-300"
                />
                {type.label}
              </label>
              {savedId === type.id && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3 w-3" /> Tersimpan
                </span>
              )}
            </div>

            {s.ada && (
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <input
                    placeholder="Link penyimpanan (Drive/YouTube/dsb)"
                    value={s.fileUrl}
                    onChange={(e) => update(type.id, { fileUrl: e.target.value })}
                    onBlur={() => persist(type.id)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 pr-8 text-xs"
                  />
                  {s.fileUrl && (
                    <a
                      href={s.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <input
                  placeholder="Data capaian (opsional)"
                  value={s.dataCapaian}
                  onChange={(e) => update(type.id, { dataCapaian: e.target.value })}
                  onBlur={() => persist(type.id)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                />
                <input
                  placeholder="Kutipan testimoni (opsional)"
                  value={s.kutipanTestimoni}
                  onChange={(e) => update(type.id, { kutipanTestimoni: e.target.value })}
                  onBlur={() => persist(type.id)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
