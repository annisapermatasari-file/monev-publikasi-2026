"use client";

import { useState, useTransition } from "react";
import { saveStoryBriefNarrative } from "@/lib/actions/monev";
import { Check } from "lucide-react";

type BriefElement = { id: string; elemen: string; arahan: string | null };

export function BriefList({
  sessionId,
  elements,
  narrative,
}: {
  sessionId: string;
  elements: BriefElement[];
  narrative: string;
}) {
  const [text, setText] = useState(narrative);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  function persist() {
    startTransition(async () => {
      await saveStoryBriefNarrative(sessionId, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Poin-poin yang perlu dicakup</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Gunakan poin-poin ini sebagai panduan saat menulis brief di bawah — tidak perlu dijawab satu per satu.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          {elements.map((el) => (
            <li key={el.id} className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">{el.elemen}</span>
              {el.arahan && <span className="text-slate-500"> — {el.arahan}</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">Tulis brief liputan</p>
          {saved && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3 w-3" /> Tersimpan
            </span>
          )}
        </div>
        <textarea
          rows={10}
          placeholder="Tulis brief liputan sebagai satu narasi utuh mengikuti alur: kondisi awal → tantangan → proses → hasil → dampak. Sertakan poin-poin di atas sedetail yang Anda temukan di lapangan."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={persist}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed outline-none focus:border-slate-400 focus:bg-white"
        />
      </div>
    </div>
  );
}
