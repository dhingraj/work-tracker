import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CalendarMonthView } from "@/components/calendar/month-view";
import { getCalendarPageData, getWorkspaceScaffold } from "@/lib/data";
import { monthKey, parseMonthKey } from "@/lib/utils";

type SearchParams = Promise<{
  month?: string;
  day?: string;
}>;

function MonthButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: "left" | "right";
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-3.5 py-2 text-[15px] font-medium text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)]"
    >
      {icon === "left" ? <ChevronLeft className="h-4 w-4" /> : null}
      <span>{label}</span>
      {icon === "right" ? <ChevronRight className="h-4 w-4" /> : null}
    </Link>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [data, scaffold] = await Promise.all([
    getCalendarPageData(parseMonthKey(params.month)),
    getWorkspaceScaffold(),
  ]);
  const todayMonthKey = monthKey(new Date());
  const currentMonthHref =
    data.monthKey === todayMonthKey ? "/calendar" : `/calendar?month=${todayMonthKey}`;
  const monthHref =
    data.monthKey === todayMonthKey ? "/calendar" : `/calendar?month=${data.monthKey}`;

  return (
    <>
      <section className="space-y-4">
        <div className="grid grid-cols-3 gap-2 px-1">
          <MonthButton href={`/calendar?month=${data.previousMonthKey}`} label="Prev" icon="left" />
          <MonthButton href={currentMonthHref} label="Today" />
          <MonthButton href={`/calendar?month=${data.nextMonthKey}`} label="Next" icon="right" />
        </div>

        <div className="grouped-section">
          <div className="grouped-row grouped-row-mobile-stack">
            <div className="min-w-0 flex-1">
              <p className="grouped-row-title">{data.monthLabel}</p>
              <p className="grouped-row-copy">
                {data.summary.scheduled} open, {data.summary.done} completed
              </p>
            </div>
            <Link
              href="/items?view=scheduled"
              className="w-full text-[15px] font-medium text-[color:var(--app-blue)] sm:w-auto sm:text-right"
            >
              Open list
            </Link>
          </div>
        </div>
      </section>

      <CalendarMonthView
        key={data.monthKey}
        days={data.days}
        todayKey={data.todayKey}
        weekDayLabels={data.weekDayLabels}
        initialSelectedKey={params.day}
        monthHref={monthHref}
        projects={scaffold.projects.map((project) => ({
          id: project.id,
          name: project.name,
        }))}
        sections={scaffold.sections.map((section) => ({
          id: section.id,
          name: section.name,
          projectId: section.projectId,
          projectName: section.projectName,
        }))}
        tags={scaffold.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        }))}
      />
    </>
  );
}
