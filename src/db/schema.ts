import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  real,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================
export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "PETUGAS", "VIEWER"]);
export const programCodeEnum = pgEnum("program_code", ["PKK", "PKW"]);
export const sessionStatusEnum = pgEnum("session_status", [
  "BELUM_DIMULAI",
  "DRAFT",
  "SEDANG_DIKERJAKAN",
  "SUBMIT",
  "MENUNGGU_REVIEW",
  "PERLU_PERBAIKAN",
  "DISETUJUI",
]);
export const indicatorCategoryEnum = pgEnum("indicator_category", [
  "KETERPENUHAN", // boolean, per-program
  "KEPATUHAN", // boolean, shared
  "KINERJA", // scale 1-4, shared
  "NARASI", // scale 1-4, shared
  "VISUAL", // scale 1-4, shared
]);
export const responseTypeEnum = pgEnum("response_type", ["BOOLEAN", "SCALE_1_4"]);
export const channelTypeEnum = pgEnum("channel_type", ["INTERNAL", "EKSTERNAL"]);
export const interviewRoleEnum = pgEnum("interview_role", [
  "PESERTA",
  "ALUMNI",
  "MITRA",
  "INSTRUKTUR",
  "PENGELOLA",
  "LAINNYA",
]);
export const reviewStatusEnum = pgEnum("review_status", ["DISETUJUI", "PERLU_PERBAIKAN"]);
export const mediaCategoryEnum = pgEnum("media_category", [
  "ESTABLISHING_SHOT",
  "PROSES_BELAJAR",
  "CLOSE_UP_KETERAMPILAN",
  "INTERAKSI_PESERTA_INSTRUKTUR",
  "PRODUK_HASIL",
  "MITRA",
  "TESTIMONI",
  "AKTIVITAS_KERJA_USAHA",
  "BUKTI_PENDUKUNG",
]);

// ============================================================
// USERS & ROLES
// ============================================================
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).unique(),
  // login identifier used by officers who may not have email (e.g. "BKHM", "Setditjen")
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("PETUGAS"),
  phone: varchar("phone", { length: 30 }),
  isUnitAccount: boolean("is_unit_account").notNull().default(false), // true for shared unit logins (BKHM, Setditjen)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// ============================================================
// PROGRAMS & SKILLS
// ============================================================
export const programs = pgTable("programs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  code: programCodeEnum("code").notNull().unique(),
  name: text("name").notNull(), // "Pendidikan Kecakapan Kerja" / "Pendidikan Kecakapan Wirausaha"
});

export const skills = pgTable("skills", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // "Las/Pengelasan", "Tata Boga", dst
});

// ============================================================
// LOCATIONS (10 lokasi Monev 2026)
// ============================================================
export const locations = pgTable("locations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  provinsi: text("provinsi").notNull(),
  kabKota: text("kab_kota").notNull(),
  namaLembaga: text("nama_lembaga").notNull(),
  skillId: varchar("skill_id", { length: 36 }).references(() => skills.id),
  penanggungJawab: text("penanggung_jawab"),
  noTelp: varchar("no_telp", { length: 30 }),
  alamat: text("alamat"),
  tanggalMonevMulai: timestamp("tanggal_monev_mulai"),
  tanggalMonevSelesai: timestamp("tanggal_monev_selesai"),
  // baseline akun kanal internal LKP (dari sheet 01_Identitas)
  igHandle: varchar("ig_handle", { length: 150 }),
  fbHandle: varchar("fb_handle", { length: 150 }),
  ytHandle: varchar("yt_handle", { length: 150 }),
  tiktokHandle: varchar("tiktok_handle", { length: 150 }),
  websiteUrl: text("website_url"),
  xHandle: varchar("x_handle", { length: 150 }),
  komunitasHandle: text("komunitas_handle"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// ============================================================
// ASSIGNMENTS (petugas <-> lokasi, many-to-many)
// ============================================================
export const assignments = pgTable(
  "assignments",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    locationId: varchar("location_id", { length: 36 })
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    periode: varchar("periode", { length: 100 }).notNull().default("2026"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("assignments_user_location_periode_uniq").on(
      t.userId,
      t.locationId,
      t.periode
    ),
  })
);

// ============================================================
// MONEV SESSIONS (1 sesi = 1 lokasi + 1 program)
// ============================================================
export const monevSessions = pgTable(
  "monev_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    locationId: varchar("location_id", { length: 36 })
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    programId: varchar("program_id", { length: 36 })
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    periode: varchar("periode", { length: 100 }).notNull().default("2026"),
    status: sessionStatusEnum("status").notNull().default("BELUM_DIMULAI"),
    currentStep: integer("current_step").notNull().default(1),
    lastSavedAt: timestamp("last_saved_at"),
    submittedAt: timestamp("submitted_at"),
    submittedById: varchar("submitted_by_id", { length: 36 }).references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("monev_sessions_location_program_periode_uniq").on(
      t.locationId,
      t.programId,
      t.periode
    ),
  })
);

