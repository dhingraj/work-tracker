import Link from "next/link";
import { CheckCircle2, Circle, Folder, CalendarDays, Clock3, AlertTriangle } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { homeItemViewMeta } from "@/lib/constants";
import { getDashboardData } from "@/lib/data";

const tileIcons = {
  today: CalendarDays,
  scheduled: Clock3,
  all: Folder,
  completed: CheckCircle2,
  blocked: AlertTriangle,
} as const;

const tileStyles = {
  today: "bg-[color:var(--app-blue-tint)] text-[color:var(--app-blue)]",
  scheduled: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200",
  all: "bg-[color:var(--app-surface-muted)] text-[color:var(--app-text-secondary)]",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200",
  blocked: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
} as const;

type HomeScreenProps = {
  data: Awaited<ReturnType<typeof getDashboardData>>;
};

export function HomeScreen({ data }: HomeScreenProps) {
  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="section-label">Lists</p>
          <Link
            href="/items?view=all"
            className="text-[15px] font-medium text-[color:var(--app-blue)]"
          >
            See all
          </Link>
        </div>
        <div className="tile-grid">
          {data.categories.map((category) => {
            const Icon = tileIcons[category.key];
            const meta = homeItemViewMeta[category.key];

            return (
              <Link
                key={category.key}
                href={category.href}
                className="rounded-[1.45rem] border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] p-4 shadow-[var(--app-shadow-soft)] transition hover:bg-[color:var(--app-surface-subtle)]"
              >
                <div
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${tileStyles[category.key]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[28px] font-semibold tracking-[-0.05em] text-[color:var(--app-text)]">
                      {category.count}
                    </p>
                    <p className="text-[16px] font-semibold tracking-[-0.02em] text-[color:var(--app-text)]">
                      {meta.label}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-label">Projects</p>
        </div>

        {data.projects.length ? (
          <div className="grouped-section">
            {data.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="grouped-row grouped-row-start grouped-row-mobile-stack transition hover:bg-[color:var(--app-surface-subtle)]"
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${
                    project.health === "off_track"
                      ? "bg-rose-500"
                      : project.health === "at_risk"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words text-[17px] font-medium tracking-[-0.02em] text-[color:var(--app-text)] sm:truncate">
                      {project.name}
                    </p>
                    {project.pinned ? (
                      <span className="rounded-full bg-[color:var(--app-blue-tint)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--app-blue)]">
                        Pinned
                      </span>
                    ) : null}
                    {project.dueTodayItems ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
                        Today {project.dueTodayItems}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                    {project.areaName ? `${project.areaName} • ` : ""}
                    {project.status.replace("_", " ")}
                  </p>
                </div>
                <div className="grouped-row-side text-[13px] text-[color:var(--app-text-tertiary)] sm:text-right">
                  <p>{project.openCount} open</p>
                  <p>{project.doneCount} done</p>
                  <p>{project.blockedCount} blocked</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No projects yet." />
        )}
      </section>

      <section className="grouped-section">
        <Link
          href="/items?view=today"
          className="grouped-row grouped-row-mobile-stack transition hover:bg-[color:var(--app-surface-subtle)]"
        >
          <CalendarDays className="mt-0.5 h-4 w-4 text-[color:var(--app-blue)]" />
          <p className="min-w-0 flex-1 grouped-row-title">Today</p>
          <span className="grouped-row-value">{data.categories[0]?.count ?? 0}</span>
        </Link>
        <Link
          href="/review/daily"
          className="grouped-row grouped-row-mobile-stack transition hover:bg-[color:var(--app-surface-subtle)]"
        >
          <Circle className="mt-0.5 h-4 w-4 text-[color:var(--app-text-tertiary)]" />
          <p className="min-w-0 flex-1 grouped-row-title">Daily Review</p>
          <span className="grouped-row-value">Open</span>
        </Link>
      </section>
    </>
  );
}
