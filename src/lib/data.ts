import {
  Prisma,
  ProjectStatus,
  WorkItemPriority,
  WorkItemStatus,
} from "@prisma/client";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
} from "date-fns";

import {
  defaultProjectSectionNames,
  homeItemViewMeta,
  homeItemViewOrder,
  type HomeItemView,
} from "@/lib/constants";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  dayKey,
  endOfTodayLocal,
  isOpenWorkItemStatus,
  minutesBetween,
  monthKey,
  startOfTodayLocal,
} from "@/lib/utils";

const openWorkItemStatuses: WorkItemStatus[] = [
  WorkItemStatus.inbox,
  WorkItemStatus.planned,
  WorkItemStatus.in_progress,
  WorkItemStatus.blocked,
];

const projectOrderBy: Prisma.ProjectOrderByWithRelationInput[] = [
  { pinned: "desc" },
  { sortOrder: "asc" },
  { updatedAt: "desc" },
  { name: "asc" },
];

function isHomeItemView(value?: string): value is HomeItemView {
  return homeItemViewOrder.includes(value as HomeItemView);
}

function getItemViewWhere(
  view: HomeItemView,
  todayStart: Date,
  todayEnd: Date,
): Prisma.WorkItemWhereInput {
  switch (view) {
    case "today":
      return {
        status: { in: openWorkItemStatuses },
        dueDate: { gte: todayStart, lte: todayEnd },
      };
    case "scheduled":
      return {
        status: { in: openWorkItemStatuses },
        dueDate: { not: null },
      };
    case "all":
      return {
        status: { in: openWorkItemStatuses },
      };
    case "completed":
      return {
        status: WorkItemStatus.done,
      };
    case "blocked":
      return {
        status: WorkItemStatus.blocked,
      };
  }
}

function sumSessionMinutes(
  sessions: Array<{ startedAt: Date; endedAt: Date | null }>,
  now = new Date(),
) {
  return sessions.reduce((total, session) => {
    const end = session.endedAt ?? now;
    return total + minutesBetween(session.startedAt, end);
  }, 0);
}

async function ensureProjectSections(projectId: string) {
  const count = await prisma.projectSection.count({
    where: { projectId },
  });

  if (count > 0) {
    return;
  }

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

async function loadProjectsWithSections(userId: string, includeArchived = false) {
  let projects = await prisma.project.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { status: { not: ProjectStatus.archived } }),
    },
    include: {
      sections: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: projectOrderBy,
  });

  const missingSectionProjectIds = projects
    .filter((project) => project.sections.length === 0)
    .map((project) => project.id);

  if (missingSectionProjectIds.length) {
    await Promise.all(missingSectionProjectIds.map((projectId) => ensureProjectSections(projectId)));
    projects = await prisma.project.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { status: { not: ProjectStatus.archived } }),
      },
      include: {
        sections: {
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: projectOrderBy,
    });
  }

  return projects;
}

function getProjectProgress<T extends { status: WorkItemStatus; dueDate: Date | null; title: string }>(
  items: T[],
) {
  const openItems = items.filter((item) => isOpenWorkItemStatus(item.status));
  const blockedItems = items.filter((item) => item.status === WorkItemStatus.blocked);
  const doneItems = items.filter((item) => item.status === WorkItemStatus.done);
  const nextDueItems = openItems
    .filter((item) => item.dueDate)
    .sort((left, right) => left.dueDate!.getTime() - right.dueDate!.getTime())
    .slice(0, 2);

  return {
    openCount: openItems.length,
    doneCount: doneItems.length,
    blockedCount: blockedItems.length,
    nextDueItems,
  };
}

type CalendarTaskItem = {
  id: string;
  title: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  dueDate: Date | null;
  projectName: string | null;
};

type CalendarDay = {
  key: string;
  label: string;
  fullLabel: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: CalendarTaskItem[];
  statusSummary: Array<{ status: WorkItemStatus; count: number }>;
};

