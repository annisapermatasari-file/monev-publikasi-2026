import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createLocation } from "@/lib/actions/locations";

export default async function LokasiBaruPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/lokasi");

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createLocation(formData);
    if (result?.success && result.id) {
      redirect(`/lokasi/${result.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      <Link
        href="/lokasi"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Lokasi
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">Tambah Lokasi Monev</h1>
      <p className="mt-1 text-sm text-slate-500">
        Data ini akan menjadi lokasi baru pada periode 2026.
      </p>

      <form action={handleCreate} className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Provinsi" name="provinsi" required />
          <Field label="Kab/Kota" name="kabKota" required />
        </div>
        <Field label="Nama Lembaga" name="namaLembaga" required />
        <Field label="Jenis Keterampilan" name="skillName" required placeholder="mis. Tata Boga" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Penanggung Jawab" name="penanggungJawab" />
          <Field label="No. Telp" name="noTelp" />
        </div>
        <Field label="Alamat" name="alamat" textarea />

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Simpan Lokasi
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  textarea,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={2}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        />
      ) : (
        <input
          type="text"
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        />
      )}
    </div>
  );
}
