import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { FaqPage, MethodologyPage, PublicHome } from "@/pages/PublicPages";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MoreHorizontal,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Link, Route, Switch, useLocation } from "wouter";
import "./index.css";

type Role = "SUPER_ADMIN" | "PETUGAS" | "VIEWER";
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/monev", label: "Monev Lapangan", icon: ClipboardList, roles: ["SUPER_ADMIN", "PETUGAS"] },
  { href: "/dokumentasi", label: "Dokumentasi", icon: Images, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/review", label: "Review Hasil", icon: ClipboardCheck, roles: ["SUPER_ADMIN"] },
  { href: "/lokasi", label: "Lokasi Monev", icon: MapPin, roles: ["SUPER_ADMIN", "PETUGAS", "VIEWER"] },
  { href: "/petugas", label: "Petugas", icon: Users, roles: ["SUPER_ADMIN"] },
];

const activity = [
  { initials: "AR", name: "Ari Rahman", action: "mengirim laporan baru", area: "Kab. Sleman", time: "12 menit lalu", tone: "lime" },
  { initials: "NS", name: "Nisa Sari", action: "memperbarui dokumentasi", area: "Kota Bandung", time: "36 menit lalu", tone: "pink" },
  { initials: "DL", name: "Dimas Lestari", action: "menyelesaikan monev", area: "Kab. Gowa", time: "1 jam lalu", tone: "blue" },
  { initials: "SA", name: "Siti Aminah", action: "menambahkan catatan", area: "Kab. Bantul", time: "2 jam lalu", tone: "amber" },
];

const provinces = [
  { name: "Jawa Barat", total: 18, progress: 88, color: "#a3e635" },
  { name: "Jawa Tengah", total: 15, progress: 76, color: "#fb7185" },
  { name: "DI Yogyakarta", total: 12, progress: 64, color: "#38bdf8" },
  { name: "Sulawesi Selatan", total: 9, progress: 49, color: "#fbbf24" },
];

