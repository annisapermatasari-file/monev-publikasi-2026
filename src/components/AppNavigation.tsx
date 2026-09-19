"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Images, LayoutDashboard, LogOut, MapPin, Menu, ShieldCheck, Users, X } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/monev", label: "Monev Lapangan", icon: ClipboardList, roles: ["SUPER_ADMIN", "PETUGAS"] },
  { href: "/dokumentasi", label: "Dokumentasi", icon: Images, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/admin", label: "Control Room", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
  { href: "/lokasi", label: "Lokasi Monev", icon: MapPin, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/petugas", label: "Petugas", icon: Users, roles: ["SUPER_ADMIN"] },
];

type NavEntry = (typeof NAV)[number];

export function AppNavigation({ role, userName, onSignOut }: { role?: string; userName?: string | null; onSignOut: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleNav = NAV.filter((item) => !role || item.roles.includes(role));

  return (
    <>
      <button type="button" onClick={() => setOpen((value) => !value)} className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-[#17231d] text-white shadow-lg sm:hidden" aria-label={open ? "Tutup menu" : "Buka menu"}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className={`fixed inset-0 z-40 bg-[#17231d]/40 backdrop-blur-sm transition-opacity sm:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setOpen(false)} />
      <nav className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#17231d] px-4 py-6 text-white shadow-2xl transition-transform duration-200 sm:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Brand />
        <div className="mt-8 space-y-1">{visibleNav.map((item) => <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setOpen(false)} />)}</div>
        <AccountFooter userName={userName} role={role} onSignOut={onSignOut} />
      </nav>
      <nav className="hidden w-72 shrink-0 flex-col bg-[#17231d] px-4 py-6 text-white sm:flex">
        <Brand />
        <div className="mt-8 space-y-1">{visibleNav.map((item) => <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} />)}</div>
        <AccountFooter userName={userName} role={role} onSignOut={onSignOut} />
      </nav>
    </>
  );
}

function Brand() {
  return <div className="border-b border-white/10 px-2 pb-6"><div className="mb-5 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-lime-300 shadow-[0_0_0_4px_rgba(190,242,100,0.12)]" /><span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-200">Live desk</span></div><p className="text-lg font-semibold tracking-tight">Monev Publikasi</p><p className="mt-1 text-xs text-slate-400">PKK &amp; PKW <span className="text-lime-300">/</span> 2026</p></div>;
}

function NavItem({ item, active, onClick }: { item: NavEntry; active: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return <Link href={item.href} onClick={onClick} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13.5px] font-medium transition-all ${active ? "bg-lime-300 text-[#17231d] shadow-[0_8px_20px_rgba(190,242,100,0.12)]" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}><Icon className={`h-4 w-4 ${active ? "text-[#17231d]" : "text-slate-500 group-hover:text-lime-300"}`} strokeWidth={1.75} />{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#17231d]" />}</Link>;
}

function AccountFooter({ userName, role, onSignOut }: { userName?: string | null; role?: string; onSignOut: () => void }) {
  return <div className="mt-auto border-t border-white/10 pt-4"><div className="mb-3 px-2"><p className="truncate text-[13px] font-medium text-white">{userName}</p><p className="mt-0.5 text-[11px] uppercase tracking-wider text-lime-300/80">{role}</p></div><button type="button" onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-rose-300"><LogOut className="h-4 w-4" strokeWidth={1.75} />Keluar</button></div>;
}

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