// ============================================================
// INDICATOR ENGINE (generik, tidak hardcode)
// Menaungi: Keterpenuhan, Kepatuhan, Kinerja, Narasi, Visual
// ============================================================
export const indicators = pgTable("indicators", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  category: indicatorCategoryEnum("category").notNull(),
  programScope: programCodeEnum("program_scope"), // null = berlaku untuk kedua program
  code: varchar("code", { length: 10 }), // A1, B2, dst - opsional, untuk traceability ke KAK
  label: text("label").notNull(),
  responseType: responseTypeEnum("response_type").notNull(),
  urutan: integer("urutan").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const indicatorResponses = pgTable(
  "indicator_responses",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => monevSessions.id, { onDelete: "cascade" }),
    indicatorId: varchar("indicator_id", { length: 36 })
      .notNull()
      .references(() => indicators.id, { onDelete: "restrict" }),
    boolValue: boolean("bool_value"), // dipakai jika responseType = BOOLEAN
    scaleValue: integer("scale_value"), // 1-4, dipakai jika responseType = SCALE_1_4
    evidenceUrl: text("evidence_url"),
    evidenceDate: timestamp("evidence_date"),
    channel: varchar("channel", { length: 150 }),
    catatan: text("catatan"),
    isVerified: boolean("is_verified").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("indicator_responses_session_indicator_uniq").on(
      t.sessionId,
      t.indicatorId
    ),
  })
);

// ============================================================
// PUBLICATION CHANNELS (audit kanal)
// ============================================================
export const publicationChannels = pgTable("publication_channels", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  type: channelTypeEnum("type").notNull(),
  urutan: integer("urutan").notNull().default(0),
});

export const channelAudits = pgTable(
  "channel_audits",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => monevSessions.id, { onDelete: "cascade" }),
    channelId: varchar("channel_id", { length: 36 })
      .notNull()
      .references(() => publicationChannels.id, { onDelete: "restrict" }),
    digunakan: boolean("digunakan").notNull().default(false),
    jumlahKonten: integer("jumlah_konten"),
    urlContoh: text("url_contoh"),
    periode: varchar("periode", { length: 150 }),
    formatDominan: varchar("format_dominan", { length: 150 }),
    catatan: text("catatan"),
  },
  (t) => ({
    uniq: uniqueIndex("channel_audits_session_channel_uniq").on(t.sessionId, t.channelId),
  })
);

// ============================================================
// PUBLICATION EVIDENCE (bukti publikasi - berbeda per program)
// ============================================================
export const evidenceTypes = pgTable("evidence_types", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  programScope: programCodeEnum("program_scope"), // null = keduanya
  label: text("label").notNull(),
  urutan: integer("urutan").notNull().default(0),
});

export const publicationEvidence = pgTable(
  "publication_evidence",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => monevSessions.id, { onDelete: "cascade" }),
    evidenceTypeId: varchar("evidence_type_id", { length: 36 })
      .notNull()
      .references(() => evidenceTypes.id, { onDelete: "restrict" }),
    ada: boolean("ada").notNull().default(false),
    fileUrl: text("file_url"),
    dataCapaian: text("data_capaian"),
    kutipanTestimoni: text("kutipan_testimoni"),
    kualitasKelengkapan: text("kualitas_kelengkapan"),
    catatan: text("catatan"),
  },
  (t) => ({
    uniq: uniqueIndex("publication_evidence_session_type_uniq").on(
      t.sessionId,
      t.evidenceTypeId
    ),
  })
);

