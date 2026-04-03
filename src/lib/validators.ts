import {
  ProjectHealth,
  ProjectStatus,
  RecurrenceRule,
  WorkItemPriority,
  WorkItemStatus,
} from "@prisma/client";
import { z } from "zod";

export const workItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  projectId: z.string().trim().optional().nullable(),
  sectionId: z.string().trim().optional().nullable(),
  status: z.nativeEnum(WorkItemStatus),
  priority: z.nativeEnum(WorkItemPriority),
  dueDate: z.date().optional().nullable(),
  estimateMinutes: z.number().int().min(0).max(24 * 60).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
  recurring: z.boolean().default(false),
  recurrenceRule: z.nativeEnum(RecurrenceRule).optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  newTags: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  areaId: z.string().trim().optional().nullable(),
  status: z.nativeEnum(ProjectStatus),
  health: z.nativeEnum(ProjectHealth),
  pinned: z.boolean().default(false),
  clientName: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  targetOutcome: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(3000).optional().nullable(),
});

export const areaSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  color: z.string().trim().min(4).max(20).default("#1f7a78"),
});

export const projectSectionSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(80),
});

export const subtaskSchema = z.object({
  id: z.string().optional(),
  workItemId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(160),
});

export const manualSessionSchema = z.object({
  workItemId: z.string().trim().optional().nullable(),
  startedAt: z.string().trim().min(1),
  endedAt: z.string().trim().min(1),
  sessionNotes: z.string().trim().max(1000).optional().nullable(),
  interruptionReason: z.string().trim().max(240).optional().nullable(),
  isDeepWork: z.boolean().default(false),
});

export const dailyPlanSchema = z.object({
  top1Id: z.string().trim().optional().nullable(),
  top2Id: z.string().trim().optional().nullable(),
  top3Id: z.string().trim().optional().nullable(),
  note: z.string().trim().max(1200).optional().nullable(),
});

export const dailyReviewSchema = z.object({
  completed: z.string().trim().max(2000).optional().nullable(),
  blocked: z.string().trim().max(2000).optional().nullable(),
  lessons: z.string().trim().max(2000).optional().nullable(),
  carryForward: z.string().trim().max(2000).optional().nullable(),
  energyScore: z.number().int().min(1).max(5).optional().nullable(),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  timezone: z.string().trim().min(3).max(80),
  dailyTargetMinutes: z.number().int().min(30).max(24 * 60),
  deepWorkTarget: z.number().int().min(0).max(12),
  defaultSessionMinutes: z.number().int().min(10).max(180),
  weekStartsOn: z.number().int().min(0).max(6),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email(),
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
