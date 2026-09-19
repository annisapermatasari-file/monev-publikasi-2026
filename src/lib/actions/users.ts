"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Hanya SUPER_ADMIN yang dapat melakukan aksi ini.");
  }
  return session;
}

function slugifyUsername(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, "")
    .replace(/\s+/g, ".");
}

const createOfficerSchema = z.object({
  name: z.string().min(2, "Nama wajib diisi"),
  username: z.string().min(2).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "PETUGAS", "VIEWER"]),
  isUnitAccount: z.string().optional(), // checkbox value "on"
});

export async function createOfficer(formData: FormData) {
  const session = await requireSuperAdmin();

  const parsed = createOfficerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const data = parsed.data;
  const username = (data.username || slugifyUsername(data.name)).toLowerCase();

  const [existing] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existing) {
    return { error: `Username "${username}" sudah dipakai. Coba nama lain atau isi username manual.` };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const [created] = await db
    .insert(users)
    .values({
      name: data.name,
      username,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role,
      isUnitAccount: data.isUnitAccount === "on",
      passwordHash,
      isActive: true,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "CREATE",
    entityType: "user",
    entityId: created.id,
    metadata: JSON.stringify({ username }),
  });

  revalidatePath("/petugas");
  return { success: true, id: created.id, username, tempPassword };
}

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out + "!";
}

export async function resetOfficerPassword(userId: string) {
  const session = await requireSuperAdmin();

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: "RESET_PASSWORD",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/petugas");
  return { tempPassword };
}

export async function toggleOfficerActive(userId: string, isActive: boolean) {
  const session = await requireSuperAdmin();

  await db.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, userId));

  await db.insert(auditLogs).values({
    userId: session.user.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/petugas");
}
