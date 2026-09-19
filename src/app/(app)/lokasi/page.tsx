import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, skills, assignments } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

export default async function LokasiPage() {
  const session = await auth();
  const role = session!.user.role;

  const rows = await db
    .select({
      id: locations.id,
      provinsi: locations.provinsi,
      kabKota: locations.kabKota,
      namaLembaga: locations.namaLembaga,
      skillName: skills.name,
    })
    .from(locations)
    .leftJoin(skills, eq(locations.skillId, skills.id))
    .where(eq(locations.isActive, true))
    .orderBy(locations.provinsi, locations.namaLembaga);

  // hitung jumlah petugas per lokasi (query terpisah, sederhana untuk skala 10 lokasi)
  const petugasCounts = await db
    .select({ locationId: assignments.locationId, total: count() })
    .from(assignments)
    .where(eq(assignments.periode, "2026"))
    .groupBy(assignments.locationId);
  const countMap = new Map(petugasCounts.map((p) => [p.locationId, p.total]));

  // kalau PETUGAS, filter hanya lokasi yang ditugaskan
  let visibleRows = rows;
  if (role === "PETUGAS") {
    const myAssignments = await db
      .select({ locationId: assignments.locationId })
      .from(assignments)
      .where(and(eq(assignments.userId, session!.user.id), eq(assignments.periode, "2026")));
    const myLocationIds = new Set(myAssignments.map((a) => a.locationId));
    visibleRows = rows.filter((r) => myLocationIds.has(r.id));
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {role === "PETUGAS" ? "Lokasi Saya" : "Lokasi Monev"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {visibleRows.length} lokasi &middot; Periode 2026
          </p>
        </div>
        {role === "SUPER_ADMIN" && (
          <Link
            href="/lokasi/baru"
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Tambah Lokasi
          </Link>
        )}
      </div>

      {visibleRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-400">
          Belum ada lokasi{role === "PETUGAS" ? " yang ditugaskan ke Anda" : ""}.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
              <tr>
                <th className="px-4 py-3">Lembaga</th>
                <th className="px-4 py-3">Provinsi / Kab-Kota</th>
                <th className="px-4 py-3">Keterampilan</th>
                <th className="px-4 py-3 text-center">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/lokasi/${r.id}`} className="font-medium text-slate-900 hover:underline">
                      {r.namaLembaga}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {r.kabKota}, {r.provinsi}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.skillName}</td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {countMap.get(r.id) ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