const calendarStatusOrder: WorkItemStatus[] = [
  WorkItemStatus.in_progress,
  WorkItemStatus.blocked,
  WorkItemStatus.planned,
  WorkItemStatus.inbox,
  WorkItemStatus.done,
];

export async function getWorkspaceScaffold() {
  const user = await requireCurrentUser();

  const [projects, areas, tags] = await Promise.all([
    loadProjectsWithSections(user.id),
    prisma.area.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    user,
    areas,
    tags,
    projects,
    sections: projects.flatMap((project) =>
      project.sections.map((section) => ({
        ...section,
        projectId: project.id,
        projectName: project.name,
      })),
    ),
  };
}

export async function getCalendarPageData(monthDate: Date) {
  const { user } = await getWorkspaceScaffold();
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const weekStartsOn = (
    user.weekStartsOn >= 0 && user.weekStartsOn <= 6 ? user.weekStartsOn : 0
  ) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

  const items = await prisma.workItem.findMany({
    where: {
      userId: user.id,
      status: { not: WorkItemStatus.archived },
      dueDate: {
        gte: startOfDay(gridStart),
        lte: endOfDay(gridEnd),
      },
    },
    include: {
      project: true,
    },
    orderBy: [{ dueDate: "asc" }, { status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
  });

  const itemsByDay = new Map<string, CalendarTaskItem[]>();

  for (const item of items) {
    if (!item.dueDate) {
      continue;
    }

    const key = dayKey(item.dueDate);
    const dayItems = itemsByDay.get(key) ?? [];
    dayItems.push({
      id: item.id,
      title: item.title,
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
      projectName: item.project?.name ?? null,
    });
    itemsByDay.set(key, dayItems);
  }

  const days: CalendarDay[] = eachDayOfInterval({
    start: gridStart,
    end: gridEnd,
  }).map((date) => {
    const key = dayKey(date);
    const dayItems = itemsByDay.get(key) ?? [];

    return {
      key,
      label: format(date, "d"),
      fullLabel: format(date, "EEEE, MMMM d"),
      isCurrentMonth: isSameMonth(date, monthStart),
      isToday: isToday(date),
      items: dayItems,
      statusSummary: calendarStatusOrder
        .map((status) => ({
          status,
          count: dayItems.filter((item) => item.status === status).length,
        }))
        .filter((entry) => entry.count > 0),
    };
  });

  const currentMonthItems = items.filter(
    (item) => item.dueDate && isSameMonth(item.dueDate, monthStart),
  );

  return {
    user,
    monthLabel: format(monthStart, "MMMM yyyy"),
    monthKey: monthKey(monthStart),
    previousMonthKey: monthKey(subMonths(monthStart, 1)),
    nextMonthKey: monthKey(addMonths(monthStart, 1)),
    weekDayLabels: Array.from({ length: 7 }, (_, index) =>
      format(addDays(gridStart, index), "EEE"),
    ),
    todayKey: dayKey(),
    days,
    summary: {
      scheduled: currentMonthItems.filter((item) => item.status !== WorkItemStatus.done).length,
      inProgress: currentMonthItems.filter(
        (item) => item.status === WorkItemStatus.in_progress,
      ).length,
      blocked: currentMonthItems.filter((item) => item.status === WorkItemStatus.blocked).length,
      done: currentMonthItems.filter((item) => item.status === WorkItemStatus.done).length,
    },
  };
}

export async function getDashboardData() {
  const { user } = await getWorkspaceScaffold();
  const todayStart = startOfTodayLocal();
  const todayEnd = endOfTodayLocal();
  const [counts, projects] = await Promise.all([
    Promise.all(
      homeItemViewOrder.map((view) =>
        prisma.workItem.count({
          where: {
            userId: user.id,
            ...getItemViewWhere(view, todayStart, todayEnd),
          },
        }),
      ),
    ),
    prisma.project.findMany({
      where: {
        userId: user.id,
        status: { not: ProjectStatus.archived },
      },
      include: {
        area: true,
        workItems: {
          where: {
            status: { not: WorkItemStatus.archived },
          },
          select: {
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: projectOrderBy,
    }),
  ]);

  return {
    user,
    dateLabel: format(todayStart, "EEEE, MMMM d"),
    categories: homeItemViewOrder.map((view, index) => ({
      key: view,
      ...homeItemViewMeta[view],
      count: counts[index],
    })),
    projects: projects.map((project) => {
      const progress = getProjectProgress(project.workItems);
      const dueTodayItems = project.workItems.filter(
        (item) =>
          item.dueDate &&
          item.dueDate >= todayStart &&
          item.dueDate <= todayEnd &&
          isOpenWorkItemStatus(item.status),
      ).length;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        health: project.health,
        pinned: project.pinned,
        areaName: project.area?.name ?? null,
        dueTodayItems,
        ...progress,
      };
    }),
  };
}

export type ItemFilters = {
  q?: string;
  status?: string;
  projectId?: string;
  date?: string;
  overdue?: string;
  view?: string;
};

export async function getItemsPageData(filters: ItemFilters = {}) {
  const { user, projects, tags } = await getWorkspaceScaffold();
  const andFilters: Prisma.WorkItemWhereInput[] = [];
  const activeView = isHomeItemView(filters.view) ? filters.view : null;
  const todayStart = startOfTodayLocal();
  const todayEnd = endOfTodayLocal();

  if (filters.projectId) {
    andFilters.push({ projectId: filters.projectId });
  }

  if (activeView) {
    andFilters.push(getItemViewWhere(activeView, todayStart, todayEnd));
  }

  if (
    filters.status &&
    Object.values(WorkItemStatus).includes(filters.status as WorkItemStatus)
  ) {
    andFilters.push({ status: filters.status as WorkItemStatus });
  }

  if (filters.date) {
    const date = new Date(`${filters.date}T12:00:00`);
    if (!Number.isNaN(date.getTime())) {
      andFilters.push({
        dueDate: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      });
    }
  }

  if (filters.overdue === "1") {
    andFilters.push({
      dueDate: { lt: todayStart },
      status: { in: openWorkItemStatuses },
    });
  }

  if (!activeView && !filters.status) {
    andFilters.push({
      status: { in: openWorkItemStatuses },
    });
  }

  const where: Prisma.WorkItemWhereInput = {
    userId: user.id,
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { notes: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(andFilters.length ? { AND: andFilters } : {}),
  };

  const items = await prisma.workItem.findMany({
    where,
    include: {
      project: true,
      section: true,
      tags: { include: { tag: true } },
      subtasks: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      },
      sessions: {
        select: {
          startedAt: true,
          endedAt: true,
        },
      },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
  });

  return {
    user,
    projects,
    tags,
    activeView,
    items: items.map((item) => ({
      ...item,
      actualMinutes: sumSessionMinutes(item.sessions),
      completedSubtasks: item.subtasks.filter((subtask) => subtask.completedAt).length,
      totalSubtasks: item.subtasks.length,
    })),
  };
}

export async function getWorkItemDetail(id: string) {
  const { user, projects, sections, tags } = await getWorkspaceScaffold();
  const item = await prisma.workItem.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      project: true,
      section: true,
      tags: { include: { tag: true } },
      subtasks: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      },
      sessions: {
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!item) {
    return null;
  }

  return {
    item: {
      ...item,
      actualMinutes: sumSessionMinutes(item.sessions),
      completedSubtasks: item.subtasks.filter((subtask) => subtask.completedAt).length,
    },
    projects,
    sections,
    tags,
  };
}

export async function getProjectsPageData(options?: { showArchived?: boolean }) {
  const { user, areas } = await getWorkspaceScaffold();
  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
      ...(options?.showArchived ? {} : { status: { not: ProjectStatus.archived } }),
    },
    include: {
      area: true,
      sections: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      },
      workItems: {
        where: { status: { not: WorkItemStatus.archived } },
        include: {
          sessions: {
            select: {
              startedAt: true,
              endedAt: true,
            },
          },
        },
      },
    },
    orderBy: projectOrderBy,
  });

  return {
    user,
    areas,
    projects: projects.map((project) => {
      const progress = getProjectProgress(project.workItems);
      const trackedMinutes = project.workItems.reduce(
        (total, item) => total + sumSessionMinutes(item.sessions),
        0,
      );

      return {
        ...project,
        trackedMinutes,
        ...progress,
      };
    }),
  };
}

export async function getProjectDetail(id: string) {
  const { user, areas } = await getWorkspaceScaffold();
  let project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      area: true,
      sections: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      },
      workItems: {
        include: {
          section: true,
          tags: { include: { tag: true } },
          subtasks: {
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          },
          sessions: {
            select: {
              startedAt: true,
              endedAt: true,
            },
          },
        },
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
      },
    },
  });

  if (!project) {
    return null;
  }

  if (project.sections.length === 0) {
    await ensureProjectSections(project.id);
    project = await prisma.project.findFirst({
      where: { id, userId: user.id },
      include: {
        area: true,
        sections: {
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        },
        workItems: {
          include: {
            section: true,
            tags: { include: { tag: true } },
            subtasks: {
              orderBy: [{ position: "asc" }, { createdAt: "asc" }],
            },
            sessions: {
              select: {
                startedAt: true,
                endedAt: true,
              },
            },
          },
          orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
        },
      },
    });
  }

  if (!project) {
    return null;
  }

  const workItems = project.workItems.map((item) => ({
    ...item,
    actualMinutes: sumSessionMinutes(item.sessions),
    completedSubtasks: item.subtasks.filter((subtask) => subtask.completedAt).length,
  }));
  const progress = getProjectProgress(workItems);

  return {
    project: {
      ...project,
      workItems,
      trackedMinutes: workItems.reduce((total, item) => total + item.actualMinutes, 0),
      ...progress,
    },
    areas,
  };
}

