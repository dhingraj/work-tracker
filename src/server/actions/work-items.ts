"use server";

import { RecurrenceRule, WorkItemStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getNextRecurringDate,
  parseOptionalDate,
  parseOptionalInt,
  slugify,
} from "@/lib/utils";
import { subtaskSchema, workItemSchema } from "@/lib/validators";

function getTagIds(formData: FormData) {
  return formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string" && Boolean(value));
}

function getNewTagNames(formData: FormData) {
  const raw = formData.get("newTags");
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function revalidateWorkItemPaths(id?: string, projectId?: string) {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/items");
  revalidatePath("/projects");
  revalidatePath("/timer");
  revalidatePath("/review/daily");
  if (id) {
    revalidatePath(`/items/${id}`);
  }
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

function maybeRedirect(formData: FormData) {
  const redirectTo = formData.get("redirectTo");
  if (typeof redirectTo === "string" && redirectTo) {
    redirect(redirectTo);
  }
}

async function resolveOwnedProjectId(userId: string, projectId?: string | null) {
  if (!projectId) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: { id: true },
  });

  return project?.id ?? null;
}

async function resolveTagIds(userId: string, formData: FormData) {
  const existingTagIds = getTagIds(formData);
  const newTagNames = getNewTagNames(formData);
  const createdTagIds: string[] = [];
  const ownedExistingTagIds = existingTagIds.length
    ? (
        await prisma.tag.findMany({
          where: {
            userId,
            id: {
              in: existingTagIds,
            },
          },
          select: { id: true },
        })
      ).map((tag) => tag.id)
    : [];

  for (const tagName of newTagNames) {
    const created = await prisma.tag.upsert({
      where: {
        userId_name: {
          userId,
          name: tagName,
        },
      },
      update: {},
      create: {
        userId,
        name: tagName,
        color: "#d6a859",
      },
    });
    createdTagIds.push(created.id);
  }

  return Array.from(new Set([...ownedExistingTagIds, ...createdTagIds]));
}

async function syncTags(workItemId: string, tagIds: string[]) {
  await prisma.workItemTag.deleteMany({
    where: { workItemId },
  });

  if (tagIds.length) {
    await prisma.workItemTag.createMany({
      data: tagIds.map((tagId) => ({
        workItemId,
        tagId,
      })),
    });
  }
}

async function resolveSectionAssignment(
  userId: string,
  projectId?: string | null,
  sectionId?: string | null,
) {
  const ownedProjectId = await resolveOwnedProjectId(userId, projectId);

  if (!sectionId) {
    return {
      projectId: ownedProjectId,
      sectionId: null,
    };
  }

  const section = await prisma.projectSection.findFirst({
    where: {
      id: sectionId,
      project: {
        userId,
      },
    },
    select: {
      id: true,
      projectId: true,
      name: true,
    },
  });

  if (!section) {
    return {
      projectId: ownedProjectId,
      sectionId: null,
    };
  }

  if (ownedProjectId && section.projectId !== ownedProjectId) {
    return {
      projectId: ownedProjectId,
      sectionId: null,
    };
  }

  return {
    projectId: ownedProjectId ?? section.projectId,
    sectionId: section.id,
  };
}

