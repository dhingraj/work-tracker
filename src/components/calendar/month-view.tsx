"use client";

import type { WorkItemPriority, WorkItemStatus } from "@prisma/client";

import Link from "next/link";
import { useState } from "react";
import { CalendarRange, Plus } from "lucide-react";

import { CalendarTaskSheet } from "@/components/calendar/task-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import {
  workItemPriorityTone,
  workItemStatusAccent,
  workItemStatusTone,
} from "@/lib/constants";
import { cn, dayKey } from "@/lib/utils";
import { rescheduleWorkItemAction } from "@/server/actions/work-items";

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

function statusLabel(status: WorkItemStatus) {
  return status.replace("_", " ");
}

function withDayParam(monthHref: string, dayKeyValue: string) {
  const separator = monthHref.includes("?") ? "&" : "?";
  return `${monthHref}${separator}day=${dayKeyValue}`;
}

function DayAgenda({
  day,
  onAdd,
  redirectTo,
}: {
  day: CalendarDay;
  onAdd: () => void;
  redirectTo: string;
}) {
  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] shadow-[var(--app-shadow-soft)]">
      <div className="flex flex-col gap-3 border-b border-[color:var(--app-border-soft)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="break-words text-[1.45rem] font-semibold tracking-[-0.04em] text-[color:var(--app-text)] sm:text-[1.65rem]">
          {day.fullLabel}
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--app-blue)] px-4 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(0,122,255,0.22)] transition hover:bg-[color:var(--app-blue-strong)] sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="flex flex-col items-start gap-2 border-b border-[color:var(--app-border-soft)] bg-[color:var(--app-surface-subtle)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {day.statusSummary.length ? (
            day.statusSummary.map((entry) => (
              <Badge
                key={entry.status}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium",
                  workItemStatusTone[entry.status],
                )}
              >
                {entry.count} {statusLabel(entry.status)}
              </Badge>
            ))
          ) : (
            <p className="text-[15px] text-[color:var(--app-text-tertiary)]">No scheduled tasks.</p>
          )}
        </div>
        <p className="text-[13px] font-medium text-[color:var(--app-text-tertiary)]">
          {day.items.length} {day.items.length === 1 ? "task" : "tasks"}
        </p>
      </div>

      {day.items.length ? (
        <div>
          {day.items.map((item) => (
            <div key={item.id} className="border-b border-[color:var(--app-border-soft)] px-4 py-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 h-2.5 w-2.5 flex-none rounded-full",
                    workItemStatusAccent[item.status],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <Link href={`/items/${item.id}`} className="min-w-0 flex-1">
                      <p className="break-words text-[17px] font-medium leading-6 text-[color:var(--app-text)]">
                        {item.title}
                      </p>
                    </Link>
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium",
                        workItemPriorityTone[item.priority],
                      )}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                    {statusLabel(item.status)}
                    {item.projectName ? ` • ${item.projectName}` : ""}
                  </p>
                  <div className="mt-2">
                    <RevealSheet
                      triggerContent={
                        <span className="inline-flex items-center gap-1">
                          <CalendarRange className="h-3.5 w-3.5" />
                          Move
                        </span>
                      }
                      triggerClassName="inline-flex min-h-8 items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-3 py-1.5 text-[13px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)]"
                      title={item.title}
                      closeOnSubmit
                    >
                      <form action={rescheduleWorkItemAction} className="space-y-4">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="redirectTo" value={redirectTo} />
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`calendar-move-${item.id}`}
                            className="text-sm font-medium text-[color:var(--app-text)]"
                          >
                            Date
                          </label>
                          <input
                            id={`calendar-move-${item.id}`}
                            name="dueDate"
                            type="date"
                            defaultValue={item.dueDate ? dayKey(item.dueDate) : ""}
                            className="app-input"
                          />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button fullWidth>Save</Button>
                          <Button type="submit" name="dueDate" value="" variant="secondary">
                            Clear
                          </Button>
                        </div>
                      </form>
                    </RevealSheet>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="text-[15px] leading-6 text-[color:var(--app-text-tertiary)]">
            Nothing scheduled.
          </p>
        </div>
      )}
    </section>
  );
}

