import { useEffect } from "react";
import { ArrowUpRight, CheckCircle2, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";

const SITE_URL = "https://3000-ia8erkr4ytn53wncgqktx-cddd872b.sg2.manus.computer";

function usePageMeta(title: string, description: string, path: string, type = "website") {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, attrs: Record<string, string>) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
      }
      Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
    };
    const canonical = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (canonical) canonical.href = `${SITE_URL}${path}`;
    setMeta("meta[name='description']", { name: "description", content: description });
    setMeta("meta[property='og:title']", { property: "og:title", content: title });
    setMeta("meta[property='og:description']", { property: "og:description", content: description });
    setMeta("meta[property='og:url']", { property: "og:url", content: `${SITE_URL}${path}` });
    setMeta("meta[property='og:type']", { property: "og:type", content: type });
    setMeta("meta[name='twitter:card']", { name: "twitter:card", content: "summary" });
    setMeta("meta[name='twitter:title']", { name: "twitter:title", content: title });
    setMeta("meta[name='twitter:description']", { name: "twitter:description", content: description });
    let schema = document.head.querySelector("script[data-page-schema]") as HTMLScriptElement | null;
    if (!schema) {
      schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.dataset.pageSchema = "true";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: `${SITE_URL}${path}`, isPartOf: { "@type": "WebSite", name: "Monev Publikasi 2026", url: SITE_URL } });
    return () => schema?.remove();
  }, [title, description, path, type]);
}

function PublicHeader() {
  return <header className="public-header"><Link href="/" className="public-brand"><span className="brand-mark"><span /></span><span><strong>MONEV</strong><small>Publikasi 2026</small></span></Link><nav aria-label="Navigasi publik"><Link href="/metodologi">Metodologi</Link><Link href="/faq">FAQ</Link><Link href="/login" className="public-login">Masuk <ArrowUpRight size={15} /></Link></nav></header>;
}

function PublicFooter() {
  return <footer className="public-footer"><div><strong>MONEV Publikasi 2026</strong><p>Platform pemantauan dan evaluasi publikasi kegiatan PKK dan PKW.</p></div><div className="public-footer-links"><Link href="/metodologi">Metodologi</Link><Link href="/faq">FAQ</Link><Link href="/login">Masuk</Link></div><small>© 2026 Direktorat Kursus dan Pelatihan</small></footer>;
}

export function PublicHome() {
  const title = "Monev Publikasi 2026 | Pemantauan Publikasi PKK & PKW";
  const description = "Monev Publikasi 2026 membantu tim PKK dan PKW memantau lokasi, laporan lapangan, dokumentasi, dan kualitas publikasi secara terukur.";
  usePageMeta(title, description, "/");
  return <div className="public-site"><PublicHeader /><main><section className="public-hero"><div className="public-hero-copy"><p className="eyebrow lime"><Sparkles size={14} /> National communication monitor</p><h1>Publikasi yang<br /><em>terpantau.</em></h1><p className="public-lede">Monev Publikasi 2026 menghubungkan pemantauan lapangan, dokumentasi, dan review kualitas dalam satu ruang kerja yang jelas.</p><div className="public-actions"><Link href="/login" className="primary-button">Masuk ke dashboard <ArrowUpRight size={17} /></Link><Link href="/metodologi" className="outline-button">Pelajari metodologi</Link></div><div className="public-proof"><span><CheckCircle2 size={15} /> Data terstruktur</span><span><ShieldCheck size={15} /> Akses berbasis akun</span></div></div><div className="public-hero-art" aria-label="Ilustrasi jaringan pemantauan"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-orbit orbit-three" /><div className="hero-core"><span>2026</span><small>LIVE MONITOR</small></div><span className="hero-node node-one" /><span className="hero-node node-two" /><span className="hero-node node-three" /></div></section><section className="public-trust"><span>Direktorat Kursus &amp; Pelatihan</span><i /><span>PKK &amp; PKW</span><i /><span>Pemantauan nasional</span><i /><span>Periode aktif 2026</span></section><section className="public-section public-grid-section"><div><p className="eyebrow">Satu sumber kebenaran</p><h2>Dari titik lapangan<br />menjadi <em>insight.</em></h2></div><div className="public-section-copy"><p>Setiap lokasi, laporan, dokumentasi, dan review memiliki jejak yang dapat ditelusuri. Tim bekerja dengan definisi status yang sama dan informasi yang diperbarui di satu tempat.</p><Link href="/metodologi" className="inline-link">Lihat cara kerja <ArrowUpRight size={15} /></Link></div></section><section className="public-features"><article><span className="feature-number">01</span><FileText size={21} /><h3>Monitor lapangan</h3><p>Catat penugasan, petugas, lokasi, status, dan kelengkapan laporan secara konsisten.</p></article><article><span className="feature-number">02</span><Sparkles size={21} /><h3>Dokumentasi terverifikasi</h3><p>Simpan bukti publikasi dengan metadata yang rapi dan alur review yang dapat ditelusuri.</p></article><article><span className="feature-number">03</span><ShieldCheck size={21} /><h3>Review berbasis data</h3><p>Prioritaskan laporan yang perlu ditinjau dan bedakan fakta terukur dari interpretasi.</p></article></section><section className="public-cta"><div><p className="eyebrow lime">Ruang kerja resmi</p><h2>Mulai dari data<br /><em>yang terlihat.</em></h2></div><Link href="/login" className="light-button">Masuk ke Monev <ArrowUpRight size={17} /></Link></section></main><PublicFooter /></div>;
}

