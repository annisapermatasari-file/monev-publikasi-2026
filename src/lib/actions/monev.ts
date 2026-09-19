"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  monevSessions,
  assignments,
  indicators,
  indicatorResponses,
  publicationChannels,
  channelAudits,
  evidenceTypes,
  publicationEvidence,
  storyBriefElements,
  storyBriefResponses,
  interviews,
  interviewAnswers,
  interviewQuestionTemplates,
  mediaAssets,
  recommendations,
  programs,
  locations,
  auditLogs,
} from "@/db/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireSessionAccess(sessionId: string) {
  const session = await auth();
  if (!session) throw new Error("Belum login.");

  const [monevSession] = await db
    .select()
    .from(monevSessions)
    .where(eq(monevSessions.id, sessionId))
    .limit(1);
  if (!monevSession) throw new Error("Sesi Monev tidak ditemukan.");

  if (session.user.role === "PETUGAS") {
    const [assigned] = await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.locationId, monevSession.locationId),
          eq(assignments.userId, session.user.id)
        )
      )
      .limit(1);
    if (!assigned) throw new Error("Anda tidak ditugaskan ke lokasi ini.");
  } else if (session.user.role === "VIEWER") {
    throw new Error("Viewer tidak dapat mengedit Monev.");
  }

  return { session, monevSession };
}

// ------------------------------------------------------------
// Mulai / lanjutkan sesi
// ------------------------------------------------------------
export async function getOrCreateSession(locationId: string, programCode: "PKK" | "PKW") {
  const session = await auth();
  if (!session) throw new Error("Belum login.");

  if (session.user.role === "PETUGAS") {
    const [assigned] = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.locationId, locationId), eq(assignments.userId, session.user.id)))
      .limit(1);
    if (!assigned) throw new Error("Anda tidak ditugaskan ke lokasi ini.");
  }

  const [program] = await db.select().from(programs).where(eq(programs.code, programCode)).limit(1);
  if (!program) throw new Error("Program tidak ditemukan.");

  const [existing] = await db
    .select()
    .from(monevSessions)
    .where(
      and(
        eq(monevSessions.locationId, locationId),
        eq(monevSessions.programId, program.id),
        eq(monevSessions.periode, "2026")
      )
    )
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(monevSessions)
    .values({
      locationId,
      programId: program.id,
      periode: "2026",
      status: "DRAFT",
      currentStep: 1,
    })
    .returning();

  return created.id;
}

export async function goToStep(sessionId: string, step: number) {
  await requireSessionAccess(sessionId);
  redirect(`/monev/${sessionId}/step/${step}`);
}

async function touchSession(sessionId: string, step?: number) {
  await db
    .update(monevSessions)
    .set({
      status: "SEDANG_DIKERJAKAN",
      lastSavedAt: new Date(),
      updatedAt: new Date(),
      ...(step ? { currentStep: step } : {}),
    })
    .where(eq(monevSessions.id, sessionId));
}

// ------------------------------------------------------------
// STEP: Indicator-based (Keterpenuhan, Kepatuhan, Kinerja, Narasi, Visual)
// ------------------------------------------------------------
export async function getIndicatorsForStep(
  sessionId: string,
  category: "KETERPENUHAN" | "KEPATUHAN" | "KINERJA" | "NARASI" | "VISUAL"
) {
  const { monevSession } = await requireSessionAccess(sessionId);
  const [program] = await db.select().from(programs).where(eq(programs.id, monevSession.programId)).limit(1);

  const inds = await db
    .select()
    .from(indicators)
    .where(
      and(
        eq(indicators.category, category),
        eq(indicators.isActive, true),
        or(isNull(indicators.programScope), eq(indicators.programScope, program!.code))
      )
    )
    .orderBy(indicators.urutan);

  const responses = await db
    .select()
    .from(indicatorResponses)
    .where(eq(indicatorResponses.sessionId, sessionId));
  const responseMap = new Map(responses.map((r) => [r.indicatorId, r]));

  return inds.map((ind) => ({ indicator: ind, response: responseMap.get(ind.id) ?? null }));
}

