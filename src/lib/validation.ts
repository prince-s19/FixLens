import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const createRepairSchema = z.object({
  title: z.string().trim().min(2).max(120),
  category: z.string().min(1),
  description: z.string().trim().max(600).optional().default(""),
  photoBeforeUrl: z.string().min(1, "A photo is required"),
});

export const updateRepairSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(600).optional(),
  status: z.enum(["analyzing", "ready", "in_progress", "completed", "escalated"]).optional(),
  photoAfterUrl: z.string().min(1).optional(),
});

export const createEscalationSchema = z.object({
  repairRequestId: z.string().min(1),
  reason: z.string().trim().min(3).max(500),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  technicianId: z.string().optional().nullable(),
});

export const updateEscalationSchema = z.object({
  status: z.enum(["pending", "accepted", "in_progress", "resolved", "cancelled"]).optional(),
  technicianId: z.string().nullable().optional(),
  notes: z.string().trim().max(600).optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
});

export const createTechnicianSchema = z.object({
  name: z.string().trim().min(2).max(100),
  specialty: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  yearsExperience: z.coerce.number().int().min(0).max(60).default(1),
  available: z.boolean().optional().default(true),
  notes: z.string().trim().max(400).optional().default(""),
});

export const updateTechnicianSchema = createTechnicianSchema.partial();

export const createGuideSchema = z.object({
  repairRequestId: z.string().optional().nullable(),
  title: z.string().trim().min(2).max(140),
  category: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  estimatedTimeMinutes: z.coerce.number().int().min(1).max(360).default(15),
  estimatedCostMin: z.coerce.number().int().min(0).default(0),
  estimatedCostMax: z.coerce.number().int().min(0).default(0),
  tools: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  steps: z
    .array(
      z.object({
        order: z.number(),
        title: z.string(),
        description: z.string(),
        durationSeconds: z.number().default(3),
      }),
    )
    .default([]),
  safetyNotes: z.array(z.string()).default([]),
  videoUrl: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  userNotes: z.string().trim().max(1000).optional().default(""),
  tags: z.array(z.string()).default([]),
});

export const updateGuideSchema = createGuideSchema.partial().extend({
  isBookmarked: z.boolean().optional(),
});

