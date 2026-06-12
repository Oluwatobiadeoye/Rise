import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Closed value sets enforced by the database. `submissionStatus` is the union
// of both lifecycles; a per-type check on `submissions` restricts which values
// each type may hold (applications are accepted/declined; enquiries are closed).
export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "in_review",
  "accepted",
  "declined",
  "closed",
  "archived",
]);

export const mentorAudience = pgEnum("mentor_audience", [
  "tertiary",
  "early-career",
  "either",
]);

export const mentorAvailability = pgEnum("mentor_availability", [
  "monthly",
  "fortnightly",
  "flexible",
]);

// Application cycles: a scheduled open/close window per role. Whether a role is
// "open" is derived from whether now() falls inside a cycle's window. The
// no-overlap exclusion constraint and `btree_gist` extension are not
// expressible in Drizzle's table DSL and are added in the migration.
export const cycles = pgTable(
  "cycles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    role: text("role").notNull(),
    label: text("label").notNull(),
    openAt: timestamp("open_at", { withTimezone: true, mode: "string" }).notNull(),
    closeAt: timestamp("close_at", { withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("cycles_role_valid", sql`${table.role} in ('mentor','mentee')`),
    check("cycles_window_valid", sql`${table.closeAt} > ${table.openAt}`),
    index("cycles_role_open_idx").on(table.role, table.openAt.desc()),
  ],
).enableRLS();

// Supertype: shared fields for every submission. The admin inbox lists, sorts,
// filters, and counts straight from this table with no joins.
export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    type: text("type").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    status: submissionStatus("status").notNull().default("pending"),
    notes: text("notes").notNull().default(""),
    fromRef: text("from_ref"),
    cycleId: uuid("cycle_id").references(() => cycles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "submissions_type_valid",
      sql`${table.type} in ('contact','mentor','mentee','volunteer')`,
    ),
    // Applications are accepted/declined; enquiries are closed. Neither set
    // includes the other's terminal states.
    check(
      "submissions_status_for_type",
      sql`(${table.type} in ('mentor','mentee') and ${table.status} in ('pending','in_review','accepted','declined','archived')) or (${table.type} in ('contact','volunteer') and ${table.status} in ('pending','in_review','closed','archived'))`,
    ),
    index("submissions_type_created_idx").on(
      table.type,
      table.createdAt.desc(),
    ),
    index("submissions_status_idx").on(table.status),
  ],
).enableRLS();

// Subtypes: one detail table per submission type. The primary key is also a
// foreign key to the supertype, enforcing a strict 1-to-1 and cascading deletes.
export const contactSubmissions = pgTable("contact_submissions", {
  submissionId: uuid("submission_id")
    .primaryKey()
    .references(() => submissions.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  message: text("message").notNull(),
}).enableRLS();

export const mentorSubmissions = pgTable("mentor_submissions", {
  submissionId: uuid("submission_id")
    .primaryKey()
    .references(() => submissions.id, { onDelete: "cascade" }),
  fieldOfExpertise: text("field_of_expertise").notNull(),
  audiencePreference: mentorAudience("audience_preference").notNull(),
  availability: mentorAvailability("availability").notNull(),
  message: text("message"),
}).enableRLS();

export const menteeSubmissions = pgTable("mentee_submissions", {
  submissionId: uuid("submission_id")
    .primaryKey()
    .references(() => submissions.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  essay: text("essay").notNull(),
}).enableRLS();

export const volunteerSubmissions = pgTable("volunteer_submissions", {
  submissionId: uuid("submission_id")
    .primaryKey()
    .references(() => submissions.id, { onDelete: "cascade" }),
  interestArea: text("interest_area").notNull(),
  message: text("message"),
}).enableRLS();

// Notify-me signups captured while a cycle is closed.
export const notifyMe = pgTable(
  "notify_me",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    role: text("role").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("notify_me_role_valid", sql`${table.role} in ('mentor','mentee')`),
    unique("notify_me_role_email_key").on(table.role, table.email),
  ],
).enableRLS();

// Durable, queryable audit log of every notification the app records. The
// submission reference is nullable so a deleted submission leaves the audit
// row intact.
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    kind: text("kind").notNull(),
    recipient: text("recipient").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    submissionType: text("submission_type"),
    submissionId: uuid("submission_id").references(() => submissions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "notifications_kind_valid",
      sql`${table.kind} in ('submission-received','decision-email')`,
    ),
    check(
      "notifications_submission_type_valid",
      sql`${table.submissionType} is null or ${table.submissionType} in ('contact','mentor','mentee','volunteer')`,
    ),
    index("notifications_created_idx").on(table.createdAt.desc()),
  ],
).enableRLS();
