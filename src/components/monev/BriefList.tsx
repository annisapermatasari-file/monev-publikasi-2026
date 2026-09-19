"use client";

import { useState, useTransition } from "react";
import { saveStoryBriefResponse } from "@/lib/actions/monev";
import { Check } from "lucide-react";

type BriefRow = {
  element: { id: string; elemen: string; arahan: string | null };
  response: { temuan: string | null; buktiLink: string | null } | null;
};

export function BriefList({ sessionId, items }: { sessionId: string; items: BriefRow[] }) {
  const [state, setState] = useState(
    Object.fromEntries(
      items.map((it) => [
        it.element.id,
        { temuan: it.response?.temuan ?? "", buktiLink: it.response?.buktiLink ?? "" },
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
      await saveStoryBriefResponse(sessionId, id, { temuan: d.temuan || undefined, buktiLink: d.buktiLink || undefined });
      setSavedId(id);
      setTimeout(() => setSavedId((c) => (c === id ? null : c)), 1200);
    });
  }

  return (
    <div className="space-y-3">
      {items.map(({ element }) => {
        const s = state[element.id];
        return (
          <div key={element.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{element.elemen}</p>
                {element.arahan && <p className="mt-0.5 text-xs text-slate-400">{element.arahan}</p>}
              </div>
              {savedId === element.id && (
                <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3 w-3" /> Tersimpan
                </span>
              )}
            </div>
            <textarea
              rows={2}
              placeholder="Temuan lapangan..."
              value={s.temuan}
              onChange={(e) => update(element.id, { temuan: e.target.value })}
              onBlur={() => persist(element.id)}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <input
              placeholder="Link bukti pendukung (opsional)"
              value={s.buktiLink}
              onChange={(e) => update(element.id, { buktiLink: e.target.value })}
              onBlur={() => persist(element.id)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
            />
          </div>
        );
      })}
    </div>
  );
}
