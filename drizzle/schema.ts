import { double, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 80 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "SUPER_ADMIN", "PETUGAS", "VIEWER"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  province: varchar("province", { length: 120 }).notNull(),
  address: text("address"),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ provinceIdx: index("locations_province_idx").on(table.province) }));

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  officerName: varchar("officerName", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["completed", "review", "in_progress"]).default("in_progress").notNull(),
  completeness: int("completeness").default(0).notNull(),
  notes: text("notes"),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ locationIdx: index("reports_location_idx").on(table.locationId), statusIdx: index("reports_status_idx").on(table.status) }));

export const documentation = mysqlTable("documentation", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId"),
  title: varchar("title", { length: 180 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  storageUrl: varchar("storageUrl", { length: 700 }).notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  status: mysqlEnum("status", ["verified", "review"]).default("review").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ createdIdx: index("documentation_created_idx").on(table.createdAt) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Documentation = typeof documentation.$inferSelect;
