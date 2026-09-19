"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export function StepFooter({
  sessionId,
  stepNo,
  totalSteps,
}: {
  sessionId: string;
  stepNo: number;
  totalSteps: number;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSaveDraft = () => {
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
      {stepNo > 1 ? (
        <Link
          href={`/monev/${sessionId}/step/${stepNo - 1}`}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Link>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600">Tersimpan otomatis</span>
            </>
          ) : (
            "Simpan Draft"
          )}
        </button>

        {stepNo < totalSteps && (
          <Link
            href={`/monev/${sessionId}/step/${stepNo + 1}`}
            className="flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Lanjut
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
