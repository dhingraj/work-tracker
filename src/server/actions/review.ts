"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dayKey } from "@/lib/utils";
import { dailyPlanSchema, dailyReviewSchema } from "@/lib/validators";

function revalidateReviewPaths() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/review/daily");
}

function todayDate() {
  return new Date(`${dayKey()}T12:00:00`);
}

async function resolveOwnedPlanItemIds(
  userId: string,
  values: Array<string | null | undefined>,
) {
  const requestedIds = values.filter((value): value is string => typeof value === "string" && Boolean(value));
  if (requestedIds.length === 0) {
    return values.map(() => null);
  }

  const ownedIds = new Set(
    (
      await prisma.workItem.findMany({
        where: {
          userId,
          id: {
            in: requestedIds,
          },
        },
        select: { id: true },
      })
    ).map((item) => item.id),
  );

  return values.map((value) => (value && ownedIds.has(value) ? value : null));
}

export async function saveDailyPlanAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = dailyPlanSchema.parse({
    top1Id: formData.get("top1Id") || null,
    top2Id: formData.get("top2Id") || null,
    top3Id: formData.get("top3Id") || null,
    note: formData.get("note"),
  });
  const [top1Id, top2Id, top3Id] = await resolveOwnedPlanItemIds(user.id, [
    parsed.top1Id,
    parsed.top2Id,
    parsed.top3Id,
  ]);

  await prisma.dailyPlan.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: todayDate(),
      },
    },
    update: {
      top1Id,
      top2Id,
      top3Id,
      note: parsed.note || null,
    },
    create: {
      userId: user.id,
      date: todayDate(),
      top1Id,
      top2Id,
      top3Id,
      note: parsed.note || null,
    },
  });

  revalidateReviewPaths();
}

export async function saveDailyReviewAction(formData: FormData) {
  const user = await requireCurrentUser();
  const energyScoreRaw = formData.get("energyScore");
  const energyScore =
    typeof energyScoreRaw === "string" && energyScoreRaw
      ? Number.parseInt(energyScoreRaw, 10)
      : null;

  const parsed = dailyReviewSchema.parse({
    completed: formData.get("completed"),
    blocked: formData.get("blocked"),
    lessons: formData.get("lessons"),
    carryForward: formData.get("carryForward"),
    energyScore,
  });

  await prisma.dailyReview.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: todayDate(),
      },
    },
    update: {
      completed: parsed.completed || null,
      blocked: parsed.blocked || null,
      lessons: parsed.lessons || null,
      carryForward: parsed.carryForward || null,
      energyScore: parsed.energyScore ?? null,
    },
    create: {
      userId: user.id,
      date: todayDate(),
      completed: parsed.completed || null,
      blocked: parsed.blocked || null,
      lessons: parsed.lessons || null,
      carryForward: parsed.carryForward || null,
      energyScore: parsed.energyScore ?? null,
    },
  });

  revalidateReviewPaths();
}
