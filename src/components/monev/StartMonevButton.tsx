"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateSession } from "@/lib/actions/monev";

export function StartMonevButton({
  locationId,
  programCode,
  existingSessionId,
  currentStep,
}: {
  locationId: string;
  programCode: "PKK" | "PKW";
  existingSessionId?: string;
  currentStep?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const sessionId = existingSessionId ?? (await getOrCreateSession(locationId, programCode));
      router.push(`/monev/${sessionId}/step/${currentStep ?? 1}`);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="w-full rounded-lg bg-slate-900 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {pending ? "Memuat..." : existingSessionId ? "Lanjutkan Monev" : "Mulai Monev"}
    </button>
  );
}
