"use client";

import { useState, useTransition } from "react";
import { createInterview, saveInterviewAnswer, deleteInterview } from "@/lib/actions/monev";
import { Check, Trash2, Plus } from "lucide-react";

type Answer = { id: string; pertanyaan: string; jawaban: string | null; bolehDikutip: boolean };
type Interview = { interview: { id: string; narasumber: string; peran: string }; answers: Answer[] };

const ROLE_OPTIONS = [
  { value: "PESERTA", label: "Peserta" },
  { value: "ALUMNI", label: "Alumni/Lulusan" },
  { value: "MITRA", label: "Mitra Industri/Usaha" },
  { value: "INSTRUKTUR", label: "Instruktur" },
  { value: "PENGELOLA", label: "Pengelola LKP" },
  { value: "LAINNYA", label: "Lainnya" },
];

export function InterviewManager({ sessionId, initial }: { sessionId: string; initial: Interview[] }) {
  const [interviews, setInterviews] = useState(initial);
  const [narasumber, setNarasumber] = useState("");
  const [peran, setPeran] = useState("PESERTA");
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  function handleAdd() {
    if (!narasumber.trim()) return;
    setAdding(true);
    startTransition(async () => {
      await createInterview(sessionId, narasumber.trim(), peran as Interview["interview"]["peran"] as never);
      setNarasumber("");
      setAdding(false);
      // reload dari server via full refresh sederhana
      window.location.reload();
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await deleteInterview(sessionId, id);
      setInterviews((prev) => prev.filter((iv) => iv.interview.id !== id));
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-900">Tambah Narasumber</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            placeholder="Nama narasumber"
            value={narasumber}
            onChange={(e) => setNarasumber(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
          <select
            value={peran}
            onChange={(e) => setPeran(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>
      </div>

      {interviews.map(({ interview, answers }) => (
        <InterviewCard key={interview.id} sessionId={sessionId} interview={interview} answers={answers} onRemove={handleRemove} />
      ))}

      {interviews.length === 0 && (
        <p className="text-center text-sm text-slate-400">Belum ada narasumber ditambahkan.</p>
      )}
    </div>
  );
}

function InterviewCard({
  sessionId,
  interview,
  answers,
  onRemove,
}: {
  sessionId: string;
  interview: { id: string; narasumber: string; peran: string };
  answers: Answer[];
  onRemove: (id: string) => void;
}) {
  const [state, setState] = useState(
    Object.fromEntries(answers.map((a) => [a.id, { jawaban: a.jawaban ?? "", bolehDikutip: a.bolehDikutip }]))
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function persist(answerId: string) {
    const d = state[answerId];
    startTransition(async () => {
      await saveInterviewAnswer(sessionId, answerId, d);
      setSavedId(answerId);
      setTimeout(() => setSavedId((c) => (c === answerId ? null : c)), 1200);
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{interview.narasumber}</p>
          <p className="text-xs text-slate-400">
            {ROLE_OPTIONS.find((r) => r.value === interview.peran)?.label ?? interview.peran}
          </p>
        </div>
        <button onClick={() => onRemove(interview.id)} className="text-slate-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-3">
        {answers.map((a) => {
          const s = state[a.id];
          return (
            <div key={a.id}>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-600">{a.pertanyaan}</p>
                {savedId === a.id && <Check className="h-3 w-3 text-emerald-600" />}
              </div>
              <textarea
                rows={2}
                value={s.jawaban}
                onChange={(e) => setState((st) => ({ ...st, [a.id]: { ...st[a.id], jawaban: e.target.value } }))}
                onBlur={() => persist(a.id)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
              <label className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={s.bolehDikutip}
                  onChange={(e) => {
                    setState((st) => ({ ...st, [a.id]: { ...st[a.id], bolehDikutip: e.target.checked } }));
                    setTimeout(() => persist(a.id), 0);
                  }}
                  className="rounded border-slate-300"
                />
                Boleh dikutip untuk publikasi
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