async function getRecurringTargetSectionId(projectId: string | null, sectionId: string | null) {
  if (!projectId || !sectionId) {
    return sectionId;
  }

  const currentSection = await prisma.projectSection.findFirst({
    where: { id: sectionId, projectId },
    select: { name: true },
  });

  if (!currentSection || currentSection.name.toLowerCase() !== "done") {
    return sectionId;
  }

  const fallback = await prisma.projectSection.findFirst({
    where: {
      projectId,
      name: {
        not: "Done",
      },
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  return fallback?.id ?? null;
}

async function createNextRecurringItem(
  userId: string,
  item: {
    id: string;
    title: string;
    projectId: string | null;
    sectionId: string | null;
    status: WorkItemStatus;
    priority: import("@prisma/client").WorkItemPriority;
    dueDate: Date | null;
    estimateMinutes: number | null;
    notes: string | null;
    recurring: boolean;
    recurrenceRule: RecurrenceRule | null;
    tags: Array<{ tagId: string }>;
    subtasks: Array<{ title: string; position: number }>;
  },
) {
  if (!item.recurring || !item.recurrenceRule) {
    return;
  }

  const nextDueDate = getNextRecurringDate(item.dueDate, item.recurrenceRule);
  const targetSectionId = await getRecurringTargetSectionId(item.projectId, item.sectionId);

  const nextItem = await prisma.workItem.create({
    data: {
      userId,
      title: item.title,
      projectId: item.projectId,
      sectionId: targetSectionId,
      status: item.projectId ? WorkItemStatus.planned : WorkItemStatus.inbox,
      priority: item.priority,
      dueDate: nextDueDate,
      estimateMinutes: item.estimateMinutes,
      notes: item.notes,
      recurring: true,
      recurrenceRule: item.recurrenceRule,
    },
  });

  if (item.tags.length) {
    await prisma.workItemTag.createMany({
      data: item.tags.map((tag) => ({
        workItemId: nextItem.id,
        tagId: tag.tagId,
      })),
    });
  }

  await Promise.all(
    item.subtasks.map((subtask) =>
      prisma.subtask.create({
        data: {
          workItemId: nextItem.id,
          title: subtask.title,
          position: subtask.position,
        },
      }),
    ),
  );
}

async function updateWorkItemStatusInternal(
  userId: string,
  itemId: string,
  status: WorkItemStatus,
) {
  const existing = await prisma.workItem.findFirst({
    where: { id: itemId, userId },
    include: {
      tags: {
        select: {
          tagId: true,
        },
      },
      subtasks: {
        select: {
          title: true,
          position: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Work item not found.");
  }

  await prisma.workItem.update({
    where: { id: itemId },
    data: {
      status,
      completedAt:
        status === WorkItemStatus.done
          ? existing.completedAt ?? new Date()
          : status === WorkItemStatus.archived
            ? existing.completedAt
            : null,
    },
  });

  if (existing.status !== WorkItemStatus.done && status === WorkItemStatus.done) {
    await createNextRecurringItem(userId, existing);
  }

  revalidateWorkItemPaths(existing.id, existing.projectId ?? undefined);
  return existing;
}

export async function createWorkItemAction(formData: FormData) {
  const user = await requireCurrentUser();
  const recurrenceRuleValue = formData.get("recurrenceRule");
  const recurrenceRule =
    typeof recurrenceRuleValue === "string" && recurrenceRuleValue
      ? (recurrenceRuleValue as RecurrenceRule)
      : null;
  const parsed = workItemSchema.parse({
    title: formData.get("title"),
    projectId: formData.get("projectId") || null,
    sectionId: formData.get("sectionId") || null,
    status: formData.get("status") || WorkItemStatus.inbox,
    priority: formData.get("priority") || "medium",
    dueDate: parseOptionalDate(formData.get("dueDate")),
    estimateMinutes: parseOptionalInt(formData.get("estimateMinutes")),
    notes: formData.get("notes"),
    recurring: Boolean(recurrenceRule),
    recurrenceRule,
    tagIds: getTagIds(formData),
    newTags: getNewTagNames(formData),
  });

  const [tagIds, assignment] = await Promise.all([
    resolveTagIds(user.id, formData),
    resolveSectionAssignment(user.id, parsed.projectId, parsed.sectionId),
  ]);

  const item = await prisma.workItem.create({
    data: {
      userId: user.id,
      title: parsed.title,
      projectId: assignment.projectId,
      sectionId: assignment.sectionId,
      status: parsed.status,
      priority: parsed.priority,
      dueDate: parsed.dueDate ?? null,
      estimateMinutes: parsed.estimateMinutes ?? null,
      notes: parsed.notes || null,
      recurring: Boolean(parsed.recurrenceRule),
      recurrenceRule: parsed.recurrenceRule ?? null,
      completedAt: parsed.status === WorkItemStatus.done ? new Date() : null,
    },
  });

  await syncTags(item.id, tagIds);
  revalidateWorkItemPaths(item.id, assignment.projectId ?? undefined);
  maybeRedirect(formData);
}

export async function quickCaptureAction(formData: FormData) {
  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim()) {
    return;
  }

  const user = await requireCurrentUser();
  const projectIdValue = formData.get("projectId");
  const sectionIdValue = formData.get("sectionId");
  const notesValue = formData.get("notes");
  const statusValue = formData.get("status");
  const status =
    typeof statusValue === "string" && Object.values(WorkItemStatus).includes(statusValue as WorkItemStatus)
      ? (statusValue as WorkItemStatus)
      : WorkItemStatus.inbox;
  const assignment = await resolveSectionAssignment(
    user.id,
    typeof projectIdValue === "string" ? projectIdValue : null,
    typeof sectionIdValue === "string" ? sectionIdValue : null,
  );

  const item = await prisma.workItem.create({
    data: {
      userId: user.id,
      title: title.trim(),
      projectId: assignment.projectId,
      sectionId: assignment.sectionId,
      status,
      dueDate: parseOptionalDate(formData.get("dueDate")),
      notes: typeof notesValue === "string" && notesValue.trim() ? notesValue.trim() : null,
    },
  });

  revalidateWorkItemPaths(item.id, assignment.projectId ?? undefined);
  maybeRedirect(formData);
}

export async function updateWorkItemAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing work item id.");
  }

  const recurrenceRuleValue = formData.get("recurrenceRule");
  const recurrenceRule =
    typeof recurrenceRuleValue === "string" && recurrenceRuleValue
      ? (recurrenceRuleValue as RecurrenceRule)
      : null;
  const parsed = workItemSchema.parse({
    id,
    title: formData.get("title"),
    projectId: formData.get("projectId") || null,
    sectionId: formData.get("sectionId") || null,
    status: formData.get("status") || WorkItemStatus.inbox,
    priority: formData.get("priority") || "medium",
    dueDate: parseOptionalDate(formData.get("dueDate")),
    estimateMinutes: parseOptionalInt(formData.get("estimateMinutes")),
    notes: formData.get("notes"),
    recurring: Boolean(recurrenceRule),
    recurrenceRule,
    tagIds: getTagIds(formData),
    newTags: getNewTagNames(formData),
  });

  const existing = await prisma.workItem.findFirst({
    where: { id, userId: user.id },
    include: {
      tags: {
        select: {
          tagId: true,
        },
      },
      subtasks: {
        select: {
          title: true,
          position: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Work item not found.");
  }

  const [tagIds, assignment] = await Promise.all([
    resolveTagIds(user.id, formData),
    resolveSectionAssignment(user.id, parsed.projectId, parsed.sectionId),
  ]);

  await prisma.workItem.update({
    where: { id },
    data: {
      title: parsed.title,
      projectId: assignment.projectId,
      sectionId: assignment.sectionId,
      status: parsed.status,
      priority: parsed.priority,
      dueDate: parsed.dueDate ?? null,
      estimateMinutes: parsed.estimateMinutes ?? null,
      notes: parsed.notes || null,
      recurring: Boolean(parsed.recurrenceRule),
      recurrenceRule: parsed.recurrenceRule ?? null,
      completedAt:
        parsed.status === WorkItemStatus.done
          ? existing.completedAt ?? new Date()
          : null,
    },
  });

  await syncTags(id, tagIds);

  if (existing.status !== WorkItemStatus.done && parsed.status === WorkItemStatus.done) {
    await createNextRecurringItem(user.id, {
      ...existing,
      title: parsed.title,
      projectId: assignment.projectId,
      sectionId: assignment.sectionId,
      priority: parsed.priority,
      dueDate: parsed.dueDate ?? null,
      estimateMinutes: parsed.estimateMinutes ?? null,
      notes: parsed.notes || null,
      recurring: Boolean(parsed.recurrenceRule),
      recurrenceRule: parsed.recurrenceRule ?? null,
    });
  }

  revalidateWorkItemPaths(id, assignment.projectId ?? existing.projectId ?? undefined);
  maybeRedirect(formData);
}

export async function setWorkItemStatusAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  const statusValue = formData.get("status");

  if (typeof id !== "string" || !id) {
    throw new Error("Missing work item id.");
  }

  if (
    typeof statusValue !== "string" ||
    !Object.values(WorkItemStatus).includes(statusValue as WorkItemStatus)
  ) {
    throw new Error("Invalid work item status.");
  }

  await updateWorkItemStatusInternal(user.id, id, statusValue as WorkItemStatus);
  maybeRedirect(formData);
}

export async function rescheduleWorkItemAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing work item id.");
  }

  const dueDate = parseOptionalDate(formData.get("dueDate"));
  const item = await prisma.workItem.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!item) {
    throw new Error("Work item not found.");
  }

  await prisma.workItem.update({
    where: { id },
    data: {
      dueDate,
      status: dueDate ? undefined : WorkItemStatus.inbox,
    },
  });

  revalidateWorkItemPaths(item.id, item.projectId ?? undefined);
  maybeRedirect(formData);
}

export async function archiveWorkItemAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing work item id.");
  }

  await updateWorkItemStatusInternal(user.id, id, WorkItemStatus.archived);
  maybeRedirect(formData);
}

export async function archiveCompletedItemsAction(formData: FormData) {
  const user = await requireCurrentUser();
  const projectId = formData.get("projectId");

  await prisma.workItem.updateMany({
    where: {
      userId: user.id,
      status: WorkItemStatus.done,
      ...(typeof projectId === "string" && projectId ? { projectId } : {}),
    },
    data: {
      status: WorkItemStatus.archived,
    },
  });

  revalidateWorkItemPaths(undefined, typeof projectId === "string" ? projectId : undefined);
  maybeRedirect(formData);
}

export async function deleteWorkItemAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing work item id.");
  }

  const item = await prisma.workItem.findFirst({
    where: { id, userId: user.id },
    select: { projectId: true },
  });

  await prisma.workItem.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidateWorkItemPaths(id, item?.projectId ?? undefined);
  maybeRedirect(formData);
  redirect("/items");
}

