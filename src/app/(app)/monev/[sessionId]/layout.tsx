import { getSessionMeta } from "@/lib/actions/monev";
import { STEPS } from "@/lib/monev-steps";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function MonevWizardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { location, program, session: monevSession } = await getSessionMeta(sessionId);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
        <Link
          href="/monev"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3 w-3" />
          Lokasi Saya
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{location.namaLembaga}</h1>
            <p className="text-sm text-slate-500">
              {location.kabKota}, {location.provinsi} &middot; Program {program.code}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {monevSession.status.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      {/* Stepper — scrollable horizontal di mobile */}
      <nav className="overflow-x-auto border-b border-slate-200 bg-white px-6 sm:px-10">
        <div className="flex min-w-max gap-1 py-2">
          {STEPS.map((s) => (
            <Link
              key={s.no}
              href={`/monev/${sessionId}/step/${s.no}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-500">
                {s.no}
              </span>
              {s.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
