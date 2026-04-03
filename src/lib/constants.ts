import {
  ProjectHealth,
  ProjectStatus,
  RecurrenceRule,
  SessionSource,
  WorkItemPriority,
  WorkItemStatus,
} from "@prisma/client";

export const workItemStatusOptions = [
  { value: WorkItemStatus.inbox, label: "Inbox" },
  { value: WorkItemStatus.planned, label: "Planned" },
  { value: WorkItemStatus.in_progress, label: "In progress" },
  { value: WorkItemStatus.blocked, label: "Blocked" },
  { value: WorkItemStatus.done, label: "Done" },
  { value: WorkItemStatus.archived, label: "Archived" },
];

export const workItemPriorityOptions = [
  { value: WorkItemPriority.low, label: "Low" },
  { value: WorkItemPriority.medium, label: "Medium" },
  { value: WorkItemPriority.high, label: "High" },
  { value: WorkItemPriority.critical, label: "Critical" },
];

export const recurrenceRuleOptions = [
  { value: "", label: "None" },
  { value: RecurrenceRule.daily, label: "Daily" },
  { value: RecurrenceRule.weekdays, label: "Weekdays" },
  { value: RecurrenceRule.weekly, label: "Weekly" },
  { value: RecurrenceRule.monthly, label: "Monthly" },
];

export const defaultProjectSectionNames = ["Backlog", "This Week", "Waiting", "Done"];

export const projectStatusOptions = [
  { value: ProjectStatus.active, label: "Active" },
  { value: ProjectStatus.paused, label: "Paused" },
  { value: ProjectStatus.completed, label: "Completed" },
  { value: ProjectStatus.archived, label: "Archived" },
];

export const projectHealthOptions = [
  { value: ProjectHealth.on_track, label: "On track" },
  { value: ProjectHealth.at_risk, label: "At risk" },
  { value: ProjectHealth.off_track, label: "Off track" },
];

export const sessionSourceOptions = [
  { value: SessionSource.timer, label: "Timer" },
  { value: SessionSource.manual, label: "Manual" },
];

export const homeItemViewOrder = [
  "today",
  "scheduled",
  "all",
  "completed",
  "blocked",
] as const;

export type HomeItemView = (typeof homeItemViewOrder)[number];

export const homeItemViewMeta: Record<
  HomeItemView,
  {
    label: string;
    href: string;
  }
> = {
  today: {
    label: "Today",
    href: "/items?view=today",
  },
  scheduled: {
    label: "Scheduled",
    href: "/items?view=scheduled",
  },
  all: {
    label: "All",
    href: "/items?view=all",
  },
  completed: {
    label: "Completed",
    href: "/items?view=completed",
  },
  blocked: {
    label: "Blocked",
    href: "/items?view=blocked",
  },
};

export const projectHealthTone: Record<ProjectHealth, string> = {
  [ProjectHealth.on_track]: "bg-emerald-100 text-emerald-700",
  [ProjectHealth.at_risk]: "bg-amber-100 text-amber-700",
  [ProjectHealth.off_track]: "bg-rose-100 text-rose-700",
};

export const workItemPriorityTone: Record<WorkItemPriority, string> = {
  [WorkItemPriority.low]: "bg-slate-100 text-slate-600",
  [WorkItemPriority.medium]: "bg-cyan-100 text-cyan-700",
  [WorkItemPriority.high]: "bg-orange-100 text-orange-700",
  [WorkItemPriority.critical]: "bg-rose-100 text-rose-700",
};

export const workItemStatusTone: Record<WorkItemStatus, string> = {
  [WorkItemStatus.inbox]: "bg-slate-100 text-slate-600",
  [WorkItemStatus.planned]: "bg-indigo-100 text-indigo-700",
  [WorkItemStatus.in_progress]: "bg-teal-100 text-teal-700",
  [WorkItemStatus.blocked]: "bg-amber-100 text-amber-700",
  [WorkItemStatus.done]: "bg-emerald-100 text-emerald-700",
  [WorkItemStatus.archived]: "bg-stone-200 text-stone-600",
};

export const workItemStatusAccent: Record<WorkItemStatus, string> = {
  [WorkItemStatus.inbox]: "bg-slate-400",
  [WorkItemStatus.planned]: "bg-indigo-500",
  [WorkItemStatus.in_progress]: "bg-teal-500",
  [WorkItemStatus.blocked]: "bg-amber-500",
  [WorkItemStatus.done]: "bg-emerald-500",
  [WorkItemStatus.archived]: "bg-stone-400",
};

export const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/items", label: "Items" },
  { href: "/projects", label: "Projects" },
  { href: "/settings", label: "Settings" },
];
