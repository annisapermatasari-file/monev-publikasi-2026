import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, MapPin, Users, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/lokasi", label: "Lokasi Monev", icon: MapPin, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/petugas", label: "Petugas", icon: Users, roles: ["SUPER_ADMIN"] },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user.role;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">
        <div className="border-b border-slate-100 px-5 py-5">
          <p className="text-[13px] font-semibold text-slate-900">Monev Publikasi</p>
          <p className="text-xs text-slate-400">PKK &amp; PKW 2026</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.filter((n) => !role || n.roles.includes(role)).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <n.icon className="h-4 w-4" strokeWidth={1.75} />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-[13px] font-medium text-slate-900">
              {session?.user.name}
            </p>
            <p className="text-[11px] text-slate-400">{role}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-600">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
