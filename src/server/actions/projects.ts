"use server";

import { ProjectHealth, ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";
import { defaultProjectSectionNames } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { areaSchema, projectSchema, projectSectionSchema } from "@/lib/validators";

async function buildUniqueProjectSlug(userId: string, name: string, currentId?: string) {
  const base = slugify(name) || "project";
  let slug = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.project.findFirst({
      where: {
        userId,
        slug,
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

async function buildUniqueAreaSlug(userId: string, name: string, currentId?: string) {
  const base = slugify(name) || "area";
  let slug = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.area.findFirst({
      where: {
        userId,
        slug,
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

async function resolveOwnedAreaId(userId: string, areaId?: string | null) {
  if (!areaId) {
    return null;
  }

  const area = await prisma.area.findFirst({
    where: {
      id: areaId,
      userId,
    },
    select: { id: true },
  });

  return area?.id ?? null;
}

async function createDefaultSections(projectId: string) {
  await Promise.all(
    defaultProjectSectionNames.map((name, position) =>
      prisma.projectSection.create({
        data: {
          projectId,
          name,
          position,
        },
      }),
    ),
  );
}

function revalidateProjectPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/items");
  revalidatePath("/projects");
  if (id) {
    revalidatePath(`/projects/${id}`);
  }
}

function maybeRedirect(formData: FormData) {
  const redirectTo = formData.get("redirectTo");
  if (typeof redirectTo === "string" && redirectTo) {
    redirect(redirectTo);
  }
}

export async function createProjectAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = projectSchema.parse({
    name: formData.get("name"),
    areaId: formData.get("areaId") || null,
    status: formData.get("status") || ProjectStatus.active,
    health: formData.get("health") || ProjectHealth.on_track,
    pinned: formData.get("pinned") === "on",
    clientName: formData.get("clientName"),
    description: formData.get("description"),
    targetOutcome: formData.get("targetOutcome"),
    notes: formData.get("notes"),
  });
  const areaId = await resolveOwnedAreaId(user.id, parsed.areaId);

  const [slug, maxOrder] = await Promise.all([
    buildUniqueProjectSlug(user.id, parsed.name),
    prisma.project.aggregate({
      where: { userId: user.id },
      _max: { sortOrder: true },
    }),
  ]);

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: parsed.name,
      slug,
      areaId,
      status: parsed.status,
      health: parsed.health,
      pinned: parsed.pinned,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      clientName: parsed.clientName || null,
      description: parsed.description || null,
      targetOutcome: parsed.targetOutcome || null,
      notes: parsed.notes || null,
    },
  });

  await createDefaultSections(project.id);
  revalidateProjectPaths(project.id);
  maybeRedirect(formData);
}

export async function updateProjectAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing project id.");
  }

  const parsed = projectSchema.parse({
    id,
    name: formData.get("name"),
    areaId: formData.get("areaId") || null,
    status: formData.get("status") || ProjectStatus.active,
    health: formData.get("health") || ProjectHealth.on_track,
    pinned: formData.get("pinned") === "on",
    clientName: formData.get("clientName"),
    description: formData.get("description"),
    targetOutcome: formData.get("targetOutcome"),
    notes: formData.get("notes"),
  });
  const areaId = await resolveOwnedAreaId(user.id, parsed.areaId);

  const slug = await buildUniqueProjectSlug(user.id, parsed.name, parsed.id);

  await prisma.project.updateMany({
    where: { id: parsed.id, userId: user.id },
    data: {
      name: parsed.name,
      slug,
      areaId,
      status: parsed.status,
      health: parsed.health,
      pinned: parsed.pinned,
      clientName: parsed.clientName || null,
      description: parsed.description || null,
      targetOutcome: parsed.targetOutcome || null,
      notes: parsed.notes || null,
    },
  });

  revalidateProjectPaths(parsed.id);
  maybeRedirect(formData);
}

export async function toggleProjectPinAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing project id.");
  }

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    select: { id: true, pinned: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  await prisma.project.update({
    where: { id },
    data: { pinned: !project.pinned },
  });

  revalidateProjectPaths(id);
  maybeRedirect(formData);
}

export async function createProjectSectionAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = projectSectionSchema.parse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
  });

  const project = await prisma.project.findFirst({
    where: {
      id: parsed.projectId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const maxPosition = await prisma.projectSection.aggregate({
    where: { projectId: parsed.projectId },
    _max: { position: true },
  });

  await prisma.projectSection.create({
    data: {
      projectId: parsed.projectId,
      name: parsed.name,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  revalidateProjectPaths(parsed.projectId);
  maybeRedirect(formData);
}

export async function deleteProjectAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing project id.");
  }

  await prisma.project.deleteMany({
    where: { id, userId: user.id },
  });

  revalidateProjectPaths();
  redirect("/projects");
}

export async function createAreaAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = areaSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color") || "#1f7a78",
  });

  const slug = await buildUniqueAreaSlug(user.id, parsed.name);

  await prisma.area.create({
    data: {
      userId: user.id,
      name: parsed.name,
      slug,
      description: parsed.description || null,
      color: parsed.color,
    },
  });

  revalidateProjectPaths();
}

export async function updateAreaAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing area id.");
  }

  const parsed = areaSchema.parse({
    id,
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color") || "#1f7a78",
  });

  const slug = await buildUniqueAreaSlug(user.id, parsed.name, parsed.id);

  await prisma.area.updateMany({
    where: { id: parsed.id, userId: user.id },
    data: {
      name: parsed.name,
      slug,
      description: parsed.description || null,
      color: parsed.color,
    },
  });

  revalidateProjectPaths();
}

export async function deleteAreaAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing area id.");
  }

  await prisma.area.deleteMany({
    where: { id, userId: user.id },
  });

  revalidateProjectPaths();
}
