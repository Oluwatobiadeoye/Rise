CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE TYPE "public"."mentor_audience" AS ENUM('tertiary', 'early-career', 'either');--> statement-breakpoint
CREATE TYPE "public"."mentor_availability" AS ENUM('monthly', 'fortnightly', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'in_review', 'accepted', 'declined', 'closed', 'archived');--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"label" text NOT NULL,
	"open_at" timestamp with time zone NOT NULL,
	"close_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cycles_role_valid" CHECK ("cycles"."role" in ('mentor','mentee')),
	CONSTRAINT "cycles_window_valid" CHECK ("cycles"."close_at" > "cycles"."open_at")
);
--> statement-breakpoint
ALTER TABLE "cycles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mentee_submissions" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"institution" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"essay" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentee_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mentor_submissions" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"field_of_expertise" text NOT NULL,
	"audience_preference" "mentor_audience" NOT NULL,
	"availability" "mentor_availability" NOT NULL,
	"message" text
);
--> statement-breakpoint
ALTER TABLE "mentor_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"submission_type" text,
	"submission_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_kind_valid" CHECK ("notifications"."kind" in ('submission-received','decision-email')),
	CONSTRAINT "notifications_submission_type_valid" CHECK ("notifications"."submission_type" is null or "notifications"."submission_type" in ('contact','mentor','mentee','volunteer'))
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notify_me" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notify_me_role_email_key" UNIQUE("role","email"),
	CONSTRAINT "notify_me_role_valid" CHECK ("notify_me"."role" in ('mentor','mentee'))
);
--> statement-breakpoint
ALTER TABLE "notify_me" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"from_ref" text,
	"cycle_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_type_valid" CHECK ("submissions"."type" in ('contact','mentor','mentee','volunteer')),
	CONSTRAINT "submissions_status_for_type" CHECK (("submissions"."type" in ('mentor','mentee') and "submissions"."status" in ('pending','in_review','accepted','declined','archived')) or ("submissions"."type" in ('contact','volunteer') and "submissions"."status" in ('pending','in_review','closed','archived')))
);
--> statement-breakpoint
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "volunteer_submissions" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"interest_area" text NOT NULL,
	"message" text
);
--> statement-breakpoint
ALTER TABLE "volunteer_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentee_submissions" ADD CONSTRAINT "mentee_submissions_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_submissions" ADD CONSTRAINT "mentor_submissions_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_submissions" ADD CONSTRAINT "volunteer_submissions_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cycles_role_open_idx" ON "cycles" USING btree ("role","open_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "submissions_type_created_idx" ON "submissions" USING btree ("type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");--> statement-breakpoint
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_no_overlap" EXCLUDE USING gist ("role" WITH =, tstzrange("open_at", "close_at") WITH &&);