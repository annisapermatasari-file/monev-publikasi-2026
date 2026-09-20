import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, assignments, monevSessions, programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StartMonevButton } from "@/components/monev/StartMonevButton";

const STATUS_LABEL: Record<string, string> = {
  BELUM_DIMULAI: "Belum Dimulai",
  DRAFT: "Draft",
  SEDANG_DIKERJAKAN: "Sedang Dikerjakan",
  SUBMIT: "Submit",
  MENUNGGU_REVIEW: "Menunggu Review",
  PERLU_PERBAIKAN: "Perlu Perbaikan",
  DISETUJUI: "Disetujui",
};

export default async function MonevLapanganPage() {
  const session = await auth();
  const user = session!.user;

  const allPrograms = await db.select().from(programs);

  let myLocations;
  if (user.role === "PETUGAS") {
    myLocations = await db
      .select({ id: locations.id, namaLembaga: locations.namaLembaga, kabKota: locations.kabKota, provinsi: locations.provinsi })
      .from(assignments)
      .innerJoin(locations, eq(assignments.locationId, locations.id))
      .where(eq(assignments.userId, user.id));
  } else {
    myLocations = await db
      .select({ id: locations.id, namaLembaga: locations.namaLembaga, kabKota: locations.kabKota, provinsi: locations.provinsi })
      .from(locations)
      .where(eq(locations.isActive, true));
  }

  const existingSessions = await db.select().from(monevSessions);
  const sessionMap = new Map(
    existingSessions.map((s) => [`${s.locationId}:${s.programId}`, s])
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        {user.role === "PETUGAS" ? "Lokasi Saya" : "Monev Lapangan"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Pilih program untuk mulai atau melanjutkan Monev.
      </p>

      <div className="mt-6 space-y-4">
        {myLocations.map((loc) => (
          <div key={loc.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="font-medium text-slate-900">{loc.namaLembaga}</p>
            <p className="text-xs text-slate-400">
              {loc.kabKota}, {loc.provinsi}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {allPrograms.map((p) => {
                const existing = sessionMap.get(`${loc.id}:${p.id}`);
                return (
                  <div key={p.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{p.code}</span>
                      {existing && (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {STATUS_LABEL[existing.status]}
                        </span>
                      )}
                    </div>
                    <StartMonevButton
                      locationId={loc.id}
                      programCode={p.code as "PKK" | "PKW"}
                      existingSessionId={existing?.id}
                      currentStep={existing?.currentStep}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {myLocations.length === 0 && (
          <p className="text-sm text-slate-400">Belum ada lokasi ditugaskan ke Anda.</p>
        )}
      </div>
    </div>
  );
}