function App() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={PublicHome} />
      <Route path="/login" component={LoginPage} />
      <Route path="/metodologi" component={MethodologyPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/dashboard" component={() => <AppShell><DashboardPage /></AppShell>} />
      <Route path="/monev" component={() => <AppShell><MonevPage /></AppShell>} />
      <Route path="/dokumentasi" component={() => <AppShell><DocumentationPage /></AppShell>} />
      <Route path="/review" component={() => <AppShell><ReviewPage /></AppShell>} />
      <Route path="/lokasi" component={() => <AppShell><LocationsPage /></AppShell>} />
      <Route path="/insight" component={() => <AppShell><InsightPage /></AppShell>} />
      <Route path="/petugas" component={() => <AppShell><StaffPage /></AppShell>} />
      <Route component={LoginPage} />
    </Switch>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("admin@monev.go.id");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    document.title = "Masuk | Monev Publikasi 2026";
    let robots = document.head.querySelector("meta[name='robots']") as HTMLMetaElement | null;
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = "noindex,nofollow";
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError("Masukkan email dan kata sandi untuk melanjutkan.");
      return;
    }
    startLogin();
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Informasi program">
        <div className="noise" />
        <div className="auth-topline">
          <div className="brand-lockup light">
            <span className="brand-mark"><span /></span>
            <div><strong>MONEV</strong><small>Publikasi 2026</small></div>
          </div>
          <div className="live-pill"><i /> Sistem aktif</div>
        </div>
        <div className="signal-rings"><span /><span /><span /><span /><b /></div>
        <div className="auth-copy">
          <p className="eyebrow lime"><Radio size={14} /> National communication monitor</p>
          <h1>Sinyal publikasi<br /><em>nasional.</em></h1>
          <p>Memantau denyut kegiatan komunikasi PKK dan PKW dari lokasi monev sampai kanal publikasi.</p>
        </div>
        <div className="auth-visual-footer">
          <span>Direktorat Kursus &amp; Pelatihan</span>
          <span className="footer-line" />
          <span>Periode aktif <strong>2026</strong></span>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand brand-lockup"><span className="brand-mark"><span /></span><div><strong>MONEV</strong><small>Publikasi 2026</small></div></div>
          <div className="auth-form-heading">
            <p className="eyebrow">Ruang kerja Anda</p>
            <h2>Selamat datang</h2>
            <p>Masuk untuk melanjutkan pemantauan dan evaluasi publikasi.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email kerja</label>
            <div className="input-wrap"><FileText size={17} /><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@instansi.go.id" autoComplete="email" /></div>
            <div className="label-row"><label htmlFor="password">Kata sandi</label><button type="button" className="text-button" onClick={() => setError("Silakan hubungi admin untuk reset kata sandi.")}>Lupa kata sandi?</button></div>
            <div className="input-wrap"><ShieldCheck size={17} /><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Sembunyikan" : "Lihat"}</button></div>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button auth-submit" type="submit">Masuk ke dashboard <ArrowUpRight size={17} /></button>
          </form>
          <div className="demo-note"><Sparkles size={15} /><span><strong>Login aman.</strong> Anda akan diarahkan ke akun resmi untuk melanjutkan ke dashboard.</span></div>
          <p className="auth-footnote">© 2026 Direktorat Kursus dan Pelatihan · PKK &amp; PKW</p>
        </div>
      </section>
    </main>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const active = (href: string) => href === "/dashboard" ? location === href : location === href || location.startsWith(`${href}/`);
  const displayName = user?.name || user?.email || "Pengguna Monev";
  const displayRole = user?.role === "admin" ? "Super Admin" : "Petugas";
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "MO";
  useEffect(() => {
    let robots = document.head.querySelector("meta[name='robots']") as HTMLMetaElement | null;
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = "noindex,nofollow";
  }, []);

  async function signOut() {
    await logout();
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2400);
  }

  if (loading || !user) return <div className="auth-loading"><div className="auth-loading-mark"><span /></div><p>Menyiapkan ruang kerja…</p></div>;

  return (
    <div className="app-layout">
      <button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Buka menu"><Menu size={21} /></button>
      <div className={`mobile-backdrop ${mobileOpen ? "is-open" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`app-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-lockup light"><span className="brand-mark"><span /></span><div><strong>MONEV</strong><small>Publikasi 2026</small></div></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={18} /></button>
        </div>
        <div className="sidebar-status"><i /> Live desk <span>●</span></div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          <p className="nav-label">Ruang kerja</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`nav-item ${active(item.href) ? "active" : ""}`}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{active(item.href) && <b />} </Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="account-mini"><div className="avatar avatar-lime">{initials}</div><div><strong>{displayName}</strong><small>{displayRole}</small></div><MoreHorizontal size={17} /></div>
          <button className="signout-button" onClick={signOut}><LogOut size={16} /> Keluar</button>
        </div>
      </aside>
      <div className="app-content"><header className="app-topbar"><div><p className="topbar-kicker">Monev Publikasi <span>/</span> 2026</p><p className="topbar-date">Senin, 21 September 2026</p></div><div className="topbar-actions"><button className="icon-button" aria-label="Cari"><Search size={18} /></button><button className="icon-button notification" aria-label="Notifikasi"><Bell size={18} /><i /></button><div className="topbar-profile"><div className="avatar avatar-lime">{initials}</div><div><strong>{displayName}</strong><small>{displayRole}</small></div></div></div></header><main className="page-content">{children}</main></div>
      {showToast && <div className="toast"><Check size={16} /> Sesi ditutup. <Link href="/login">Masuk kembali</Link></div>}
    </div>
  );
}

