"use client";

import { useState, useTransition } from "react";
import { saveChannelAudit } from "@/lib/actions/monev";
import { Check } from "lucide-react";

type ChannelRow = {
  channel: { id: string; name: string; type: "INTERNAL" | "EKSTERNAL" };
  audit: {
    digunakan: boolean;
    jumlahKonten: number | null;
    urlContoh: string | null;
    periode: string | null;
    catatan: string | null;
  } | null;
};

export function ChannelList({ sessionId, items }: { sessionId: string; items: ChannelRow[] }) {
  const [state, setState] = useState(
    Object.fromEntries(
      items.map((it) => [
        it.channel.id,
        {
          digunakan: it.audit?.digunakan ?? false,
          jumlahKonten: it.audit?.jumlahKonten?.toString() ?? "",
          urlContoh: it.audit?.urlContoh ?? "",
          periode: it.audit?.periode ?? "",
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
      await saveChannelAudit(sessionId, id, {
        digunakan: d.digunakan,
        jumlahKonten: d.jumlahKonten ? Number(d.jumlahKonten) : undefined,
        urlContoh: d.urlContoh || undefined,
        periode: d.periode || undefined,
      });
      setSavedId(id);
      setTimeout(() => setSavedId((c) => (c === id ? null : c)), 1200);
    });
  }

  const internal = items.filter((i) => i.channel.type === "INTERNAL");
  const external = items.filter((i) => i.channel.type === "EKSTERNAL");

  const renderGroup = (rows: ChannelRow[], title: string) => (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
      <div className="space-y-3">
        {rows.map(({ channel }) => {
          const s = state[channel.id];
          return (
            <div key={channel.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 text-sm font-medium text-slate-900">
                  <input
                    type="checkbox"
                    checked={s.digunakan}
                    onChange={(e) => {
                      update(channel.id, { digunakan: e.target.checked });
                      persist(channel.id);
                    }}
                    className="rounded border-slate-300"
                  />
                  {channel.name}
                </label>
                {savedId === channel.id && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <Check className="h-3 w-3" /> Tersimpan
                  </span>
                )}
              </div>

              {s.digunakan && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    type="number"
                    placeholder="Jumlah konten"
                    value={s.jumlahKonten}
                    onChange={(e) => update(channel.id, { jumlahKonten: e.target.value })}
                    onBlur={() => persist(channel.id)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                  />
                  <input
                    placeholder="URL contoh"
                    value={s.urlContoh}
                    onChange={(e) => update(channel.id, { urlContoh: e.target.value })}
                    onBlur={() => persist(channel.id)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Periode (mis. 24-26 Sept)"
                    value={s.periode}
                    onChange={(e) => update(channel.id, { periode: e.target.value })}
                    onBlur={() => persist(channel.id)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderGroup(internal, "Kanal Internal")}
      {renderGroup(external, "Kanal Eksternal")}
    </div>
  );
}
