"use client";

import { motion, useReducedMotion } from "motion/react";
import { MapPin, ShieldCheck, BarChart3, Camera, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Kepatuhan & Keterpenuhan",
    desc: "Checklist indikator PKK dan PKW terverifikasi otomatis, bukan sekadar centang.",
  },
  {
    icon: Camera,
    title: "Bukti Lapangan via Link",
    desc: "Petugas mencatat contoh foto, video, dan hasil wawancara — cukup tautan penyimpanan (Drive/YouTube).",
  },
  {
    icon: BarChart3,
    title: "Dashboard Real-Time",
    desc: "Skor narasi, visual, dan kinerja publikasi terhitung otomatis dari data lapangan.",
  },
];

const STATS = [
  { value: "10", label: "Lokasi Monev" },
  { value: "5", label: "Provinsi" },
  { value: "2", label: "Program · PKK & PKW" },
];

const COLLABORATION_IMAGE =
  "https://kursus.kemendikdasmen.go.id/storage/artikel/cover/artikel-cover-1769754814-697c50beca6e8.webp";

export function LandingHero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0.2 }
        : { type: "spring" as const, bounce: 0, duration: 0.5 },
    },
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#17231d] px-8 py-10 sm:px-12 sm:py-14 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-65"
        style={{ backgroundImage: `url(${COLLABORATION_IMAGE})` }}
      />
      {/* Mesh gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(190,242,100,0.22), transparent 60%), radial-gradient(ellipse 70% 60% at 85% 90%, rgba(56,189,248,0.20), transparent 60%), linear-gradient(160deg, rgba(23,35,29,0.82) 0%, rgba(38,57,45,0.72) 55%, rgba(16,26,21,0.86) 100%)",
        }}
      />

      <motion.div initial="hidden" animate="show" variants={container} className="relative z-10 max-w-md">
        <motion.div
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5" />
          NATIONAL COMMUNICATION MONITOR
        </motion.div>

        <motion.h1
          variants={item}
          className="font-semibold text-white"
          style={{
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          Monev Publikasi
          <br />
          PKK &amp; PKW
        </motion.h1>

        <motion.p variants={item} className="mt-4 text-[15px] leading-relaxed text-white/60">
          Satu sistem untuk memantau, menilai, dan mendokumentasikan komunikasi
          kegiatan kursus dan pelatihan PKK/PKW — dari ruang belajar dan praktik
          langsung ke dashboard nasional Direktorat Kursus dan Pelatihan.
        </motion.p>

        <motion.div variants={item} className="mt-10 space-y-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur">
                <f.icon className="h-4.5 w-4.5 text-white/80" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13.5px] font-medium text-white/90">{f.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-white/50">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="relative z-10 mt-10 flex items-center gap-8 border-t border-white/10 pt-6"
      >
        {STATS.map((s) => (
          <motion.div key={s.label} variants={item}>
            <p
              className="font-semibold text-white"
              style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-white/45">
              {s.label === "Lokasi Monev" && <MapPin className="h-3 w-3" />}
              {s.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
