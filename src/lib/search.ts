import { ProjectStatus, WorkItemStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type SearchResults = {
  query: string;
  items: Array<{
    id: string;
    title: string;
    status: WorkItemStatus;
    priority: string;
    dueDate: Date | null;
    projectName: string | null;
    notes: string | null;
  }>;
  projects: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    openCount: number;
  }>;
};

export async function searchWorkspace(query: string): Promise<SearchResults> {
  const user = await requireCurrentUser();
  const q = query.trim();

  if (!q) {
    return { query: "", items: [], projects: [] };
  }

  const [rawItems, rawProjects] = await Promise.all([
    prisma.workItem.findMany({
      where: {
        userId: user.id,
        status: { not: WorkItemStatus.archived },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { notes: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        notes: true,
        project: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.project.findMany({
      where: {
        userId: user.id,
        status: { not: ProjectStatus.archived },
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        status: true,
        workItems: {
          where: {
            status: {
              notIn: [WorkItemStatus.done, WorkItemStatus.archived],
            },
          },
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    query: q,
    items: rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
      notes: item.notes,
      projectName: item.project?.name ?? null,
    })),
    projects: rawProjects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      openCount: p.workItems.length,
    })),
  };
}