export async function saveIndicatorResponse(
  sessionId: string,
  indicatorId: string,
  data: { boolValue?: boolean; scaleValue?: number; evidenceUrl?: string; catatan?: string }
) {
  await requireSessionAccess(sessionId);

  const [existing] = await db
    .select()
    .from(indicatorResponses)
    .where(and(eq(indicatorResponses.sessionId, sessionId), eq(indicatorResponses.indicatorId, indicatorId)))
    .limit(1);

  if (existing) {
    await db
      .update(indicatorResponses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(indicatorResponses.id, existing.id));
  } else {
    await db.insert(indicatorResponses).values({ sessionId, indicatorId, ...data });
  }

  await touchSession(sessionId);
}

// ------------------------------------------------------------
// STEP: Kanal Publikasi
// ------------------------------------------------------------
export async function getChannelAudits(sessionId: string) {
  await requireSessionAccess(sessionId);

  const channels = await db.select().from(publicationChannels).orderBy(publicationChannels.urutan);
  const audits = await db.select().from(channelAudits).where(eq(channelAudits.sessionId, sessionId));
  const auditMap = new Map(audits.map((a) => [a.channelId, a]));

  return channels.map((c) => ({ channel: c, audit: auditMap.get(c.id) ?? null }));
}

export async function saveChannelAudit(
  sessionId: string,
  channelId: string,
  data: { digunakan: boolean; jumlahKonten?: number; urlContoh?: string; periode?: string; formatDominan?: string; catatan?: string }
) {
  await requireSessionAccess(sessionId);

  const [existing] = await db
    .select()
    .from(channelAudits)
    .where(and(eq(channelAudits.sessionId, sessionId), eq(channelAudits.channelId, channelId)))
    .limit(1);

  if (existing) {
    await db.update(channelAudits).set(data).where(eq(channelAudits.id, existing.id));
  } else {
    await db.insert(channelAudits).values({ sessionId, channelId, ...data });
  }

  await touchSession(sessionId);
}

// ------------------------------------------------------------
// STEP: Bukti Publikasi (evidence) — link, bukan upload
// ------------------------------------------------------------
export async function getEvidenceForSession(sessionId: string) {
  const { monevSession } = await requireSessionAccess(sessionId);
  const [program] = await db.select().from(programs).where(eq(programs.id, monevSession.programId)).limit(1);

  const types = await db
    .select()
    .from(evidenceTypes)
    .where(or(isNull(evidenceTypes.programScope), eq(evidenceTypes.programScope, program!.code)))
    .orderBy(evidenceTypes.urutan);

  const evidences = await db.select().from(publicationEvidence).where(eq(publicationEvidence.sessionId, sessionId));
  const evidenceMap = new Map(evidences.map((e) => [e.evidenceTypeId, e]));

  return types.map((t) => ({ type: t, evidence: evidenceMap.get(t.id) ?? null }));
}

export async function saveEvidence(
  sessionId: string,
  evidenceTypeId: string,
  data: { ada: boolean; fileUrl?: string; dataCapaian?: string; kutipanTestimoni?: string; catatan?: string }
) {
  await requireSessionAccess(sessionId);

  const [existing] = await db
    .select()
    .from(publicationEvidence)
    .where(and(eq(publicationEvidence.sessionId, sessionId), eq(publicationEvidence.evidenceTypeId, evidenceTypeId)))
    .limit(1);

  if (existing) {
    await db.update(publicationEvidence).set(data).where(eq(publicationEvidence.id, existing.id));
  } else {
    await db.insert(publicationEvidence).values({ sessionId, evidenceTypeId, ...data });
  }

  await touchSession(sessionId);
}

// ------------------------------------------------------------
// STEP: Brief Liputan
// ------------------------------------------------------------
export async function getStoryBrief(sessionId: string) {
  await requireSessionAccess(sessionId);

  const elements = await db.select().from(storyBriefElements).orderBy(storyBriefElements.urutan);
  const responses = await db.select().from(storyBriefResponses).where(eq(storyBriefResponses.sessionId, sessionId));
  const responseMap = new Map(responses.map((r) => [r.elementId, r]));

  return elements.map((e) => ({ element: e, response: responseMap.get(e.id) ?? null }));
}

