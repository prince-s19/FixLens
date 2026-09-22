import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const repairStatusEnum = pgEnum("repair_status", [
  "analyzing",
  "ready",
  "in_progress",
  "completed",
  "escalated",
]);

export const difficultyEnum = pgEnum("repair_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const safetyEnum = pgEnum("repair_safety", [
  "safe",
  "caution",
  "unsafe",
]);

export const severityEnum = pgEnum("repair_severity", [
  "minor",
  "moderate",
  "severe",
]);

export const urgencyEnum = pgEnum("escalation_urgency", [
  "low",
  "medium",
  "high",
]);

export const escalationStatusEnum = pgEnum("escalation_status", [
  "pending",
  "accepted",
  "in_progress",
  "resolved",
  "cancelled",
]);

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const technicians = pgTable("technicians", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  city: text("city").notNull(),
  yearsExperience: integer("years_experience").notNull().default(1),
  rating: integer("rating").notNull().default(45), // rating x10, e.g. 47 = 4.7
  available: boolean("available").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const repairRequests = pgTable("repair_requests", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  objectLabel: text("object_label").notNull(),
  description: text("description").notNull().default(""),
  photoBeforeUrl: text("photo_before_url").notNull(),
  photoAfterUrl: text("photo_after_url"),
  damageSummary: text("damage_summary").notNull().default(""),
  damageSeverity: severityEnum("damage_severity").notNull().default("moderate"),
  damageBox: jsonb("damage_box").$type<{ x: number; y: number; w: number; h: number }>(),
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull().default(20),
  estimatedCostMin: integer("estimated_cost_min").notNull().default(0),
  estimatedCostMax: integer("estimated_cost_max").notNull().default(0),
  safetyLevel: safetyEnum("safety_level").notNull().default("safe"),
  safetyNotes: jsonb("safety_notes").$type<string[]>().notNull().default([]),
  isDiySafe: boolean("is_diy_safe").notNull().default(true),
  steps: jsonb("steps")
    .$type<{ order: number; title: string; description: string; durationSeconds: number }[]>()
    .notNull()
    .default([]),
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  materials: jsonb("materials").$type<string[]>().notNull().default([]),
  narrationEn: text("narration_en").notNull().default(""),
  narrationTa: text("narration_ta").notNull().default(""),
  videoDurationSeconds: integer("video_duration_seconds").notNull().default(15),
  isDangerous: boolean("is_dangerous").notNull().default(false),
  dangerCategory: text("danger_category"),
  generatedVideoUrl: text("generated_video_url"),
  audioNarrationUrlEn: text("audio_narration_url_en"),
  audioNarrationUrlTa: text("audio_narration_url_ta"),
  status: repairStatusEnum("status").notNull().default("analyzing"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const savedRepairGuides = pgTable("saved_repair_guides", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repairRequestId: text("repair_request_id").references(() => repairRequests.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("easy"),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull().default(15),
  estimatedCostMin: integer("estimated_cost_min").notNull().default(0),
  estimatedCostMax: integer("estimated_cost_max").notNull().default(0),
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  materials: jsonb("materials").$type<string[]>().notNull().default([]),
  steps: jsonb("steps")
    .$type<{ order: number; title: string; description: string; durationSeconds: number }[]>()
    .notNull()
    .default([]),
  safetyNotes: jsonb("safety_notes").$type<string[]>().notNull().default([]),
  videoUrl: text("video_url"),
  coverImageUrl: text("cover_image_url"),
  userNotes: text("user_notes").notNull().default(""),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const escalations = pgTable("escalations", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repairRequestId: text("repair_request_id")
    .notNull()
    .references(() => repairRequests.id, { onDelete: "cascade" }),
  technicianId: text("technician_id").references(() => technicians.id, {
    onDelete: "set null",
  }),
  reason: text("reason").notNull(),
  urgency: urgencyEnum("urgency").notNull().default("medium"),
  status: escalationStatusEnum("status").notNull().default("pending"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repairRequestId: text("repair_request_id").references(() => repairRequests.id, {
    onDelete: "cascade",
  }),
  action: text("action").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = InferSelectModel<typeof users>;
export type RepairRequest = InferSelectModel<typeof repairRequests>;
export type SavedRepairGuide = InferSelectModel<typeof savedRepairGuides>;
export type Technician = InferSelectModel<typeof technicians>;
export type Escalation = InferSelectModel<typeof escalations>;
export type ActivityLogEntry = InferSelectModel<typeof activityLog>;