function DashboardPage() {
  const { data } = trpc.dashboard.overview.useQuery();
  const locationsValue = data ? String(data.locations) : "—";
  const completedValue = data ? String(data.completed) : "—";
  const publicationsValue = data ? String(data.publications) : "—";
  const completenessValue = data ? `${data.completeness}%` : "—";
  return <>
    <PageIntro eyebrow="National communication monitor" title={<>Sinyal publikasi <em>nasional.</em></>} description="Pantau denyut kegiatan komunikasi PKK dan PKW dari lokasi monev sampai kanal publikasi." action={<Link href="/insight" className="outline-button"><BarChart3 size={16} /> Lihat analitik</Link>} />
    <div className="workspace-strip"><div><p>Ruang kerja</p><strong>Sari Anindita <span>SUPER ADMIN</span></strong></div><div className="strip-right"><span className="pulse-dot" /> Data diperbarui 2 menit lalu <ChevronRight size={16} /></div></div>
    <section className="stat-grid">
      <StatCard label="Total lokasi" value={locationsValue} note="Titik pemantauan aktif" tone="lime" icon={<MapPin size={17} />} trend="live" />
      <StatCard label="Monev selesai" value={completedValue} note={data ? `Dari ${data.reports} penugasan` : "Mengambil data…"} tone="blue" icon={<ClipboardCheck size={17} />} trend="live" />
      <StatCard label="Publikasi tayang" value={publicationsValue} note="Konten terverifikasi" tone="pink" icon={<Images size={17} />} trend="live" />
      <StatCard label="Kelengkapan data" value={completenessValue} note="Kualitas laporan" tone="amber" icon={<Activity size={17} />} trend="live" />
    </section>
    <section className="dashboard-grid">
      <div className="panel chart-panel"><PanelHeading eyebrow="Capaian monitoring" title="Aktivitas monev" action="7 hari terakhir" /><div className="chart-legend"><span><i className="legend-lime" /> Selesai</span><span><i className="legend-muted" /> Dalam proses</span></div><div className="bar-chart">{[54, 68, 46, 82, 66, 93, 76].map((height, index) => <div className="bar-column" key={index}><div className="bar-stack"><span className="bar-progress" style={{ height: `${height}%` }} /><span className="bar-rest" style={{ height: `${100 - height}%` }} /></div><small>{["15 Sep", "16 Sep", "17 Sep", "18 Sep", "19 Sep", "20 Sep", "21 Sep"][index]}</small></div>)}</div><div className="chart-foot"><span><strong>{data?.completed ?? "—"}</strong> laporan selesai</span><span className="positive"><Radio size={14} /> Data tersimpan</span></div></div>
      <div className="panel progress-panel"><PanelHeading eyebrow="Sebaran wilayah" title="Capaian provinsi" action="Lihat semua" /><div className="province-list">{provinces.map((province) => <div className="province-row" key={province.name}><div className="province-meta"><span>{province.name}</span><strong>{province.total}<small> lokasi</small></strong></div><div className="progress-track"><span style={{ width: `${province.progress}%`, background: province.color }} /></div><p>{province.progress}% tercapai</p></div>)}</div><div className="progress-summary"><div><span className="summary-ring">76<span>%</span></span></div><div><strong>Progress nasional</strong><p>48 dari 64 lokasi sudah dimonitor</p><span className="positive"><ArrowUpRight size={14} /> 8,4% dibanding periode lalu</span></div></div></div>
    </section>
    <section className="dashboard-grid lower-grid"><div className="panel activity-panel"><PanelHeading eyebrow="Jejak aktivitas" title="Aktivitas terbaru" action="Lihat semua" /><div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.name}><div className={`avatar avatar-${item.tone}`}>{item.initials}</div><div className="activity-copy"><p><strong>{item.name}</strong> {item.action}</p><small>{item.area} <span>·</span> {item.time}</small></div><ChevronRight size={16} className="activity-arrow" /></div>)}</div></div><div className="panel quick-panel"><PanelHeading eyebrow="Aksi cepat" title="Mulai dari sini" /><div className="quick-list"><Link href="/monev" className="quick-card"><span className="quick-icon lime-bg"><ClipboardList size={19} /></span><span><strong>Mulai monev baru</strong><small>Catat hasil pemantauan lapangan</small></span><ArrowUpRight size={16} /></Link><Link href="/dokumentasi" className="quick-card"><span className="quick-icon pink-bg"><Images size={19} /></span><span><strong>Unggah dokumentasi</strong><small>Tambahkan bukti publikasi terbaru</small></span><ArrowUpRight size={16} /></Link><Link href="/lokasi" className="quick-card"><span className="quick-icon blue-bg"><MapPin size={19} /></span><span><strong>Kelola lokasi</strong><small>Atur titik pemantauan aktif</small></span><ArrowUpRight size={16} /></Link></div></div></section>
  </>;
}