export async function saveStoryBriefResponse(
  sessionId: string,
  elementId: string,
  data: { temuan?: string; buktiLink?: string; catatan?: string }
) {
  await requireSessionAccess(sessionId);

  const [existing] = await db
    .select()
    .from(storyBriefResponses)
    .where(and(eq(storyBriefResponses.sessionId, sessionId), eq(storyBriefResponses.elementId, elementId)))
    .limit(1);

  if (existing) {
    await db.update(storyBriefResponses).set(data).where(eq(storyBriefResponses.id, existing.id));
  } else {
    await db.insert(storyBriefResponses).values({ sessionId, elementId, ...data });
  }

  await touchSession(sessionId);
}

// ------------------------------------------------------------
// STEP: Wawancara
// ------------------------------------------------------------
export async function getInterviews(sessionId: string) {
  await requireSessionAccess(sessionId);

  const rows = await db.select().from(interviews).where(eq(interviews.sessionId, sessionId));
  const withAnswers = await Promise.all(
    rows.map(async (iv) => ({
      interview: iv,
      answers: await db
        .select()
        .from(interviewAnswers)
        .where(eq(interviewAnswers.interviewId, iv.id))
        .orderBy(interviewAnswers.urutan),
    }))
  );
  return withAnswers;
}

export async function getQuestionTemplate(role: string) {
  return db
    .select()
    .from(interviewQuestionTemplates)
    .where(eq(interviewQuestionTemplates.roleScope, role as "PESERTA" | "ALUMNI" | "MITRA" | "INSTRUKTUR" | "PENGELOLA" | "LAINNYA"))
    .orderBy(interviewQuestionTemplates.urutan);
}

export async function createInterview(
  sessionId: string,
  narasumber: string,
  peran: "PESERTA" | "ALUMNI" | "MITRA" | "INSTRUKTUR" | "PENGELOLA" | "LAINNYA"
) {
  await requireSessionAccess(sessionId);

  const [created] = await db.insert(interviews).values({ sessionId, narasumber, peran }).returning();

  const templates = await getQuestionTemplate(peran);
  if (templates.length > 0) {
    await db.insert(interviewAnswers).values(
      templates.map((t) => ({
        interviewId: created.id,
        pertanyaan: t.pertanyaan,
        urutan: t.urutan,
      }))
    );
  }

  await touchSession(sessionId);
  revalidatePath(`/monev/${sessionId}/step/10`);
  return created.id;
}

export async function saveInterviewAnswer(
  sessionId: string,
  answerId: string,
  data: { jawaban?: string; bolehDikutip?: boolean; catatan?: string }
) {
  await requireSessionAccess(sessionId);
  await db.update(interviewAnswers).set(data).where(eq(interviewAnswers.id, answerId));
  await touchSession(sessionId);
}

export async function deleteInterview(sessionId: string, interviewId: string) {
  await requireSessionAccess(sessionId);
  await db.delete(interviews).where(eq(interviews.id, interviewId));
  revalidatePath(`/monev/${sessionId}/step/10`);
}

// ------------------------------------------------------------
// STEP: Dokumentasi (link foto/video, bukan upload)
// ------------------------------------------------------------
export async function getMediaAssets(sessionId: string) {
  await requireSessionAccess(sessionId);
  return db.select().from(mediaAssets).where(eq(mediaAssets.sessionId, sessionId)).orderBy(mediaAssets.createdAt);
}

export async function addMediaAsset(
  sessionId: string,
  data: { category: string; fileUrl: string; fileType: string; caption?: string }
) {
  const { session } = await requireSessionAccess(sessionId);
  await db.insert(mediaAssets).values({
    sessionId,
    category: data.category as (typeof mediaAssets.$inferInsert)["category"],
    fileUrl: data.fileUrl,
    fileType: data.fileType,
    caption: data.caption,
    uploadedById: session.user.id,
  });
  await touchSession(sessionId);
  revalidatePath(`/monev/${sessionId}/step/11`);
}

