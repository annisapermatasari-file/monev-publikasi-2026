import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, MapPin, Users, LogOut, ClipboardList } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/monev", label: "Monev Lapangan", icon: ClipboardList, roles: ["SUPER_ADMIN", "PETUGAS"] },
  { href: "/lokasi", label: "Lokasi Monev", icon: MapPin, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/petugas", label: "Petugas", icon: Users, roles: ["SUPER_ADMIN"] },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user.role;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-[#17231d] text-white sm:flex">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-lime-300 shadow-[0_0_0_4px_rgba(190,242,100,0.12)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-200">Live desk</span>
          </div>
          <p className="text-lg font-semibold tracking-tight text-white">Monev Publikasi</p>
          <p className="mt-1 text-xs text-slate-400">PKK &amp; PKW <span className="text-lime-300">/</span> 2026</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV.filter((n) => !role || n.roles.includes(role)).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[13.5px] font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <n.icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-lime-300" strokeWidth={1.75} />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-2 px-2">
            <p className="truncate text-[13px] font-medium text-white">
              {session?.user.name}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-lime-300/80">{role}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-rose-300">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
