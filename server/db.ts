import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, User, documentation, locations, reports, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0];
}

export async function touchUser(user: User) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
}

export async function getDashboardStats() {
  const db = await requireDb();
  const [locationCount] = await db.select({ count: sql<number>`count(*)` }).from(locations).where(eq(locations.status, "active"));
  const [completedCount] = await db.select({ count: sql<number>`count(*)` }).from(reports).where(eq(reports.status, "completed"));
  const [publicationCount] = await db.select({ count: sql<number>`count(*)` }).from(documentation).where(eq(documentation.status, "verified"));
  const [reportCount] = await db.select({ count: sql<number>`count(*)` }).from(reports);
  const completeness = await db.select({ average: sql<number>`coalesce(avg(completeness), 0)` }).from(reports);
  return { locations: Number(locationCount?.count ?? 0), completed: Number(completedCount?.count ?? 0), publications: Number(publicationCount?.count ?? 0), completeness: Math.round(Number(completeness[0]?.average ?? 0)), reports: Number(reportCount?.count ?? 0) };
}

export async function listLocations() {
  const db = await requireDb();
  return db.select().from(locations).where(eq(locations.status, "active")).orderBy(locations.province, locations.name);
}

export async function listReports() {
  const db = await requireDb();
  return db.select({ report: reports, location: locations }).from(reports).leftJoin(locations, eq(reports.locationId, locations.id)).orderBy(desc(reports.updatedAt));
}

export async function listDocumentation() {
  const db = await requireDb();
  return db.select({ item: documentation, location: locations }).from(documentation).leftJoin(locations, eq(documentation.locationId, locations.id)).orderBy(desc(documentation.createdAt));
}