export async function deleteMediaAsset(sessionId: string, assetId: string) {
  await requireSessionAccess(sessionId);
  await db.delete(mediaAssets).where(eq(mediaAssets.id, assetId));
  revalidatePath(`/monev/${sessionId}/step/11`);
}

// ------------------------------------------------------------
// STEP: Rekap — hitung skor dinamis (tidak pernah hardcode)
// ------------------------------------------------------------
export async function getRecap(sessionId: string) {
  const { monevSession } = await requireSessionAccess(sessionId);
  const [program] = await db.select().from(programs).where(eq(programs.id, monevSession.programId)).limit(1);

  async function pctBoolean(category: "KETERPENUHAN" | "KEPATUHAN") {
    const rows = await getIndicatorsForStep(sessionId, category);
    if (rows.length === 0) return 0;
    const yes = rows.filter((r) => r.response?.boolValue === true).length;
    return Math.round((yes / rows.length) * 100);
  }

  async function avgScale(category: "KINERJA" | "NARASI" | "VISUAL") {
    const rows = await getIndicatorsForStep(sessionId, category);
    const scored = rows.filter((r) => r.response?.scaleValue != null);
    if (scored.length === 0) return null;
    const sum = scored.reduce((acc, r) => acc + (r.response!.scaleValue as number), 0);
    return Math.round((sum / scored.length) * 100) / 100;
  }

  const keterpenuhan = await pctBoolean("KETERPENUHAN");
  const kepatuhan = await pctBoolean("KEPATUHAN");
  const kinerja = await avgScale("KINERJA");
  const narasi = await avgScale("NARASI");
  const visual = await avgScale("VISUAL");

  const evidenceRows = await getEvidenceForSession(sessionId);
  const channelRows = await getChannelAudits(sessionId);
  const hasExternalMedia = channelRows.some(
    (c) => c.channel.type === "EKSTERNAL" && c.audit?.digunakan
  );
  const hasArtikelRilis = evidenceRows.some(
    (e) => e.type.label.toLowerCase().includes("artikel") && e.evidence?.ada
  );
  const hasMagangEvidence = evidenceRows.some(
    (e) => e.type.label.toLowerCase().includes("magang") && e.evidence?.ada
  );
  const hasUsahaEvidence = evidenceRows.some(
    (e) =>
      (e.type.label.toLowerCase().includes("usaha") || e.type.label.toLowerCase().includes("penjualan")) &&
      e.evidence?.ada
  );

  return {
    programCode: program!.code,
    keterpenuhan,
    kepatuhan,
    kinerja,
    narasi,
    visual,
    hasExternalMedia,
    hasArtikelRilis,
    hasMagangEvidence,
    hasUsahaEvidence,
  };
}

// ------------------------------------------------------------
// Rekomendasi otomatis (recommendation engine sederhana)
// ------------------------------------------------------------
async function generateRecommendations(sessionId: string) {
  const recap = await getRecap(sessionId);
  const recs: { kode: string; teks: string }[] = [];

  if (recap.keterpenuhan < 80) {
    recs.push({ kode: "KETERPENUHAN_RENDAH", teks: "Perlu penguatan keterpenuhan tahapan publikasi." });
  }
  if (recap.kepatuhan < 80) {
    recs.push({ kode: "KEPATUHAN_RENDAH", teks: "Perlu penguatan kepatuhan tagging dan identitas publikasi." });
  }
  if (recap.narasi !== null && recap.narasi < 3) {
    recs.push({
      kode: "NARASI_RENDAH",
      teks: "Perlu penguatan narasi berbasis proses, hasil, data, dan human story.",
    });
  }
  if (recap.visual !== null && recap.visual < 3) {
    recs.push({ kode: "VISUAL_RENDAH", teks: "Perlu penguatan kualitas visual." });
  }
  if (!recap.hasExternalMedia) {
    recs.push({
      kode: "TANPA_MEDIA_EKSTERNAL",
      teks: "Perlu perluasan distribusi publikasi melalui media eksternal.",
    });
  }
  if (!recap.hasArtikelRilis) {
    recs.push({
      kode: "TANPA_ARTIKEL_RILIS",
      teks: "Perlu penguatan dokumentasi formal melalui artikel/rilis.",
    });
  }
  if (recap.programCode === "PKK" && !recap.hasMagangEvidence) {
    recs.push({
      kode: "PKK_TANPA_MAGANG",
      teks: "Perlu penguatan dokumentasi magang industri.",
    });
  }
  if (recap.programCode === "PKW" && !recap.hasUsahaEvidence) {
    recs.push({
      kode: "PKW_TANPA_USAHA",
      teks: "Perlu penguatan dokumentasi rintisan usaha dan pemasaran digital.",
    });
  }

  await db.delete(recommendations).where(eq(recommendations.sessionId, sessionId));
  if (recs.length > 0) {
    await db.insert(recommendations).values(recs.map((r) => ({ sessionId, ...r })));
  }

  return recs;
}