function InsightPage() {
  const [question, setQuestion] = useState("Apa pola utama dari laporan monev terbaru?");
  const insight = trpc.insights.generate.useMutation();
  const result = insight.data as { answer?: string; scope?: { period?: string; filters?: string[] }; facts?: Array<{ statement: string; evidence_ids: string[] }>; interpretation?: string[]; recommended_actions?: Array<{ action: string; reason: string; owner_role: string }>; data_quality_flags?: string[]; confidence?: string; missing_information?: string[] } | undefined;
  return <><PageIntro eyebrow="Insight berbasis data" title={<>Baca sinyal <em>lapangan.</em></>} description="Ajukan pertanyaan dalam bahasa Indonesia. Jawaban hanya menggunakan laporan yang tersedia di ruang kerja Anda." action={<span className="ai-contract-badge"><Sparkles size={15} /> JSON terstruktur · GPT-5 mini</span>} /><section className="insight-workspace"><form className="panel insight-form" onSubmit={(event) => { event.preventDefault(); insight.mutate({ question }); }}><label htmlFor="insight-question">Pertanyaan analitik</label><textarea id="insight-question" value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} maxLength={600} /><div className="insight-form-footer"><small>Contoh: bandingkan kelengkapan laporan per provinsi.</small><button className="primary-button" type="submit" disabled={insight.isPending || question.trim().length < 3}><Sparkles size={16} /> {insight.isPending ? "Menganalisis…" : "Buat insight"}</button></div></form>{insight.error && <div className="panel insight-error">Insight belum dapat dibuat: {insight.error.message}</div>}{result && <div className="insight-results"><div className="panel insight-answer"><div className="insight-result-head"><span className="eyebrow">Jawaban</span><span className={`confidence confidence-${result.confidence}`}>{result.confidence ?? "unknown"} confidence</span></div><h2>{result.answer}</h2><small>Scope: {result.scope?.period ?? "Tidak ditentukan"}</small></div><div className="insight-columns"><div className="panel insight-list"><PanelHeading eyebrow="Fakta teramati" title="Bukti laporan" />{(result.facts ?? []).map((fact) => <div className="insight-item" key={fact.statement}><CheckCircle2 size={16} /><div><p>{fact.statement}</p><small>{fact.evidence_ids.join(", ") || "Tidak ada ID bukti"}</small></div></div>)}</div><div className="panel insight-list"><PanelHeading eyebrow="Tindak lanjut" title="Rekomendasi" />{(result.recommended_actions ?? []).map((action) => <div className="insight-item" key={action.action}><ArrowUpRight size={16} /><div><p>{action.action}</p><small>{action.owner_role} · {action.reason}</small></div></div>)}</div></div>{(result.data_quality_flags?.length || result.missing_information?.length) ? <div className="panel insight-flags"><strong>Catatan kualitas data</strong><p>{[...(result.data_quality_flags ?? []), ...(result.missing_information ?? [])].join(" ")}</p></div> : null}</div>}</section></>;
}