export function CalendarMonthView({
  days,
  todayKey,
  weekDayLabels,
  initialSelectedKey,
  monthHref,
  projects,
  sections,
  tags,
}: {
  days: CalendarDay[];
  todayKey: string;
  weekDayLabels: string[];
  initialSelectedKey?: string;
  monthHref: string;
  projects: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; projectId: string; projectName: string }>;
  tags: Array<{ id: string; name: string; color: string }>;
}) {
  const initialSelectedDay =
    days.find((day) => day.key === initialSelectedKey) ??
    days.find((day) => day.key === todayKey && day.isCurrentMonth) ??
    days.find((day) => day.isCurrentMonth && day.items.length > 0) ??
    days.find((day) => day.isCurrentMonth) ??
    days[0];
  const [selectedKey, setSelectedKey] = useState(initialSelectedDay?.key ?? "");
  const [sheetOpen, setSheetOpen] = useState(false);
  const selectedDay = days.find((day) => day.key === selectedKey) ?? initialSelectedDay;

  if (!selectedDay) {
    return null;
  }

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-[1.35rem] border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] shadow-[var(--app-shadow-soft)]">
          <div className="grid grid-cols-7 border-b border-[color:var(--app-border)] bg-[color:var(--app-surface-muted)]">
            {weekDayLabels.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--app-text-tertiary)] sm:text-[11px] sm:tracking-[0.14em]"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const isSelected = selectedKey === day.key;
              const isColumnEnd = (index + 1) % 7 === 0;

              return (
                <button
                  key={day.key}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${day.fullLabel}, ${day.items.length} tasks`}
                  onClick={() => setSelectedKey(day.key)}
                  className={cn(
                    "flex min-h-[4.6rem] flex-col px-1.5 py-2 text-left transition sm:min-h-[6rem] sm:px-2",
                    "border-b border-[color:var(--app-border-soft)]",
                    !isColumnEnd && "border-r border-[color:var(--app-border-soft)]",
                    day.isCurrentMonth
                      ? "bg-[color:var(--app-surface-solid)]"
                      : "bg-[color:var(--app-surface-muted)]",
                    isSelected && "bg-[color:var(--app-blue-tint)]",
                    !day.isCurrentMonth && "text-[color:var(--app-text-placeholder)]",
                    !isSelected && "hover:bg-[color:var(--app-surface-subtle)]",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-[15px] font-semibold tracking-[-0.01em]",
                      isSelected
                        ? "bg-[color:var(--app-blue)] text-white"
                        : day.isToday
                          ? "text-[color:var(--app-red)]"
                          : day.isCurrentMonth
                            ? "text-[color:var(--app-text)]"
                            : "text-[color:var(--app-text-placeholder)]",
                    )}
                  >
                    {day.label}
                  </span>

                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div className="flex min-h-3 items-center gap-1">
                      {day.statusSummary.slice(0, 3).map((entry) => (
                        <span
                          key={`${day.key}-${entry.status}`}
                          className={cn(
                            "inline-flex h-1.5 rounded-full",
                            workItemStatusAccent[entry.status],
                            entry.count > 1 ? "w-3.5" : "w-1.5",
                          )}
                        />
                      ))}
                      {day.statusSummary.length > 3 ? (
                        <span className="text-[10px] font-medium text-[color:var(--app-text-tertiary)]">
                          +{day.statusSummary.length - 3}
                        </span>
                      ) : null}
                    </div>

                    {day.items.length ? (
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          day.isCurrentMonth
                            ? "text-[color:var(--app-text-tertiary)]"
                            : "text-[color:var(--app-text-placeholder)]",
                        )}
                      >
                        {day.items.length}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden xl:block xl:sticky xl:top-6 xl:self-start">
          <DayAgenda
            day={selectedDay}
            onAdd={() => setSheetOpen(true)}
            redirectTo={withDayParam(monthHref, selectedDay.key)}
          />
        </div>
      </section>

      <div className="xl:hidden">
        <DayAgenda
          day={selectedDay}
          onAdd={() => setSheetOpen(true)}
          redirectTo={withDayParam(monthHref, selectedDay.key)}
        />
      </div>

      <CalendarTaskSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedDateKey={selectedDay.key}
        selectedDateLabel={selectedDay.fullLabel}
        redirectTo={withDayParam(monthHref, selectedDay.key)}
        projects={projects}
        sections={sections}
        tags={tags}
      />
    </>
  );
}