export async function getRecommendations(sessionId: string) {
  await requireSessionAccess(sessionId);
  return generateRecommendations(sessionId);
}

// ------------------------------------------------------------
// STEP 13: Validasi kelengkapan + Submit
// ------------------------------------------------------------
export async function checkCompleteness(sessionId: string) {
  const { monevSession } = await requireSessionAccess(sessionId);
  const [program] = await db.select().from(programs).where(eq(programs.id, monevSession.programId)).limit(1);

  const missing: string[] = [];

  const keterpenuhan = await getIndicatorsForStep(sessionId, "KETERPENUHAN");
  if (keterpenuhan.some((r) => r.response === null)) missing.push("Keterpenuhan");

  const kepatuhan = await getIndicatorsForStep(sessionId, "KEPATUHAN");
  if (kepatuhan.some((r) => r.response === null)) missing.push("Kepatuhan");

  const kinerja = await getIndicatorsForStep(sessionId, "KINERJA");
  if (kinerja.some((r) => r.response === null)) missing.push("Kinerja Publikasi");

  const narasi = await getIndicatorsForStep(sessionId, "NARASI");
  if (narasi.some((r) => r.response === null)) missing.push("Kualitas Narasi");

  const visual = await getIndicatorsForStep(sessionId, "VISUAL");
  if (visual.some((r) => r.response === null)) missing.push("Kualitas Visual");

  const channels = await getChannelAudits(sessionId);
  if (channels.every((c) => c.audit === null)) missing.push("Kanal Publikasi");

  const evidence = await getEvidenceForSession(sessionId);
  if (evidence.every((e) => e.evidence === null)) missing.push("Bukti Publikasi");

  const brief = await getStoryBrief(sessionId);
  if (brief.every((b) => b.response === null)) missing.push("Brief Liputan");

  const ivs = await getInterviews(sessionId);
  if (ivs.length === 0) missing.push("Wawancara");

  const media = await getMediaAssets(sessionId);
  if (media.length === 0) missing.push("Dokumentasi");

  return { complete: missing.length === 0, missing, programCode: program!.code };
}

export async function submitSession(sessionId: string) {
  const { session } = await requireSessionAccess(sessionId);

  const { complete, missing } = await checkCompleteness(sessionId);
  if (!complete) {
    return { error: `Masih ada ${missing.length} bagian yang belum lengkap.`, missing };
  }

  await generateRecommendations(sessionId);

  await db
    .update(monevSessions)
    .set({
      status: "MENUNGGU_REVIEW",
      submittedAt: new Date(),
      submittedById: session.user.id,
      updatedAt: new Date(),
    })
    .where(eq(monevSessions.id, sessionId));

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "SUBMIT",
    entityType: "monev_session",
    entityId: sessionId,
  });

  revalidatePath("/monev");
  return { success: true };
}

// ------------------------------------------------------------
// Info sesi + lokasi untuk shell wizard
// ------------------------------------------------------------
export async function getSessionMeta(sessionId: string) {
  const { monevSession } = await requireSessionAccess(sessionId);

  const [location] = await db.select().from(locations).where(eq(locations.id, monevSession.locationId)).limit(1);
  const [program] = await db.select().from(programs).where(eq(programs.id, monevSession.programId)).limit(1);

  return { session: monevSession, location: location!, program: program! };
}