export async function createSubtaskAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = subtaskSchema.parse({
    workItemId: formData.get("workItemId"),
    title: formData.get("title"),
  });

  const workItem = await prisma.workItem.findFirst({
    where: {
      id: parsed.workItemId,
      userId: user.id,
    },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!workItem) {
    throw new Error("Work item not found.");
  }

  const maxPosition = await prisma.subtask.aggregate({
    where: { workItemId: parsed.workItemId },
    _max: { position: true },
  });

  await prisma.subtask.create({
    data: {
      workItemId: parsed.workItemId,
      title: parsed.title,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  revalidateWorkItemPaths(workItem.id, workItem.projectId ?? undefined);
  maybeRedirect(formData);
}

export async function toggleSubtaskAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing subtask id.");
  }

  const subtask = await prisma.subtask.findFirst({
    where: {
      id,
      workItem: {
        userId: user.id,
      },
    },
    include: {
      workItem: {
        select: {
          id: true,
          projectId: true,
        },
      },
    },
  });

  if (!subtask) {
    throw new Error("Subtask not found.");
  }

  await prisma.subtask.update({
    where: { id },
    data: {
      completedAt: subtask.completedAt ? null : new Date(),
    },
  });

  revalidateWorkItemPaths(subtask.workItem.id, subtask.workItem.projectId ?? undefined);
  maybeRedirect(formData);
}

export async function deleteSubtaskAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing subtask id.");
  }

  const subtask = await prisma.subtask.findFirst({
    where: {
      id,
      workItem: {
        userId: user.id,
      },
    },
    include: {
      workItem: {
        select: {
          id: true,
          projectId: true,
        },
      },
    },
  });

  if (!subtask) {
    throw new Error("Subtask not found.");
  }

  await prisma.subtask.delete({
    where: { id },
  });

  revalidateWorkItemPaths(subtask.workItem.id, subtask.workItem.projectId ?? undefined);
  maybeRedirect(formData);
}

export async function createTagAction(formData: FormData) {
  const user = await requireCurrentUser();
  const name = formData.get("name");
  const color = formData.get("color");

  if (typeof name !== "string" || !name.trim()) {
    return;
  }

  await prisma.tag.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: name.trim(),
      },
    },
    update: {
      color: typeof color === "string" && color ? color : "#d6a859",
    },
    create: {
      userId: user.id,
      name: name.trim(),
      color: typeof color === "string" && color ? color : "#d6a859",
    },
  });

  revalidateWorkItemPaths();
  revalidatePath("/settings");
}

export async function deleteTagAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing tag id.");
  }

  await prisma.tag.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidateWorkItemPaths();
  revalidatePath("/settings");
}

export async function quickProjectFromTitleAction(formData: FormData) {
  const user = await requireCurrentUser();
  const name = formData.get("name");

  if (typeof name !== "string" || !name.trim()) {
    return;
  }

  await prisma.project.upsert({
    where: {
      userId_slug: {
        userId: user.id,
        slug: slugify(name),
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: name.trim(),
      slug: slugify(name),
    },
  });

  revalidateWorkItemPaths();
}
