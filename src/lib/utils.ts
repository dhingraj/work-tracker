import { addDays, addMonths, format, formatDistanceToNowStrict } from "date-fns";
import { RecurrenceRule, WorkItemStatus } from "@prisma/client";
import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatDate(date?: Date | string | null, pattern = "MMM d") {
  if (!date) {
    return "No date";
  }

  return format(new Date(date), pattern);
}

export function formatDateTime(date?: Date | string | null) {
  if (!date) {
    return "Not set";
  }

  return format(new Date(date), "MMM d, h:mm a");
}

export function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function relativeTime(date?: Date | string | null) {
  if (!date) {
    return "Not set";
  }

  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function startOfTodayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function endOfTodayLocal() {
  const start = startOfTodayLocal();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function parseMonthKey(value?: string | null) {
  if (!value) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  return new Date(year, month - 1, 1);
}

export function parseOptionalInt(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseOptionalDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || !value.trim()) {
    return null;
  }

  return new Date(`${value}T12:00:00`);
}

export function parseDayKey(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function toDateInputValue(date?: Date | string | null) {
  if (!date) {
    return "";
  }

  return dayKey(new Date(date));
}

export function minutesBetween(start: Date, end: Date) {
  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
  );
}

export function isOpenWorkItemStatus(status: WorkItemStatus) {
  return status !== WorkItemStatus.done && status !== WorkItemStatus.archived;
}

export function getNextRecurringDate(
  dueDate: Date | null | undefined,
  rule?: RecurrenceRule | null,
) {
  if (!rule) {
    return null;
  }

  const anchor = dueDate ? new Date(dueDate) : new Date();

  switch (rule) {
    case RecurrenceRule.daily:
      return addDays(anchor, 1);
    case RecurrenceRule.weekdays: {
      const next = addDays(anchor, 1);
      const weekday = next.getDay();
      if (weekday === 6) {
        return addDays(next, 2);
      }
      if (weekday === 0) {
        return addDays(next, 1);
      }
      return next;
    }
    case RecurrenceRule.weekly:
      return addDays(anchor, 7);
    case RecurrenceRule.monthly:
      return addMonths(anchor, 1);
  }
}