function MonevPage() {
  const [filter, setFilter] = useState("Semua status");
  const { data: reportData } = trpc.reports.list.useQuery();
  const rows = (reportData ?? []).map(({ report, location }) => ({
    location: location?.name ?? "Lokasi belum diberi nama",
    province: location?.province ?? "-",
    officer: report.officerName,
    date: report.updatedAt ? new Date(report.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-",
    status: report.status === "completed" ? "Selesai" : report.status === "review" ? "Review" : "Dalam proses",
    tone: report.status === "completed" ? "success" : report.status === "review" ? "review" : "process",
  }));
  const filtered = filter === "Semua status" ? rows : rows.filter((row) => row.status === filter);
  return <><PageIntro eyebrow="Monev lapangan" title={<>Monitor dari <em>lapangan.</em></>} description="Kelola penugasan, pantau kelengkapan laporan, dan review hasil monev dalam satu ruang kerja." action={<button className="primary-button"><ClipboardList size={16} /> Mulai monev baru</button>} /><div className="toolbar"><div className="search-field"><Search size={16} /><input placeholder="Cari lokasi atau petugas..." /></div><div className="filter-group">{["Semua status", "Selesai", "Review", "Dalam proses"].map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="panel table-panel"><div className="table-heading"><div><p className="eyebrow">{rows.length} total penugasan</p><h3>Daftar monev</h3></div><button className="outline-button small">Export CSV <ArrowDownRight size={15} /></button></div><div className="data-table"><div className="table-row table-header"><span>Lokasi</span><span>Petugas</span><span>Tanggal</span><span>Status</span><span /></div>{filtered.length === 0 ? <div className="empty-table">Belum ada laporan monev tersimpan.</div> : filtered.map((row) => <div className="table-row" key={`${row.location}-${row.date}`}><div><strong>{row.location}</strong><small>{row.province}</small></div><div className="person-cell"><div className="avatar avatar-muted">{row.officer.split(" ").map((name) => name[0]).join("")}</div><span>{row.officer}</span></div><span className="muted-cell">{row.date}</span><span><StatusPill tone={row.tone}>{row.status}</StatusPill></span><button className="row-more" aria-label="Buka detail"><MoreHorizontal size={17} /></button></div>)}</div></div></>;
}

function DocumentationPage() {
  const { data: documentationData, refetch } = trpc.documentation.list.useQuery();
  const uploadMutation = trpc.documentation.upload.useMutation({ onSuccess: () => refetch() });
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      await uploadMutation.mutateAsync({ title: file.name.replace(/\.[^/.]+$/, ""), filename: file.name, mimeType: file.type || "application/octet-stream", base64 });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  const fallbackTitles = ["Kelas tata boga PKK", "Pelatihan digital PKW", "Pameran karya warga", "Workshop wirausaha", "Kunjungan lapangan", "Forum kolaborasi"];
  const cards = documentationData?.length ? documentationData.map(({ item, location }, index) => ({ title: item.title, area: location?.name ?? "Lokasi belum ditentukan", url: item.storageUrl, mimeType: item.mimeType, index })) : fallbackTitles.map((title, index) => ({ title, area: "Belum ada data tersimpan", url: "", mimeType: "", index }));
  return <><input ref={fileInput} type="file" accept="image/*,.pdf" hidden onChange={handleUpload} /><PageIntro eyebrow="Dokumentasi publikasi" title={<>Bukti yang <em>berbicara.</em></>} description="Koleksi dokumentasi kegiatan dan publikasi yang telah diverifikasi oleh tim lapangan." action={<button className="primary-button" onClick={() => fileInput.current?.click()} disabled={uploading}><Images size={16} /> {uploading ? "Mengunggah…" : "Tambah dokumentasi"}</button>} /><div className="doc-metrics"><div><span className="metric-icon pink-bg"><Images size={17} /></span><div><strong>{documentationData?.length ?? "—"}</strong><small>Total dokumentasi</small></div></div><div><span className="metric-icon lime-bg"><Check size={17} /></span><div><strong>{documentationData ? documentationData.filter(({ item }) => item.status === "verified").length : "—"}</strong><small>Terverifikasi</small></div></div><div><span className="metric-icon blue-bg"><Radio size={17} /></span><div><strong>{documentationData ? documentationData.filter(({ item }) => item.status === "review").length : "—"}</strong><small>Menunggu review</small></div></div></div><div className="panel gallery-panel"><div className="table-heading"><div><p className="eyebrow">Terbaru diunggah</p><h3>Galeri dokumentasi</h3></div><span className="storage-note"><Radio size={13} /> Penyimpanan aman</span></div><div className="gallery-grid">{cards.map((card) => <div className={`gallery-card gallery-${(card.index % 6) + 1}`} key={`${card.title}-${card.index}`}><div className="gallery-art">{card.url && card.mimeType.startsWith("image/") ? <img src={card.url} alt={card.title} /> : <><span>{String(card.index + 1).padStart(2, "0")}</span><Images size={28} /></>}</div><div className="gallery-copy"><strong>{card.title}</strong><small>{card.area} <span>·</span> {documentationData?.length ? "tersimpan" : "Siap menerima unggahan"}</small></div></div>)}</div></div></>;
}

function ReviewPage() {
  const { data: reportData } = trpc.reports.list.useQuery();
  const reviewRows = (reportData ?? []).filter(({ report }) => report.status === "review").slice(0, 3);
  const average = reportData?.length ? Math.round(reportData.reduce((sum, item) => sum + item.report.completeness, 0) / reportData.length) : 0;
  return <><PageIntro eyebrow="Kontrol kualitas" title={<>Review hasil <em>monev.</em></>} description="Pastikan setiap laporan lapangan telah lengkap, terverifikasi, dan siap menjadi insight." action={<button className="outline-button"><FileText size={16} /> Panduan review</button>} /><div className="review-banner"><div className="review-banner-icon"><ShieldCheck size={22} /></div><div><strong>{reportData ? reviewRows.length : "—"} laporan menunggu review</strong><p>Prioritaskan laporan yang masuk lebih dari 24 jam lalu.</p></div><button className="light-button">Mulai review <ArrowUpRight size={16} /></button></div><div className="review-grid"><div className="panel table-panel"><div className="table-heading"><div><p className="eyebrow">Antrian Anda</p><h3>Perlu ditinjau</h3></div><span className="count-badge">{reportData ? reviewRows.length : "—"}</span></div><div className="review-list">{reviewRows.length === 0 ? <div className="empty-table">Belum ada laporan yang menunggu review.</div> : reviewRows.map(({ report, location }, index) => <div className="review-row" key={report.id}><div className={`review-marker marker-${index}`} /><div><strong>{location?.name ?? "Lokasi belum diberi nama"}</strong><small>{report.officerName} <span>·</span> {report.updatedAt.toLocaleDateString("id-ID")}</small></div><StatusPill tone="review">Review</StatusPill><ChevronRight size={16} /></div>)}</div></div><div className="panel score-panel"><PanelHeading eyebrow="Kualitas data" title="Skor kelengkapan" action="Detail" /><div className="score-display"><span>{reportData ? average : "—"}</span><small>/ 100</small></div><p>Rata-rata kelengkapan laporan nasional.</p><div className="score-bar"><span style={{ width: `${average}%` }} /></div><div className="score-foot"><span><i className="dot lime-dot" /> Data tersimpan</span><span>Live dari laporan</span></div></div></div></>;
}

function LocationsPage() {
  const { data: locationData, refetch } = trpc.locations.list.useQuery();
  const createLocation = trpc.locations.create.useMutation({ onSuccess: () => { setShowForm(false); refetch(); } });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", province: "", address: "", latitude: "-7.7956", longitude: "110.3695" });
  const activeLocations = locationData ?? [];
  function handleMapReady(map: google.maps.Map) {
    if (!window.google?.maps?.marker) return;
    activeLocations.forEach((location) => {
      const marker = new window.google.maps.marker.AdvancedMarkerElement({ map, position: { lat: location.latitude, lng: location.longitude }, title: location.name });
      marker.addListener("click", () => map.panTo({ lat: location.latitude, lng: location.longitude }));
    });
  }
  const center = activeLocations[0] ? { lat: activeLocations[0].latitude, lng: activeLocations[0].longitude } : { lat: -7.7956, lng: 110.3695 };
  return <><PageIntro eyebrow="Titik pemantauan" title={<>Baca peta <em>kegiatan.</em></>} description="Atur lokasi monev, penanggung jawab, dan status pemantauan di setiap wilayah." action={<button className="primary-button" onClick={() => setShowForm((value) => !value)}><MapPin size={16} /> {showForm ? "Tutup form" : "Tambah lokasi"}</button>} />{showForm && <form className="panel location-form" onSubmit={(event) => { event.preventDefault(); createLocation.mutate({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) }); }}><div><label>Nama lokasi<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Kabupaten Sleman" /></label><label>Provinsi<input required value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value })} placeholder="DI Yogyakarta" /></label></div><div><label>Latitude<input required type="number" step="any" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} /></label><label>Longitude<input required type="number" step="any" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} /></label></div><button className="primary-button" type="submit" disabled={createLocation.isPending}>{createLocation.isPending ? "Menyimpan…" : "Simpan lokasi"}</button></form>}<div className="location-layout"><div className="location-map panel"><MapView className="live-map" initialCenter={center} initialZoom={activeLocations.length ? 8 : 11} onMapReady={handleMapReady} /><div className="map-live-badge"><Radio size={13} /> {activeLocations.length} lokasi aktif</div></div><div className="panel location-list"><PanelHeading eyebrow="Lokasi aktif" title="Semua wilayah" action="Kelola" />{activeLocations.length === 0 ? <div className="empty-location"><MapPin size={18} /><p>Belum ada lokasi tersimpan.</p><small>Tambahkan koordinat lokasi dari ruang admin.</small></div> : activeLocations.map((location, index) => <div className="location-row" key={location.id}><div className={`location-pin pin-${index % 5}`}><MapPin size={14} /></div><div><strong>{location.name}</strong><small>{location.province} <span>·</span> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</small></div><ChevronRight size={16} /></div>)}</div></div></>;
}

function StaffPage() {
  return <><PageIntro eyebrow="Tim lapangan" title={<>Orang di balik <em>data.</em></>} description="Kelola petugas, peran, dan cakupan wilayah yang menjadi tanggung jawab mereka." action={<button className="primary-button"><Users size={16} /> Tambah petugas</button>} /><div className="staff-grid">{[{ name: "Ari Rahman", role: "Petugas lapangan", area: "DI Yogyakarta", initials: "AR", tone: "lime" }, { name: "Nisa Sari", role: "Petugas lapangan", area: "Jawa Barat", initials: "NS", tone: "pink" }, { name: "Dimas Lestari", role: "Petugas lapangan", area: "Sulawesi Selatan", initials: "DL", tone: "blue" }, { name: "Siti Aminah", role: "Reviewer", area: "Jawa Tengah", initials: "SA", tone: "amber" }].map((person) => <div className="panel staff-card" key={person.name}><div className={`avatar avatar-${person.tone} large`}>{person.initials}</div><div><strong>{person.name}</strong><small>{person.role}</small></div><span className="staff-online"><i /> Aktif</span><div className="staff-divider" /><p><MapPin size={14} /> {person.area}</p><button className="outline-button small">Lihat profil <ArrowUpRight size={14} /></button></div>)}</div></>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: ReactNode; description: string; action?: ReactNode }) {
  return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="intro-description">{description}</p></div>{action && <div className="intro-action">{action}</div>}</div>;
}

function StatCard({ label, value, note, tone, icon, trend }: { label: string; value: string; note: string; tone: string; icon: ReactNode; trend: string }) {
  return <div className={`stat-card stat-${tone}`}><div className="stat-top"><span className="stat-icon">{icon}</span><span className="stat-trend"><ArrowUpRight size={13} /> {trend}</span></div><p>{label}</p><strong>{value}</strong><small>{note}</small></div>;
}

function PanelHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: string }) {
  return <div className="panel-heading"><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div>{action && <button className="panel-action">{action} <ChevronRight size={14} /></button>}</div>;
}

function StatusPill({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`status-pill ${tone}`}><i />{children}</span>;
}

export default App;
