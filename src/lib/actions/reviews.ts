"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs, monevSessions, reviews } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Hanya Super Admin yang dapat melakukan review.");
  }
  return session;
}

export async function submitReview(
  sessionId: string,
  status: "DISETUJUI" | "PERLU_PERBAIKAN",
  catatan: string
) {
  const session = await requireAdmin();
  const [monevSession] = await db
    .select()
    .from(monevSessions)
    .where(eq(monevSessions.id, sessionId))
    .limit(1);
  if (!monevSession) throw new Error("Sesi Monev tidak ditemukan.");
  if (!["MENUNGGU_REVIEW", "PERLU_PERBAIKAN"].includes(monevSession.status)) {
    throw new Error("Sesi ini belum berada dalam antrean review.");
  }

  const previousReviews = await db
    .select({ revisiKe: reviews.revisiKe })
    .from(reviews)
    .where(eq(reviews.sessionId, sessionId))
    .orderBy(desc(reviews.revisiKe))
    .limit(1);
  const revisiKe = (previousReviews[0]?.revisiKe ?? 0) + 1;

  await db.insert(reviews).values({
    sessionId,
    reviewerId: session.user.id,
    status,
    catatan: catatan.trim() || null,
    revisiKe,
  });
  await db
    .update(monevSessions)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(monevSessions.id, sessionId));
  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: status === "DISETUJUI" ? "REVIEW_APPROVED" : "REVIEW_REVISION",
    entityType: "monev_session",
    entityId: sessionId,
    metadata: JSON.stringify({ revisiKe, catatan: catatan.trim() }),
  });

  revalidatePath("/review");
  revalidatePath(`/review/${sessionId}`);
  revalidatePath(`/monev/${sessionId}/step/13`);
}