export function MethodologyPage() {
  const title = "Metodologi Monev Publikasi 2026";
  const description = "Pelajari definisi lokasi, laporan, dokumentasi, status review, dan kelengkapan data pada Monev Publikasi 2026.";
  usePageMeta(title, description, "/metodologi");
  return <div className="public-site"><PublicHeader /><main className="public-inner"><div className="public-page-heading"><p className="eyebrow">Dasar pengukuran</p><h1>Metodologi <em>monev.</em></h1><p>Definisi yang sama membantu seluruh tim membaca capaian publikasi dengan cara yang konsisten.</p></div><div className="methodology-list"><article><span>01</span><div><h2>Lokasi pemantauan</h2><p>Lokasi adalah titik kegiatan yang memiliki nama, provinsi, alamat, dan koordinat. Satu lokasi aktif dihitung satu kali dalam daftar pemantauan.</p></div></article><article><span>02</span><div><h2>Laporan monev</h2><p>Laporan dibuat oleh petugas yang ditugaskan ke lokasi tertentu. Statusnya dapat berupa dalam proses, review, atau selesai.</p></div></article><article><span>03</span><div><h2>Dokumentasi publikasi</h2><p>Dokumentasi adalah bukti visual atau berkas publikasi yang disimpan bersama judul, lokasi, tipe berkas, dan status verifikasi.</p></div></article><article><span>04</span><div><h2>Kelengkapan data</h2><p>Skor kelengkapan menunjukkan proporsi bidang laporan yang terisi dan dapat diperiksa. Skor bukan pengganti penilaian substantif oleh reviewer.</p></div></article></div><div className="public-note"><ShieldCheck size={18} /><p><strong>Catatan tata kelola.</strong> Data operasional hanya tersedia bagi akun yang berwenang. Angka yang dipublikasikan untuk umum harus melewati persetujuan pemilik program.</p></div></main><PublicFooter /></div>;
}

const faqs = [
  ["Apa itu Monev Publikasi 2026?", "Monev Publikasi 2026 adalah ruang kerja untuk memantau kegiatan lapangan, menyimpan dokumentasi publikasi, dan meninjau kualitas laporan PKK dan PKW."],
  ["Siapa yang menggunakan Monev Publikasi?", "Administrator, petugas lapangan, reviewer, dan pengguna dengan akses lihat dapat menggunakan sistem sesuai peran dan kewenangannya."],
  ["Bagaimana data diverifikasi?", "Petugas mengirim laporan dan dokumentasi. Reviewer memeriksa kelengkapan serta kesesuaian bukti sebelum laporan ditandai selesai atau terverifikasi."],
  ["Apakah data operasional dapat dilihat publik?", "Tidak secara default. Dashboard dan data operasional memerlukan autentikasi. Ringkasan publik hanya dapat dibagikan setelah disetujui oleh pemilik program."],
];

export function FaqPage() {
  const title = "FAQ Monev Publikasi 2026";
  const description = "Jawaban singkat tentang tujuan, pengguna, verifikasi, dan akses data Monev Publikasi 2026.";
  usePageMeta(title, description, "/faq");
  useEffect(() => {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.dataset.faqSchema = "true";
    schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) });
    document.head.appendChild(schema);
    return () => schema.remove();
  }, []);
  return <div className="public-site"><PublicHeader /><main className="public-inner"><div className="public-page-heading"><p className="eyebrow">Jawaban cepat</p><h1>Pertanyaan yang<br /><em>sering muncul.</em></h1><p>Ringkasan ini menjelaskan tujuan sistem dan batasan akses data secara langsung.</p></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></main><PublicFooter /></div>;
}
