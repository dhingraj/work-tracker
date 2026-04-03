import { RecurrenceRule, WorkItemPriority, WorkItemStatus } from "@prisma/client";

import {
  recurrenceRuleOptions,
  workItemPriorityOptions,
  workItemStatusOptions,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/utils";

type WorkItemFieldsProps = {
  item?: {
    id: string;
    title: string;
    projectId: string | null;
    sectionId: string | null;
    status: WorkItemStatus;
    priority: WorkItemPriority;
    dueDate: Date | null;
    estimateMinutes: number | null;
    notes: string | null;
    recurring: boolean;
    recurrenceRule: RecurrenceRule | null;
    tags: Array<{ tagId: string } | { tag: { id: string } }>;
  };
  projects: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; projectId: string; projectName: string }>;
  tags: Array<{ id: string; name: string; color: string }>;
  redirectTo?: string;
};

export function WorkItemFields({
  item,
  projects,
  sections,
  tags,
  redirectTo,
}: WorkItemFieldsProps) {
  const selectedTagIds = new Set(
    item?.tags.map((tagLink) => ("tagId" in tagLink ? tagLink.tagId : tagLink.tag.id)) ?? [],
  );

  return (
    <div className="space-y-4">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-[color:var(--app-text)]">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={item?.title ?? ""}
          placeholder="What needs to move today?"
          className="app-input"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="projectId" className="text-sm font-medium text-[color:var(--app-text)]">
            Project
          </label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={item?.projectId ?? ""}
            className="app-select"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="sectionId" className="text-sm font-medium text-[color:var(--app-text)]">
            Section
          </label>
          <select
            id="sectionId"
            name="sectionId"
            defaultValue={item?.sectionId ?? ""}
            className="app-select"
          >
            <option value="">None</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.projectName} • {section.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dueDate" className="text-sm font-medium text-[color:var(--app-text)]">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={toDateInputValue(item?.dueDate)}
            className="app-input"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-[color:var(--app-text)]">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={item?.status ?? WorkItemStatus.inbox}
            className="app-select"
          >
            {workItemStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="priority" className="text-sm font-medium text-[color:var(--app-text)]">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={item?.priority ?? WorkItemPriority.medium}
            className="app-select"
          >
            {workItemPriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="estimateMinutes"
            className="text-sm font-medium text-[color:var(--app-text)]"
          >
            Estimate (min)
          </label>
          <input
            id="estimateMinutes"
            name="estimateMinutes"
            type="number"
            min="0"
            step="5"
            defaultValue={item?.estimateMinutes ?? ""}
            className="app-input"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="recurrenceRule"
            className="text-sm font-medium text-[color:var(--app-text)]"
          >
            Repeat
          </label>
          <select
            id="recurrenceRule"
            name="recurrenceRule"
            defaultValue={item?.recurrenceRule ?? ""}
            className="app-select"
          >
            {recurrenceRuleOptions.map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-[color:var(--app-text)]">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={item?.notes ?? ""}
          placeholder="Outcome, blockers, context, or next step"
          className="app-textarea"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-[color:var(--app-text)]">Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="app-chip"
            >
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                defaultChecked={selectedTagIds.has(tag.id)}
                className="app-checkbox rounded"
              />
              <span>{tag.name}</span>
            </label>
          ))}
        </div>
        <input
          name="newTags"
          placeholder="Add new tags, comma separated"
          className="app-input"
        />
      </div>
    </div>
  );
}
