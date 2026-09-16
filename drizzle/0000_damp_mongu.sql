CREATE TYPE "public"."channel_type" AS ENUM('INTERNAL', 'EKSTERNAL');--> statement-breakpoint
CREATE TYPE "public"."indicator_category" AS ENUM('KETERPENUHAN', 'KEPATUHAN', 'KINERJA', 'NARASI', 'VISUAL');--> statement-breakpoint
CREATE TYPE "public"."interview_role" AS ENUM('PESERTA', 'ALUMNI', 'MITRA', 'INSTRUKTUR', 'PENGELOLA', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."media_category" AS ENUM('ESTABLISHING_SHOT', 'PROSES_BELAJAR', 'CLOSE_UP_KETERAMPILAN', 'INTERAKSI_PESERTA_INSTRUKTUR', 'PRODUK_HASIL', 'MITRA', 'TESTIMONI', 'AKTIVITAS_KERJA_USAHA', 'BUKTI_PENDUKUNG');--> statement-breakpoint
CREATE TYPE "public"."program_code" AS ENUM('PKK', 'PKW');--> statement-breakpoint
CREATE TYPE "public"."response_type" AS ENUM('BOOLEAN', 'SCALE_1_4');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('DISETUJUI', 'PERLU_PERBAIKAN');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('SUPER_ADMIN', 'PETUGAS', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('BELUM_DIMULAI', 'DRAFT', 'SEDANG_DIKERJAKAN', 'SUBMIT', 'MENUNGGU_REVIEW', 'PERLU_PERBAIKAN', 'DISETUJUI');--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"location_id" varchar(36) NOT NULL,
	"periode" varchar(100) DEFAULT '2026' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(36),
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channel_audits" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"channel_id" varchar(36) NOT NULL,
	"digunakan" boolean DEFAULT false NOT NULL,
	"jumlah_konten" integer,
	"url_contoh" text,
	"periode" varchar(150),
	"format_dominan" varchar(150),
	"catatan" text
);
--> statement-breakpoint
CREATE TABLE "evidence_types" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_scope" "program_code",
	"label" text NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicator_responses" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"indicator_id" varchar(36) NOT NULL,
	"bool_value" boolean,
	"scale_value" integer,
	"evidence_url" text,
	"evidence_date" timestamp,
	"channel" varchar(150),
	"catatan" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "indicator_category" NOT NULL,
	"program_scope" "program_code",
	"code" varchar(10),
	"label" text NOT NULL,
	"response_type" "response_type" NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_answers" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" varchar(36) NOT NULL,
	"pertanyaan" text NOT NULL,
	"jawaban" text,
	"boleh_dikutip" boolean DEFAULT false NOT NULL,
	"catatan" text,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_question_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_scope" "interview_role" NOT NULL,
	"urutan" integer NOT NULL,
	"pertanyaan" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"narasumber" text NOT NULL,
	"peran" "interview_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provinsi" text NOT NULL,
	"kab_kota" text NOT NULL,
	"nama_lembaga" text NOT NULL,
	"skill_id" varchar(36),
	"penanggung_jawab" text,
	"no_telp" varchar(30),
	"alamat" text,
	"tanggal_monev_mulai" timestamp,
	"tanggal_monev_selesai" timestamp,
	"ig_handle" varchar(150),
	"fb_handle" varchar(150),
	"yt_handle" varchar(150),
	"tiktok_handle" varchar(150),
	"website_url" text,
	"x_handle" varchar(150),
	"komunitas_handle" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"category" "media_category" NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(30) NOT NULL,
	"caption" text,
	"uploaded_by_id" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monev_sessions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" varchar(36) NOT NULL,
	"program_id" varchar(36) NOT NULL,
	"periode" varchar(100) DEFAULT '2026' NOT NULL,
	"status" "session_status" DEFAULT 'BELUM_DIMULAI' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"last_saved_at" timestamp,
	"submitted_at" timestamp,
	"submitted_by_id" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" "program_code" NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "programs_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "publication_channels" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "channel_type" NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "publication_channels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "publication_evidence" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"evidence_type_id" varchar(36) NOT NULL,
	"ada" boolean DEFAULT false NOT NULL,
	"file_url" text,
	"data_capaian" text,
	"kutipan_testimoni" text,
	"kualitas_kelengkapan" text,
	"catatan" text
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"kode" varchar(50) NOT NULL,
	"teks" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"reviewer_id" varchar(36) NOT NULL,
	"status" "review_status" NOT NULL,
	"catatan" text,
	"revisi_ke" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "story_brief_elements" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"urutan" integer NOT NULL,
	"elemen" text NOT NULL,
	"arahan" text
);
--> statement-breakpoint
CREATE TABLE "story_brief_responses" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"element_id" varchar(36) NOT NULL,
	"temuan" text,
	"bukti_link" text,
	"catatan" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255),
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'PETUGAS' NOT NULL,
	"phone" varchar(30),
	"is_unit_account" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_audits" ADD CONSTRAINT "channel_audits_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_audits" ADD CONSTRAINT "channel_audits_channel_id_publication_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."publication_channels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_responses" ADD CONSTRAINT "indicator_responses_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_responses" ADD CONSTRAINT "indicator_responses_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_answers" ADD CONSTRAINT "interview_answers_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monev_sessions" ADD CONSTRAINT "monev_sessions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monev_sessions" ADD CONSTRAINT "monev_sessions_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monev_sessions" ADD CONSTRAINT "monev_sessions_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_evidence" ADD CONSTRAINT "publication_evidence_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_evidence" ADD CONSTRAINT "publication_evidence_evidence_type_id_evidence_types_id_fk" FOREIGN KEY ("evidence_type_id") REFERENCES "public"."evidence_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_brief_responses" ADD CONSTRAINT "story_brief_responses_session_id_monev_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."monev_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_brief_responses" ADD CONSTRAINT "story_brief_responses_element_id_story_brief_elements_id_fk" FOREIGN KEY ("element_id") REFERENCES "public"."story_brief_elements"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_user_location_periode_uniq" ON "assignments" USING btree ("user_id","location_id","periode");--> statement-breakpoint
CREATE UNIQUE INDEX "channel_audits_session_channel_uniq" ON "channel_audits" USING btree ("session_id","channel_id");--> statement-breakpoint
CREATE UNIQUE INDEX "indicator_responses_session_indicator_uniq" ON "indicator_responses" USING btree ("session_id","indicator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "monev_sessions_location_program_periode_uniq" ON "monev_sessions" USING btree ("location_id","program_id","periode");--> statement-breakpoint
CREATE UNIQUE INDEX "publication_evidence_session_type_uniq" ON "publication_evidence" USING btree ("session_id","evidence_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "story_brief_responses_session_element_uniq" ON "story_brief_responses" USING btree ("session_id","element_id");