// ============================================================
// STORY BRIEF (12 elemen brief liputan)
// ============================================================
export const storyBriefElements = pgTable("story_brief_elements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  urutan: integer("urutan").notNull(),
  elemen: text("elemen").notNull(),
  arahan: text("arahan"),
});

export const storyBriefResponses = pgTable(
  "story_brief_responses",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => monevSessions.id, { onDelete: "cascade" }),
    elementId: varchar("element_id", { length: 36 })
      .notNull()
      .references(() => storyBriefElements.id, { onDelete: "restrict" }),
    temuan: text("temuan"),
    buktiLink: text("bukti_link"),
    catatan: text("catatan"),
  },
  (t) => ({
    uniq: uniqueIndex("story_brief_responses_session_element_uniq").on(
      t.sessionId,
      t.elementId
    ),
  })
);

// ============================================================
// INTERVIEWS (wawancara)
// ============================================================
export const interviewQuestionTemplates = pgTable("interview_question_templates", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  roleScope: interviewRoleEnum("role_scope").notNull(),
  urutan: integer("urutan").notNull(),
  pertanyaan: text("pertanyaan").notNull(),
});

export const interviews = pgTable("interviews", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 36 })
    .notNull()
    .references(() => monevSessions.id, { onDelete: "cascade" }),
  narasumber: text("narasumber").notNull(),
  peran: interviewRoleEnum("peran").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const interviewAnswers = pgTable("interview_answers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id", { length: 36 })
    .notNull()
    .references(() => interviews.id, { onDelete: "cascade" }),
  pertanyaan: text("pertanyaan").notNull(), // disalin dari template saat dipilih, tapi bisa diedit bebas
  jawaban: text("jawaban"),
  bolehDikutip: boolean("boleh_dikutip").notNull().default(false),
  catatan: text("catatan"),
  urutan: integer("urutan").notNull().default(0),
});

// ============================================================
// MEDIA ASSETS (dokumentasi)
// ============================================================
export const mediaAssets = pgTable("media_assets", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 36 })
    .notNull()
    .references(() => monevSessions.id, { onDelete: "cascade" }),
  category: mediaCategoryEnum("category").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 30 }).notNull(), // image | video | document
  caption: text("caption"),
  uploadedById: varchar("uploaded_by_id", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// REVIEWS
// ============================================================
export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 36 })
    .notNull()
    .references(() => monevSessions.id, { onDelete: "cascade" }),
  reviewerId: varchar("reviewer_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  status: reviewStatusEnum("status").notNull(),
  catatan: text("catatan"),
  revisiKe: integer("revisi_ke").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// RECOMMENDATIONS (generated, bukan input manual)
// ============================================================
export const recommendations = pgTable("recommendations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 36 })
    .notNull()
    .references(() => monevSessions.id, { onDelete: "cascade" }),
  kode: varchar("kode", { length: 50 }).notNull(), // e.g. "KETERPENUHAN_RENDAH"
  teks: text("teks").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

// ============================================================
// AUDIT LOG
// ============================================================
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 36 }),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// RELATIONS
// ============================================================
export const usersRelations = relations(users, ({ many }) => ({
  assignments: many(assignments),
  auditLogs: many(auditLogs),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  skill: one(skills, { fields: [locations.skillId], references: [skills.id] }),
  assignments: many(assignments),
  sessions: many(monevSessions),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  user: one(users, { fields: [assignments.userId], references: [users.id] }),
  location: one(locations, { fields: [assignments.locationId], references: [locations.id] }),
}));

export const monevSessionsRelations = relations(monevSessions, ({ one, many }) => ({
  location: one(locations, { fields: [monevSessions.locationId], references: [locations.id] }),
  program: one(programs, { fields: [monevSessions.programId], references: [programs.id] }),
  indicatorResponses: many(indicatorResponses),
  channelAudits: many(channelAudits),
  evidence: many(publicationEvidence),
  storyBrief: many(storyBriefResponses),
  interviews: many(interviews),
  mediaAssets: many(mediaAssets),
  reviews: many(reviews),
  recommendations: many(recommendations),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  session: one(monevSessions, { fields: [interviews.sessionId], references: [monevSessions.id] }),
  answers: many(interviewAnswers),
}));
