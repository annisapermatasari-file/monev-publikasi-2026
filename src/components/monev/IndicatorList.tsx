"use client";

import { useState, useTransition } from "react";
import { saveIndicatorResponse } from "@/lib/actions/monev";
import { Check } from "lucide-react";

type IndicatorRow = {
  indicator: { id: string; label: string; responseType: "BOOLEAN" | "SCALE_1_4" };
  response: {
    boolValue: boolean | null;
    scaleValue: number | null;
    evidenceUrl: string | null;
    catatan: string | null;
  } | null;
};

const SCALE_LABELS: Record<number, string> = {
  1: "Sangat Tidak Baik",
  2: "Tidak Baik",
  3: "Baik",
  4: "Sangat Baik",
};

export function IndicatorList({ sessionId, items }: { sessionId: string; items: IndicatorRow[] }) {
  const [state, setState] = useState(
    Object.fromEntries(
      items.map((it) => [
        it.indicator.id,
        {
          boolValue: it.response?.boolValue ?? null,
          scaleValue: it.response?.scaleValue ?? null,
          evidenceUrl: it.response?.evidenceUrl ?? "",
          catatan: it.response?.catatan ?? "",
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
    const data = state[id];
    startTransition(async () => {
      await saveIndicatorResponse(sessionId, id, {
        boolValue: data.boolValue ?? undefined,
        scaleValue: data.scaleValue ?? undefined,
        evidenceUrl: data.evidenceUrl || undefined,
        catatan: data.catatan || undefined,
      });
      setSavedId(id);
      setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 1200);
    });
  }

  return (
    <div className="space-y-3">
      {items.map(({ indicator }) => {
        const s = state[indicator.id];
        return (
          <div key={indicator.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">{indicator.label}</p>
              {savedId === indicator.id && (
                <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3 w-3" /> Tersimpan
                </span>
              )}
            </div>

            {indicator.responseType === "BOOLEAN" ? (
              <div className="mt-3 flex gap-2">
                {[
                  { v: true, label: "Ya" },
                  { v: false, label: "Tidak" },
                ].map((opt) => (
                  <button
                    key={String(opt.v)}
                    onClick={() => {
                      update(indicator.id, { boolValue: opt.v });
                      persist(indicator.id);
                    }}
                    className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors active:scale-[0.97] ${
                      s.boolValue === opt.v
                        ? opt.v
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-red-500 bg-red-50 text-red-600"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4].map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      update(indicator.id, { scaleValue: v });
                      persist(indicator.id);
                    }}
                    title={SCALE_LABELS[v]}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors active:scale-[0.95] ${
                      s.scaleValue === v
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {v}
                  </button>
                ))}
                {s.scaleValue && (
                  <span className="ml-1 self-center text-xs text-slate-400">
                    {SCALE_LABELS[s.scaleValue]}
                  </span>
                )}
              </div>
            )}

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                placeholder="Tautan bukti (opsional)"
                value={s.evidenceUrl}
                onChange={(e) => update(indicator.id, { evidenceUrl: e.target.value })}
                onBlur={() => persist(indicator.id)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-slate-400 focus:bg-white"
              />
              <input
                placeholder="Catatan (opsional)"
                value={s.catatan}
                onChange={(e) => update(indicator.id, { catatan: e.target.value })}
                onBlur={() => persist(indicator.id)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
