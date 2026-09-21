import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "../server/db";
import { hashPassword } from "../server/password";

const username = process.env.LOCAL_USERNAME?.trim().toLowerCase();
const password = process.env.LOCAL_PASSWORD;
const role = process.env.LOCAL_ROLE === "PETUGAS" ? "PETUGAS" : "SUPER_ADMIN";

if (!username || !password) throw new Error("Set LOCAL_USERNAME and LOCAL_PASSWORD in the environment.");
if (!/^[a-z0-9._-]{3,80}$/.test(username)) throw new Error("Username must be 3-80 characters: a-z, 0-9, dot, underscore, or hyphen.");
if (password.length < 12) throw new Error("Password must be at least 12 characters.");

const db = await getDb();
if (!db) throw new Error("DATABASE_URL is not configured.");

const passwordHash = await hashPassword(password);
const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);

if (existing[0]) {
  await db.update(users).set({ passwordHash, role, name: username, loginMethod: "local" }).where(eq(users.id, existing[0].id));
  console.log(`Updated local account: ${username} (${role})`);
} else {
  await db.insert(users).values({ openId: `local:${username}`, username, passwordHash, name: username, loginMethod: "local", role });
  console.log(`Created local account: ${username} (${role})`);
}
