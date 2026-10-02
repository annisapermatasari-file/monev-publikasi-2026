"use client";

import { useState, useTransition } from "react";
import { saveBriefAcknowledgement } from "@/lib/actions/monev";
import { Check } from "lucide-react";

type BriefElement = { id: string; elemen: string; arahan: string | null };

export function BriefList({
  sessionId,
  elements,
  acknowledged,
}: {
  sessionId: string;
  elements: BriefElement[];
  acknowledged: boolean;
}) {
  const [checked, setChecked] = useState(acknowledged);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  function toggle(value: boolean) {
    setChecked(value);
    startTransition(async () => {
      await saveBriefAcknowledgement(sessionId, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Poin-poin yang perlu dicakup</p>
        <p className="mt-0.5 text-xs text-slate-600">
          Gunakan poin-poin ini sebagai panduan saat menggali cerita dari narasumber di langkah
          Wawancara — brief liputan ditulis di sana, bukan di langkah ini.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          {elements.map((el) => (
            <li key={el.id} className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">{el.elemen}</span>
              {el.arahan && <span className="text-slate-600"> — {el.arahan}</span>}
            </li>
          ))}
        </ol>

        <label className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => toggle(e.target.checked)}
            className="mt-0.5 rounded border-slate-300"
          />
          <span>
            Saya sudah membaca dan memahami poin-poin di atas sebagai panduan untuk langkah
            Wawancara.
          </span>
          {saved && (
            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3 w-3" /> Tersimpan
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
