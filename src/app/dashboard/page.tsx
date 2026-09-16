import { auth, signOut } from "@/lib/auth";
import { db } from "@/db";
import { locations, monevSessions, assignments } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  const [{ total: totalLokasi }] = await db
    .select({ total: count() })
    .from(locations)
    .where(eq(locations.isActive, true));

  let lokasiSayaCount: number | null = null;
  if (user.role === "PETUGAS") {
    const [{ total }] = await db
      .select({ total: count() })
      .from(assignments)
      .where(eq(assignments.userId, user.id));
    lokasiSayaCount = total;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Dashboard Monev Publikasi
          </h1>
          <p className="text-slate-500 text-sm mt-1">PKK &amp; PKW 2026</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md px-3 py-1.5">
            Keluar
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
        <p className="text-sm text-slate-500">Masuk sebagai</p>
        <p className="font-medium text-slate-900">
          {user.name}{" "}
          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {user.role}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-sm text-slate-500">Total Lokasi</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">{totalLokasi}</p>
        </div>
        {lokasiSayaCount !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <p className="text-sm text-slate-500">Lokasi Saya</p>
            <p className="text-3xl font-semibold text-slate-900 mt-1">
              {lokasiSayaCount}
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 text-sm text-slate-400">
        Phase 2 (Database + Auth + RBAC) — halaman ini adalah bukti bahwa login,
        session, role, dan koneksi database sudah berjalan end-to-end. Wizard
        Monev, dashboard analitik penuh, dan fitur lain menyusul di phase
        berikutnya.
      </div>
    </div>
  );
}
