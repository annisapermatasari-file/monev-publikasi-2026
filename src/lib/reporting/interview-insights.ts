import { db } from "@/db";
import {
  monevSessions,
  locations,
  programs,
  skills,
  interviews,
  interviewAnswers,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type InterviewRole =
  | "PESERTA"
  | "ALUMNI"
  | "MITRA"
  | "INSTRUKTUR"
  | "PENGELOLA"
  | "LAINNYA";

export const ROLE_LABEL: Record<InterviewRole, string> = {
  PESERTA: "Peserta",
  ALUMNI: "Alumni/Lulusan",
  MITRA: "Mitra Industri/Usaha",
  INSTRUKTUR: "Instruktur",
  PENGELOLA: "Pengelola LKP",
  LAINNYA: "Lainnya",
};

export type SessionInterviewSummary = {
  sessionId: string;
  locationName: string;
  provinsi: string;
  skillName: string | null;
  programCode: "PKK" | "PKW";
  programName: string;
  status: string;
  interviewCount: number;
  quotableCount: number;
};

export type InterviewAnswerRow = {
  id: string;
  pertanyaan: string;
  jawaban: string | null;
  bolehDikutip: boolean;
  catatan: string | null;
  urutan: number;
};

export type InterviewRow = {
  id: string;
  narasumber: string;
  peran: InterviewRole;
  answers: InterviewAnswerRow[];
};

export type SessionInterviewDetail = {
  sessionId: string;
  locationName: string;
  provinsi: string;
  kabKota: string;
  skillName: string | null;
  programCode: "PKK" | "PKW";
  programName: string;
  status: string;
  interviews: InterviewRow[];
};

/**
 * Daftar seluruh sesi yang sudah memiliki minimal 1 narasumber wawancara,
 * dipakai pada halaman ringkasan Super Admin. Tidak dibatasi hanya sesi
 * Disetujui karena hasil wawancara berguna untuk disiapkan jadi draf
 * artikel/konten sejak tahap awal, sebelum sesi selesai direview.
 */
export async function listSessionsWithInterviews(
  periode = "2026"
): Promise<SessionInterviewSummary[]> {
  const sessionRows = await db
    .select({
      sessionId: monevSessions.id,
      locationName: locations.namaLembaga,
      provinsi: locations.provinsi,
      skillName: skills.name,
      programCode: programs.code,
      programName: programs.name,
      status: monevSessions.status,
    })
    .from(monevSessions)
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .leftJoin(skills, eq(locations.skillId, skills.id))
    .where(eq(monevSessions.periode, periode));

  const countRows = await db
    .select({
      sessionId: interviews.sessionId,
      total: sql<number>`count(distinct ${interviews.id})`.mapWith(Number),
    })
    .from(interviews)
    .groupBy(interviews.sessionId);
  const countMap = new Map(countRows.map((r) => [r.sessionId, r.total]));

  const quotableRows = await db
    .select({
      sessionId: interviews.sessionId,
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(interviewAnswers)
    .innerJoin(interviews, eq(interviewAnswers.interviewId, interviews.id))
    .where(eq(interviewAnswers.bolehDikutip, true))
    .groupBy(interviews.sessionId);
  const quotableMap = new Map(quotableRows.map((r) => [r.sessionId, r.total]));

  return sessionRows
    .filter((row) => (countMap.get(row.sessionId) ?? 0) > 0)
    .map((row) => ({
      ...row,
      interviewCount: countMap.get(row.sessionId) ?? 0,
      quotableCount: quotableMap.get(row.sessionId) ?? 0,
    }))
    .sort((a, b) => b.quotableCount - a.quotableCount || b.interviewCount - a.interviewCount);
}

export async function getSessionInterviewDetail(
  sessionId: string
): Promise<SessionInterviewDetail | null> {
  const [sessionRow] = await db
    .select({
      sessionId: monevSessions.id,
      locationName: locations.namaLembaga,
      provinsi: locations.provinsi,
      kabKota: locations.kabKota,
      skillName: skills.name,
      programCode: programs.code,
      programName: programs.name,
      status: monevSessions.status,
    })
    .from(monevSessions)
    .innerJoin(locations, eq(monevSessions.locationId, locations.id))
    .innerJoin(programs, eq(monevSessions.programId, programs.id))
    .leftJoin(skills, eq(locations.skillId, skills.id))
    .where(eq(monevSessions.id, sessionId))
    .limit(1);
  if (!sessionRow) return null;

  const interviewRows = await db
    .select()
    .from(interviews)
    .where(eq(interviews.sessionId, sessionId));

  const interviewsWithAnswers: InterviewRow[] = await Promise.all(
    interviewRows.map(async (iv) => ({
      id: iv.id,
      narasumber: iv.narasumber,
      peran: iv.peran,
      answers: await db
        .select()
        .from(interviewAnswers)
        .where(eq(interviewAnswers.interviewId, iv.id))
        .orderBy(interviewAnswers.urutan),
    }))
  );

  return { ...sessionRow, interviews: interviewsWithAnswers };
}

// ============================================================
// REKOMENDASI KONTEN (rule-based, dari jawaban wawancara)
// ============================================================

export type QuoteHighlight = {
  narasumber: string;
  peran: InterviewRole;
  pertanyaan: string;
  jawaban: string;
};

export type ArticleIdea = {
  judul: string;
  lead: string;
  outline: string[];
};

export type SocialIdea = {
  platform: string;
  format: string;
  isi: string;
};

export type ContentRecommendations = {
  highlights: QuoteHighlight[];
  articleIdeas: ArticleIdea[];
  socialIdeas: SocialIdea[];
  hashtags: string[];
};

const CHALLENGE_KEYWORDS = ["tantangan", "kendala", "kesulitan", "hambatan"];
const IMPACT_KEYWORDS = ["dampak", "manfaat", "berubah", "setelah", "perubahan", "pengaruh"];
const BEFORE_KEYWORDS = ["sebelum", "awal", "mula", "alasan"];

function flattenQuotable(detail: SessionInterviewDetail): QuoteHighlight[] {
  const out: QuoteHighlight[] = [];
  for (const iv of detail.interviews) {
    for (const a of iv.answers) {
      if (!a.bolehDikutip) continue;
      const text = (a.jawaban ?? "").trim();
      if (text.length < 15) continue;
      out.push({ narasumber: iv.narasumber, peran: iv.peran, pertanyaan: a.pertanyaan, jawaban: text });
    }
  }
  return out;
}

function findAnswerByKeywords(iv: InterviewRow, keywords: string[]): InterviewAnswerRow | null {
  for (const a of iv.answers) {
    const text = (a.jawaban ?? "").trim();
    if (text.length < 10) continue;
    const q = a.pertanyaan.toLowerCase();
    if (keywords.some((k) => q.includes(k))) return a;
  }
  return null;
}

function bestAnswer(iv: InterviewRow): InterviewAnswerRow | null {
  let best: InterviewAnswerRow | null = null;
  for (const a of iv.answers) {
    const text = (a.jawaban ?? "").trim();
    if (text.length < 15) continue;
    if (!best || text.length > (best.jawaban ?? "").length) best = a;
  }
  return best;
}

function truncate(text: string, max = 140) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export function buildContentRecommendations(
  detail: SessionInterviewDetail
): ContentRecommendations {
  const highlights = flattenQuotable(detail)
    .sort((a, b) => b.jawaban.length - a.jawaban.length)
    .slice(0, 6);

  const skillLabel = detail.skillName ?? detail.programName;
  const lkp = detail.locationName;

  // --- Ide artikel ---
  const articleIdeas: ArticleIdea[] = [];

  const heroCandidate =
    detail.interviews.find((iv) => iv.peran === "ALUMNI") ??
    detail.interviews.find((iv) => iv.peran === "PESERTA");
  if (heroCandidate) {
    const before = findAnswerByKeywords(heroCandidate, BEFORE_KEYWORDS);
    const challenge = findAnswerByKeywords(heroCandidate, CHALLENGE_KEYWORDS);
    const impact = findAnswerByKeywords(heroCandidate, IMPACT_KEYWORDS) ?? bestAnswer(heroCandidate);
    const roleLabel = ROLE_LABEL[heroCandidate.peran];
    articleIdeas.push({
      judul: `Dari ${skillLabel} ke Perubahan Nyata: Kisah ${heroCandidate.narasumber} di ${lkp}`,
      lead: impact
        ? `"${truncate(impact.jawaban ?? "", 180)}" — ${heroCandidate.narasumber}, ${roleLabel.toLowerCase()} ${skillLabel} di ${lkp}.`
        : `Kisah perjalanan ${heroCandidate.narasumber} mengikuti pelatihan ${skillLabel} di ${lkp}.`,
      outline: [
        before
          ? `Kondisi awal: ${truncate(before.jawaban ?? "", 160)}`
          : `Kondisi awal sebelum mengikuti program ${detail.programCode} di ${lkp}.`,
        challenge
          ? `Tantangan yang dihadapi: ${truncate(challenge.jawaban ?? "", 160)}`
          : `Proses belajar dan adaptasi selama mengikuti pelatihan ${skillLabel}.`,
        impact
          ? `Hasil dan dampak: ${truncate(impact.jawaban ?? "", 160)}`
          : `Hasil yang dirasakan setelah mengikuti program.`,
        `Penutup: ajakan bagi calon peserta lain untuk mengikuti program ${detail.programCode} di ${lkp}.`,
      ],
    });
  }

  const mitraOrPengelola =
    detail.interviews.find((iv) => iv.peran === "MITRA") ??
    detail.interviews.find((iv) => iv.peran === "PENGELOLA");
  if (mitraOrPengelola) {
    const quote = bestAnswer(mitraOrPengelola);
    const roleLabel = ROLE_LABEL[mitraOrPengelola.peran];
    articleIdeas.push({
      judul: `${lkp} dan ${mitraOrPengelola.narasumber}: Sinergi ${roleLabel} Memperkuat Program ${detail.programCode}`,
      lead: quote
        ? `Menurut ${mitraOrPengelola.narasumber}, "${truncate(quote.jawaban ?? "", 180)}"`
        : `Perspektif ${roleLabel.toLowerCase()} tentang pelaksanaan program ${detail.programCode} di ${lkp}.`,
      outline: [
        `Peran ${mitraOrPengelola.narasumber} sebagai ${roleLabel.toLowerCase()} dalam program.`,
        `Kutipan dan pandangan terhadap kualitas pelaksanaan pelatihan ${skillLabel}.`,
        `Harapan dan rekomendasi untuk keberlanjutan kerja sama/program.`,
      ],
    });
  }

  if (articleIdeas.length === 0 && highlights.length > 0) {
    const h = highlights[0];
    articleIdeas.push({
      judul: `Cerita dari ${lkp}: Program ${detail.programCode} Lewat Sudut Pandang ${ROLE_LABEL[h.peran]}`,
      lead: `"${truncate(h.jawaban, 180)}" — ${h.narasumber}.`,
      outline: [
        `Perkenalan narasumber dan konteks keterlibatannya di ${lkp}.`,
        `Kutipan-kutipan kunci dari hasil wawancara.`,
        `Penutup dengan pesan atau rekomendasi untuk pembaca.`,
      ],
    });
  }

  // --- Ide konten media sosial ---
  const socialIdeas: SocialIdea[] = [];

  if (highlights.length > 0) {
    const quoteList = highlights
      .slice(0, 3)
      .map((h) => `"${truncate(h.jawaban, 110)}" — ${h.narasumber} (${ROLE_LABEL[h.peran]})`)
      .join("  /  ");
    socialIdeas.push({
      platform: "Instagram",
      format: "Carousel \"Kata Mereka\"",
      isi: `Slide 1 (cover): "Kata Mereka Tentang ${skillLabel} di ${lkp}". Slide berikutnya, satu kutipan per slide: ${quoteList}. Slide penutup: ajakan follow & info pendaftaran program ${detail.programCode}.`,
    });
  }

  if (heroCandidate) {
    const impact = findAnswerByKeywords(heroCandidate, IMPACT_KEYWORDS) ?? bestAnswer(heroCandidate);
    socialIdeas.push({
      platform: "Instagram Reels / TikTok",
      format: "Video cerita singkat (30–45 detik)",
      isi: `Hook: tampilkan ${heroCandidate.narasumber} di depan kegiatan ${skillLabel} di ${lkp}. Narasi: perjalanan sebelum-sesudah mengikuti program${
        impact ? `, ditutup dengan kutipan "${truncate(impact.jawaban ?? "", 120)}"` : ""
      }. CTA: ajakan daftar program ${detail.programCode} melalui kanal resmi ${lkp}.`,
    });
  }

  if (mitraOrPengelola) {
    const quote = bestAnswer(mitraOrPengelola);
    socialIdeas.push({
      platform: "Instagram / Facebook",
      format: "Single post testimoni",
      isi: `Foto ${mitraOrPengelola.narasumber} dengan kutipan dukungan sebagai ${ROLE_LABEL[mitraOrPengelola.peran].toLowerCase()}${
        quote ? `: "${truncate(quote.jawaban ?? "", 140)}"` : ""
      }. Caption menekankan kolaborasi ${lkp} dengan mitra/pengelola dalam program ${detail.programCode}.`,
    });
  }

  if (socialIdeas.length === 0) {
    socialIdeas.push({
      platform: "Instagram",
      format: "Single post profil program",
      isi: `Perkenalkan program ${detail.programCode} ${skillLabel} di ${lkp} secara umum, karena belum ada kutipan narasumber yang ditandai "boleh dikutip" untuk dijadikan testimoni langsung.`,
    });
  }

  const hashtags = Array.from(
    new Set([
      "#KursuskitaID",
      `#${detail.programCode}`,
      `#${skillLabel.replace(/[^a-zA-Z0-9]/g, "")}`,
      `#${lkp.replace(/[^a-zA-Z0-9]/g, "")}`,
      "#VokasiHebatBermartabat",
      "#DirektoratKursusdanPelatihan",
    ])
  );

  return { highlights, articleIdeas, socialIdeas, hashtags };
}
