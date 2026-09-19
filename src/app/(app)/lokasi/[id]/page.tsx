import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, skills, assignments, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  updateLocation,
  softDeleteLocation,
  assignOfficerToLocation,
  unassignOfficerFromLocation,
  getAvailableOfficers,
} from "@/lib/actions/locations";

export default async function LokasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = session!.user.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [location] = await db
    .select({
      id: locations.id,
      provinsi: locations.provinsi,
      kabKota: locations.kabKota,
      namaLembaga: locations.namaLembaga,
      penanggungJawab: locations.penanggungJawab,
      noTelp: locations.noTelp,
      alamat: locations.alamat,
      igHandle: locations.igHandle,
      fbHandle: locations.fbHandle,
      ytHandle: locations.ytHandle,
      tiktokHandle: locations.tiktokHandle,
      websiteUrl: locations.websiteUrl,
      skillName: skills.name,
    })
    .from(locations)
    .leftJoin(skills, eq(locations.skillId, skills.id))
    .where(eq(locations.id, id))
    .limit(1);

  if (!location) notFound();

  // PETUGAS hanya boleh lihat lokasi yang ditugaskan ke mereka
  if (role === "PETUGAS") {
    const [assigned] = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.locationId, id), eq(assignments.userId, session!.user.id)))
      .limit(1);
    if (!assigned) redirect("/lokasi");
  }

  const assignedOfficers = await db
    .select({
      assignmentId: assignments.id,
      userId: users.id,
      name: users.name,
      username: users.username,
      isUnitAccount: users.isUnitAccount,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.userId, users.id))
    .where(and(eq(assignments.locationId, id), eq(assignments.periode, "2026")));

  const availableOfficers = isSuperAdmin ? await getAvailableOfficers(id) : [];

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateLocation(id, formData);
  }

  async function handleDelete() {
    "use server";
    await softDeleteLocation(id);
    redirect("/lokasi");
  }

  async function handleAssign(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    if (userId) await assignOfficerToLocation(id, userId);
  }

  async function handleUnassign(formData: FormData) {
    "use server";
    const assignmentId = formData.get("assignmentId") as string;
    await unassignOfficerFromLocation(assignmentId, id);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      <Link
        href="/lokasi"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Lokasi
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">{location.namaLembaga}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {location.kabKota}, {location.provinsi}
      </p>

      {/* ------- Info Lokasi ------- */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Identitas Lokasi</h2>
        {isSuperAdmin ? (
          <form action={handleUpdate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Provinsi" name="provinsi" defaultValue={location.provinsi} required />
            <Field label="Kab/Kota" name="kabKota" defaultValue={location.kabKota} required />
            <Field
              label="Nama Lembaga"
              name="namaLembaga"
              defaultValue={location.namaLembaga}
              required
              full
            />
            <Field
              label="Jenis Keterampilan"
              name="skillName"
              defaultValue={location.skillName ?? ""}
              required
            />
            <Field
              label="Penanggung Jawab"
              name="penanggungJawab"
              defaultValue={location.penanggungJawab ?? ""}
            />
            <Field label="No. Telp" name="noTelp" defaultValue={location.noTelp ?? ""} />
            <Field label="Alamat" name="alamat" defaultValue={location.alamat ?? ""} full textarea />

            <div className="col-span-full my-1 border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-medium text-slate-400">Kanal Internal LKP</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Instagram" name="igHandle" defaultValue={location.igHandle ?? ""} />
                <Field label="Facebook" name="fbHandle" defaultValue={location.fbHandle ?? ""} />
                <Field label="YouTube" name="ytHandle" defaultValue={location.ytHandle ?? ""} />
                <Field label="TikTok" name="tiktokHandle" defaultValue={location.tiktokHandle ?? ""} />
                <Field
                  label="Website"
                  name="websiteUrl"
                  defaultValue={location.websiteUrl ?? ""}
                  full
                />
              </div>
            </div>

            <div className="col-span-full flex items-center justify-between pt-2">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Info label="Jenis Keterampilan" value={location.skillName} />
            <Info label="Penanggung Jawab" value={location.penanggungJawab} />
            <Info label="No. Telp" value={location.noTelp} />
            <Info label="Alamat" value={location.alamat} />
          </dl>
        )}
      </div>

      {/* ------- Petugas ditugaskan ------- */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Petugas Ditugaskan</h2>

        {assignedOfficers.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada petugas ditugaskan.</p>
        ) : (
          <ul className="mb-4 divide-y divide-slate-100">
            {assignedOfficers.map((o) => (
              <li key={o.assignmentId} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {o.name}
                    {o.isUnitAccount && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        Akun Tim
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">@{o.username}</p>
                </div>
                {isSuperAdmin && (
                  <form action={handleUnassign}>
                    <input type="hidden" name="assignmentId" value={o.assignmentId} />
                    <button className="text-xs font-medium text-red-500 hover:text-red-700">
                      Lepas Tugas
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        {isSuperAdmin && availableOfficers.length > 0 && (
          <form action={handleAssign} className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <select
              name="userId"
              required
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Pilih petugas untuk ditugaskan...</option>
              {availableOfficers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} (@{o.username})
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Tugaskan
            </button>
          </form>
        )}
      </div>

      {isSuperAdmin && (
        <form action={handleDelete} className="mt-6">
          <button className="text-xs font-medium text-red-500 hover:text-red-700">
            Nonaktifkan lokasi ini
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  full,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  full?: boolean;
  textarea?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={2}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          required={required}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{value || "—"}</dd>
    </div>
  );
}
