import { db } from "@/db";
import { users, assignments } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toggleOfficerActive } from "@/lib/actions/users";

export default async function PetugasPage() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      isUnitAccount: users.isUnitAccount,
      isActive: users.isActive,
    })
    .from(users)
    .orderBy(users.name);

  const assignCounts = await db
    .select({ userId: assignments.userId, total: count() })
    .from(assignments)
    .where(eq(assignments.periode, "2026"))
    .groupBy(assignments.userId);
  const countMap = new Map(assignCounts.map((a) => [a.userId, a.total]));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Petugas</h1>
          <p className="mt-1 text-sm text-slate-500">{rows.length} akun terdaftar</p>
        </div>
        <Link
          href="/petugas/baru"
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-center">Lokasi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {u.name}
                  {u.isUnitAccount && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      Tim
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">@{u.username}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {u.role === "PETUGAS" ? countMap.get(u.id) ?? 0 : "—"}
                </td>
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <span className="text-xs font-medium text-emerald-600">Aktif</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Nonaktif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await toggleOfficerActive(u.id, !u.isActive);
                    }}
                  >
                    <button className="text-xs font-medium text-slate-500 hover:text-slate-800">
                      {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