export async function getTimerPageData() {
  const { user } = await getWorkspaceScaffold();

  const [activeSession, workItems, recentSessions] = await Promise.all([
    prisma.timeSession.findFirst({
      where: { userId: user.id, endedAt: null },
      include: {
        workItem: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.workItem.findMany({
      where: {
        userId: user.id,
        status: {
          in: [WorkItemStatus.in_progress, WorkItemStatus.planned, WorkItemStatus.blocked],
        },
      },
      include: {
        project: true,
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
      take: 12,
    }),
    prisma.timeSession.findMany({
      where: { userId: user.id },
      include: {
        workItem: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 12,
    }),
  ]);

  return {
    user,
    activeSession,
    workItems,
    recentSessions: recentSessions.map((session) => ({
      ...session,
      durationMinutes: minutesBetween(session.startedAt, session.endedAt ?? new Date()),
    })),
  };
}

export async function getDailyReviewPageData() {
  const { user } = await getWorkspaceScaffold();
  const date = new Date(`${dayKey()}T12:00:00`);
  const todayStart = startOfTodayLocal();

  const [items, plan, review, todaySessions] = await Promise.all([
    prisma.workItem.findMany({
      where: {
        userId: user.id,
        status: { in: [WorkItemStatus.in_progress, WorkItemStatus.planned, WorkItemStatus.blocked] },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.dailyPlan.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      include: {
        top1: true,
        top2: true,
        top3: true,
      },
    }),
    prisma.dailyReview.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
    }),
    prisma.timeSession.findMany({
      where: {
        userId: user.id,
        startedAt: { gte: todayStart },
      },
      include: {
        workItem: true,
      },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  return {
    user,
    items,
    plan,
    review,
    todayMinutes: sumSessionMinutes(todaySessions),
  };
}

export async function getSettingsPageData() {
  const { user } = await getWorkspaceScaffold();
  const totals = await prisma.timeSession.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 30,
  });

  return {
    user,
    trackedMinutesLast30Sessions: sumSessionMinutes(totals),
  };
}
