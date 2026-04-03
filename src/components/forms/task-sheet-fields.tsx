import { RecurrenceRule, WorkItemPriority, WorkItemStatus } from "@prisma/client";

import { recurrenceRuleOptions, workItemStatusOptions } from "@/lib/constants";
import { toDateInputValue } from "@/lib/utils";

type TaskSheetFieldsProps = {
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
  defaultTitle?: string;
  titlePlaceholder?: string;
};

export function TaskSheetFields({
  projects,
  sections,
  tags,
  redirectTo,
  defaultProjectId,
  defaultSectionId,
  defaultDueDate,
  defaultStatus = WorkItemStatus.inbox,
  defaultPriority = WorkItemPriority.medium,
  defaultRecurrenceRule = null,
  defaultTitle,
  titlePlaceholder = "New task",
}: TaskSheetFieldsProps) {
  return (
    <div className="space-y-4">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <section className="calendar-form-group">
        <div className="px-4 py-3">
          <label htmlFor="sheet-task-title" className="sr-only">
            Title
          </label>
          <input
            id="sheet-task-title"
            name="title"
            required
            defaultValue={defaultTitle ?? ""}
            placeholder={titlePlaceholder}
            className="w-full border-0 bg-transparent p-0 text-[1.35rem] font-semibold tracking-[-0.045em] text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-placeholder)] focus:ring-0 sm:text-[1.7rem]"
          />
        </div>
        <div className="border-t border-[color:var(--app-border-soft)] px-4 py-3">
          <label htmlFor="sheet-task-notes" className="sr-only">
            Notes
          </label>
          <textarea
            id="sheet-task-notes"
            name="notes"
            rows={3}
            placeholder="Notes"
            className="w-full resize-none border-0 bg-transparent p-0 text-[16px] leading-6 text-[color:var(--app-text-secondary)] placeholder:text-[color:var(--app-text-placeholder)] focus:ring-0 sm:text-[17px]"
          />
        </div>
      </section>

      <section className="calendar-form-group">
        <label className="calendar-form-row items-center">
          <span className="calendar-form-label">Date</span>
          <span className="min-w-0 flex-1">
            <input
              name="dueDate"
              type="date"
              defaultValue={toDateInputValue(defaultDueDate)}
              className="calendar-form-control"
            />
          </span>
        </label>

        <label className="calendar-form-row items-center">
          <span className="calendar-form-label">Project</span>
          <span className="min-w-0 flex-1">
            <select
              name="projectId"
              defaultValue={defaultProjectId ?? ""}
              className="calendar-form-control"
            >
              <option value="">None</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="calendar-form-row items-center">
          <span className="calendar-form-label">Section</span>
          <span className="min-w-0 flex-1">
            <select
              name="sectionId"
              defaultValue={defaultSectionId ?? ""}
              className="calendar-form-control"
            >
              <option value="">None</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.projectName} • {section.name}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="calendar-form-row items-center">
          <span className="calendar-form-label">Status</span>
          <span className="min-w-0 flex-1">
            <select name="status" defaultValue={defaultStatus} className="calendar-form-control">
              {workItemStatusOptions
                .filter((option) => option.value !== WorkItemStatus.archived)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </span>
        </label>

        <label className="calendar-form-row items-center">
          <span className="calendar-form-label">Priority</span>
          <span className="min-w-0 flex-1">
            <select
              name="priority"
              defaultValue={defaultPriority}
              className="calendar-form-control"
            >
              <option value={WorkItemPriority.low}>Low</option>
              <option value={WorkItemPriority.medium}>Medium</option>
              <option value={WorkItemPriority.high}>High</option>
              <option value={WorkItemPriority.critical}>Critical</option>
            </select>
          </span>
        </label>

        <label className="calendar-form-row items-center">
          <span className="calendar-form-label">Estimate</span>
          <span className="min-w-0 flex-1">
            <input
              name="estimateMinutes"
              type="number"
              min="0"
              step="5"
              placeholder="Minutes"
              className="calendar-form-control"
            />
          </span>
        </label>

        <label className="calendar-form-row items-center">
          <span className="calendar-form-label">Repeat</span>
          <span className="min-w-0 flex-1">
            <select
              name="recurrenceRule"
              defaultValue={defaultRecurrenceRule ?? ""}
              className="calendar-form-control"
            >
              {recurrenceRuleOptions.map((option) => (
                <option key={option.value || "none"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>
      </section>

      <section className="calendar-form-group">
        <div className="px-4 py-3">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[color:var(--app-text-tertiary)]">
            Tags
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.length ? (
              tags.map((tag) => (
                <label
                  key={tag.id}
                  className="app-chip px-3 py-1.5 text-[13px] font-medium"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    className="app-checkbox rounded"
                  />
                  <span>{tag.name}</span>
                </label>
              ))
            ) : (
              <p className="text-[15px] text-[color:var(--app-text-tertiary)]">No tags yet.</p>
            )}
          </div>
        </div>
        <div className="border-t border-[color:var(--app-border-soft)] px-4 py-3">
          <label htmlFor="sheet-task-new-tags" className="sr-only">
            New tags
          </label>
          <input
            id="sheet-task-new-tags"
            name="newTags"
            placeholder="New tags, comma separated"
            className="w-full border-0 bg-transparent p-0 text-[17px] text-[color:var(--app-text-secondary)] placeholder:text-[color:var(--app-text-placeholder)] focus:ring-0"
          />
        </div>
      </section>
    </div>
  );
}
