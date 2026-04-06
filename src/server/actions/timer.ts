"use server";

import { SessionSource, WorkItemStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { minutesBetween } from "@/lib/utils";
import { manualSessionSchema } from "@/lib/validators";

function revalidateTimerPaths() {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/items");
  revalidatePath("/timer");
  revalidatePath("/review/daily");
}

async function resolveOwnedWorkItemId(
  userId: string,
  workItemId?: string | null,
) {
  if (!workItemId) {
    return null;
  }

  const workItem = await prisma.workItem.findFirst({
    where: {
      id: workItemId,
      userId,
    },
    select: { id: true },
  });

  return workItem?.id ?? null;
}

export async function startTimerAction(formData: FormData) {
  const user = await requireCurrentUser();
  const workItemIdValue = formData.get("workItemId");
  const requestedWorkItemId =
    typeof workItemIdValue === "string" && workItemIdValue
      ? workItemIdValue
      : null;
  const workItemId = await resolveOwnedWorkItemId(user.id, requestedWorkItemId);
  const notes =
    typeof formData.get("sessionNotes") === "string"
      ? formData.get("sessionNotes")
      : null;
  const isDeepWork = formData.get("isDeepWork") === "on";

  await prisma.timeSession.updateMany({
    where: {
      userId: user.id,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  });

  if (workItemId) {
    await prisma.workItem.updateMany({
      where: {
        id: workItemId,
        userId: user.id,
      },
      data: {
        status: WorkItemStatus.in_progress,
      },
    });
  }

  await prisma.timeSession.create({
    data: {
      userId: user.id,
      workItemId,
      startedAt: new Date(),
      sessionNotes:
        typeof notes === "string" && notes.trim() ? notes.trim() : null,
      isDeepWork,
      source: SessionSource.timer,
    },
  });

  revalidateTimerPaths();
}

export async function stopTimerAction(formData: FormData) {
  const user = await requireCurrentUser();
  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string" || !sessionId) {
    throw new Error("Missing session id.");
  }

  const sessionNotes =
    typeof formData.get("sessionNotes") === "string"
      ? formData.get("sessionNotes")
      : null;
  const interruptionReason =
    typeof formData.get("interruptionReason") === "string"
      ? formData.get("interruptionReason")
      : null;

  await prisma.timeSession.updateMany({
    where: {
      id: sessionId,
      userId: user.id,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
      sessionNotes:
        typeof sessionNotes === "string" && sessionNotes.trim()
          ? sessionNotes.trim()
          : null,
      interruptionReason:
        typeof interruptionReason === "string" && interruptionReason.trim()
          ? interruptionReason.trim()
          : null,
    },
  });

  revalidateTimerPaths();
}

export async function createManualSessionAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = manualSessionSchema.parse({
    workItemId: formData.get("workItemId") || null,
    startedAt: formData.get("startedAt"),
    endedAt: formData.get("endedAt"),
    sessionNotes: formData.get("sessionNotes"),
    interruptionReason: formData.get("interruptionReason"),
    isDeepWork: formData.get("isDeepWork") === "on",
  });

  const startedAt = new Date(parsed.startedAt);
  const endedAt = new Date(parsed.endedAt);

  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) {
    throw new Error("Invalid session timestamps.");
  }

  if (minutesBetween(startedAt, endedAt) === 0) {
    throw new Error("Session duration must be greater than zero.");
  }

  const workItemId = await resolveOwnedWorkItemId(user.id, parsed.workItemId);

  if (workItemId) {
    await prisma.workItem.updateMany({
      where: {
        id: workItemId,
        userId: user.id,
        status: WorkItemStatus.inbox,
      },
      data: {
        status: WorkItemStatus.planned,
      },
    });
  }

  await prisma.timeSession.create({
    data: {
      userId: user.id,
      workItemId,
      startedAt,
      endedAt,
      sessionNotes: parsed.sessionNotes || null,
      interruptionReason: parsed.interruptionReason || null,
      isDeepWork: parsed.isDeepWork,
      source: SessionSource.manual,
    },
  });

  revalidateTimerPaths();
}

export async function deleteTimeSessionAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing session id.");
  }

  await prisma.timeSession.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidateTimerPaths();
}
