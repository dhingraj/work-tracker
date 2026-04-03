"use client";

import type { RecurrenceRule, WorkItemPriority, WorkItemStatus } from "@prisma/client";

import { useState } from "react";

import { TaskSheetFields } from "@/components/forms/task-sheet-fields";
import { Button } from "@/components/ui/button";
import { toDateInputValue } from "@/lib/utils";

type TaskCaptureFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  fastAction?: (formData: FormData) => void | Promise<void>;
  projects: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; projectId: string; projectName: string }>;
  tags: Array<{ id: string; name: string; color: string }>;
  redirectTo?: string;
  defaultProjectId?: string;
  defaultSectionId?: string;
  defaultDueDate?: Date | string | null;
  defaultStatus?: WorkItemStatus;
  defaultPriority?: WorkItemPriority;
  defaultRecurrenceRule?: RecurrenceRule | null;
  titlePlaceholder?: string;
  submitLabel?: string;
  detailsLabel?: string;
};

export function TaskCaptureForm({
  action,
  fastAction,
  projects,
  sections,
  tags,
  redirectTo,
  defaultProjectId,
  defaultSectionId,
  defaultDueDate,
  defaultStatus,
  defaultPriority,
  defaultRecurrenceRule,
  titlePlaceholder = "Capture the next task",
  submitLabel = "Add task",
  detailsLabel = "Details",
}: TaskCaptureFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");

  if (expanded) {
    return (
      <form action={action} className="space-y-4">
        <TaskSheetFields
          projects={projects}
          sections={sections}
          tags={tags}
          redirectTo={redirectTo}
          defaultProjectId={defaultProjectId}
          defaultSectionId={defaultSectionId}
          defaultDueDate={defaultDueDate}
          defaultStatus={defaultStatus}
          defaultPriority={defaultPriority}
          defaultRecurrenceRule={defaultRecurrenceRule}
          defaultTitle={title}
          titlePlaceholder={titlePlaceholder}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            className="w-full px-2 sm:w-auto"
            onClick={() => setExpanded(false)}
          >
            Less
          </Button>
          <Button fullWidth>{submitLabel}</Button>
        </div>
      </form>
    );
  }

  return (
    <form action={fastAction ?? action} className="space-y-4">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      {defaultProjectId ? <input type="hidden" name="projectId" value={defaultProjectId} /> : null}
      {defaultSectionId ? <input type="hidden" name="sectionId" value={defaultSectionId} /> : null}
      {defaultStatus ? <input type="hidden" name="status" value={defaultStatus} /> : null}
      {defaultDueDate ? (
        <input type="hidden" name="dueDate" value={toDateInputValue(defaultDueDate)} />
      ) : null}
      <section className="grouped-section">
        <div className="px-4 py-3">
          <label htmlFor="quick-capture-title" className="sr-only">
            Title
          </label>
          <input
            id="quick-capture-title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={titlePlaceholder}
            className="w-full border-0 bg-transparent p-0 text-[1.2rem] font-semibold tracking-[-0.04em] text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-placeholder)] focus:ring-0 sm:text-[1.35rem]"
          />
        </div>
      </section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button fullWidth>{submitLabel}</Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => setExpanded(true)}
        >
          {detailsLabel}
        </Button>
      </div>
    </form>
  );
}
