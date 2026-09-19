"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { locations, skills, assignments, users, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const locationSchema = z.object({
  provinsi: z.string().min(2, "Provinsi wajib diisi"),
  kabKota: z.string().min(2, "Kab/Kota wajib diisi"),
  namaLembaga: z.string().min(2, "Nama lembaga wajib diisi"),
  skillName: z.string().min(2, "Jenis keterampilan wajib diisi"),
  penanggungJawab: z.string().optional(),
  noTelp: z.string().optional(),
  alamat: z.string().optional(),
  igHandle: z.string().optional(),
  fbHandle: z.string().optional(),
  ytHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  websiteUrl: z.string().optional(),
});

async function requireSuperAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Hanya SUPER_ADMIN yang dapat melakukan aksi ini.");
  }
  return session;
}

async function findOrCreateSkill(name: string) {
  const trimmed = name.trim();
  const [existing] = await db.select().from(skills).where(eq(skills.name, trimmed)).limit(1);
  if (existing) return existing.id;
  const [created] = await db.insert(skills).values({ name: trimmed }).returning();
  return created.id;
}

export async function createLocation(formData: FormData) {
  const session = await requireSuperAdmin();

  const parsed = locationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const data = parsed.data;

  const skillId = await findOrCreateSkill(data.skillName);

  const [created] = await db
    .insert(locations)
    .values({
      provinsi: data.provinsi,
      kabKota: data.kabKota,
      namaLembaga: data.namaLembaga,
      skillId,
      penanggungJawab: data.penanggungJawab || null,
      noTelp: data.noTelp || null,
      alamat: data.alamat || null,
      igHandle: data.igHandle || null,
      fbHandle: data.fbHandle || null,
      ytHandle: data.ytHandle || null,
      tiktokHandle: data.tiktokHandle || null,
      websiteUrl: data.websiteUrl || null,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "CREATE",
    entityType: "location",
    entityId: created.id,
    metadata: JSON.stringify({ namaLembaga: created.namaLembaga }),
  });

  revalidatePath("/lokasi");
  return { success: true, id: created.id };
}

export async function updateLocation(id: string, formData: FormData) {
  const session = await requireSuperAdmin();

  const parsed = locationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const data = parsed.data;
  const skillId = await findOrCreateSkill(data.skillName);

  await db
    .update(locations)
    .set({
      provinsi: data.provinsi,
      kabKota: data.kabKota,
      namaLembaga: data.namaLembaga,
      skillId,
      penanggungJawab: data.penanggungJawab || null,
      noTelp: data.noTelp || null,
      alamat: data.alamat || null,
      igHandle: data.igHandle || null,
      fbHandle: data.fbHandle || null,
      ytHandle: data.ytHandle || null,
      tiktokHandle: data.tiktokHandle || null,
      websiteUrl: data.websiteUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(locations.id, id));

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "location",
    entityId: id,
  });

  revalidatePath("/lokasi");
  revalidatePath(`/lokasi/${id}`);
  return { success: true };
}

export async function softDeleteLocation(id: string) {
  const session = await requireSuperAdmin();

  await db
    .update(locations)
    .set({ isActive: false, deletedAt: new Date() })
    .where(eq(locations.id, id));

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "SOFT_DELETE",
    entityType: "location",
    entityId: id,
  });

  revalidatePath("/lokasi");
}

export async function assignOfficerToLocation(locationId: string, userId: string) {
  const session = await requireSuperAdmin();

  const [existing] = await db
    .select()
    .from(assignments)
    .where(and(eq(assignments.locationId, locationId), eq(assignments.userId, userId), eq(assignments.periode, "2026")))
    .limit(1);
  if (existing) return { error: "Petugas ini sudah ditugaskan ke lokasi ini." };

  await db.insert(assignments).values({ locationId, userId, periode: "2026" });

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "ASSIGN",
    entityType: "assignment",
    entityId: locationId,
    metadata: JSON.stringify({ userId }),
  });

  revalidatePath(`/lokasi/${locationId}`);
  return { success: true };
}

export async function unassignOfficerFromLocation(assignmentId: string, locationId: string) {
  const session = await requireSuperAdmin();

  await db.delete(assignments).where(eq(assignments.id, assignmentId));

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "UNASSIGN",
    entityType: "assignment",
    entityId: assignmentId,
  });

  revalidatePath(`/lokasi/${locationId}`);
}

export async function getAvailableOfficers(locationId: string) {
  await requireSuperAdmin();

  const assigned = await db
    .select({ userId: assignments.userId })
    .from(assignments)
    .where(and(eq(assignments.locationId, locationId), eq(assignments.periode, "2026")));
  const assignedIds = new Set(assigned.map((a) => a.userId));

  const allOfficers = await db
    .select()
    .from(users)
    .where(eq(users.role, "PETUGAS"));

  return allOfficers.filter((o) => !assignedIds.has(o.id));
}
