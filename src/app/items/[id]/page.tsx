import { notFound } from "next/navigation";

import { WorkItemFields } from "@/components/forms/work-item-fields";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import { workItemPriorityTone, workItemStatusTone } from "@/lib/constants";
import { getWorkItemDetail } from "@/lib/data";
import { formatDate, formatDateTime, formatMinutes, formatStatusLabel } from "@/lib/utils";
import {
  archiveWorkItemAction,
  createSubtaskAction,
  deleteSubtaskAction,
  deleteWorkItemAction,
  setWorkItemStatusAction,
  toggleSubtaskAction,
  updateWorkItemAction,
} from "@/server/actions/work-items";
import {
  createManualSessionAction,
  deleteTimeSessionAction,
} from "@/server/actions/timer";

export default async function WorkItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getWorkItemDetail(id);

  if (!data) {
    notFound();
  }

  const { item, projects, sections, tags } = data;

  return (
    <>
      <PageHeader
        eyebrow="Task"
        title={item.title}
        description={item.project?.name ?? "No project"}
        actions={
          <RevealSheet
            triggerContent="Edit"
            triggerClassName="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-4 py-2.5 text-[15px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)]"
            eyebrow="Task"
            title={`Edit ${item.title}`}
            description="Keep the task details concise and current."
          >
            <form action={updateWorkItemAction} className="space-y-4">
              <WorkItemFields
                item={item}
                projects={projects}
                sections={sections}
                tags={tags}
                redirectTo={`/items/${item.id}`}
              />
              <Button fullWidth>Save changes</Button>
            </form>
          </RevealSheet>
        }
      />

      <section className="grouped-section">
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Status</p>
            <p className="grouped-row-copy">{formatStatusLabel(item.status)}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${workItemStatusTone[item.status]}`}>
            {formatStatusLabel(item.status)}
          </span>
        </div>
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Priority</p>
            <p className="grouped-row-copy">{item.priority}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${workItemPriorityTone[item.priority]}`}>
            {item.priority}
          </span>
        </div>
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Project</p>
            <p className="grouped-row-copy">
              {item.project?.name ?? "Inbox"}
              {item.section ? ` • ${item.section.name}` : ""}
            </p>
          </div>
          <span className="grouped-row-value">
            {item.completedSubtasks}/{item.subtasks.length || 0} subtasks
          </span>
        </div>
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Due date</p>
            <p className="grouped-row-copy">{item.dueDate ? formatDate(item.dueDate) : "Not set"}</p>
          </div>
          <span className="grouped-row-value">
            {item.estimateMinutes ? `${item.estimateMinutes} min est.` : "No estimate"}
          </span>
        </div>
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Repeat</p>
            <p className="grouped-row-copy">
              {item.recurrenceRule ? formatStatusLabel(item.recurrenceRule) : "None"}
            </p>
          </div>
          <span className="grouped-row-value">
            {item.completedAt ? `Done ${formatDate(item.completedAt)}` : "Open"}
          </span>
        </div>
        {item.notes ? (
          <div className="grouped-row grouped-row-start">
            <div className="min-w-0 flex-1">
              <p className="grouped-row-title">Notes</p>
              <p className="mt-1 break-words text-[14px] leading-5 text-[color:var(--app-text-secondary)]">
                {item.notes}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grouped-section">
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Cleanup</p>
            <p className="grouped-row-copy">Keep finished work out of the way.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <form action={setWorkItemStatusAction} className="w-full sm:w-auto">
              <input type="hidden" name="id" value={item.id} />
              <input
                type="hidden"
                name="status"
                value={item.status === "done" ? "planned" : "done"}
              />
              <input type="hidden" name="redirectTo" value={`/items/${item.id}`} />
              <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                {item.status === "done" ? "Reopen" : "Done"}
              </Button>
            </form>
            <form action={archiveWorkItemAction} className="w-full sm:w-auto">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="redirectTo" value="/items?status=archived" />
              <Button type="submit" variant="ghost" className="w-full sm:w-auto">
                Archive
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-label">Checklist</p>
        </div>
        <div className="grouped-section">
          {item.subtasks.length ? (
            item.subtasks.map((subtask) => (
              <div key={subtask.id} className="grouped-row grouped-row-mobile-stack">
                <form action={toggleSubtaskAction}>
                  <input type="hidden" name="id" value={subtask.id} />
                  <input type="hidden" name="redirectTo" value={`/items/${item.id}`} />
                  <button
                    type="submit"
                    aria-label={subtask.completedAt ? "Mark subtask open" : "Mark subtask done"}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                      subtask.completedAt
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[color:var(--app-border)] text-[color:var(--app-text-tertiary)]"
                    }`}
                  >
                    {subtask.completedAt ? "✓" : ""}
                  </button>
                </form>
                <p
                  className={`min-w-0 flex-1 break-words text-[16px] ${
                    subtask.completedAt
                      ? "text-[color:var(--app-text-tertiary)] line-through"
                      : "text-[color:var(--app-text)]"
                  }`}
                >
                  {subtask.title}
                </p>
                <form action={deleteSubtaskAction} className="w-full sm:w-auto">
                  <input type="hidden" name="id" value={subtask.id} />
                  <input type="hidden" name="redirectTo" value={`/items/${item.id}`} />
                  <Button type="submit" variant="ghost" className="w-full sm:w-auto">
                    Delete
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <div className="grouped-row">
              <div className="min-w-0 flex-1">
                <p className="grouped-row-title">No subtasks yet</p>
              </div>
            </div>
          )}
          <form action={createSubtaskAction} className="grouped-row grouped-row-mobile-stack">
            <input type="hidden" name="workItemId" value={item.id} />
            <input type="hidden" name="redirectTo" value={`/items/${item.id}`} />
            <input
              name="title"
              placeholder="Add subtask"
              className="app-input"
              required
            />
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Add
            </Button>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <p className="section-label">Time</p>
            <h2 className="section-title">Tracked Time</h2>
          </div>
          <RevealSheet
            triggerContent="Log Time"
            triggerClassName="inline-flex min-h-10 items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-4 py-2 text-[15px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)]"
            eyebrow="Time"
            title="Log Time"
            description="Backfill a work block only when you need it."
          >
            <form action={createManualSessionAction} className="space-y-4">
              <input type="hidden" name="workItemId" value={item.id} />
              <div className="space-y-1.5">
                <label
                  htmlFor="item-startedAt"
                  className="text-sm font-medium text-[color:var(--app-text)]"
                >
                  Start
                </label>
                <input id="item-startedAt" name="startedAt" type="datetime-local" required className="app-input" />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="item-endedAt"
                  className="text-sm font-medium text-[color:var(--app-text)]"
                >
                  End
                </label>
                <input id="item-endedAt" name="endedAt" type="datetime-local" required className="app-input" />
              </div>
              <textarea
                name="sessionNotes"
                rows={3}
                placeholder="What happened in this block?"
                className="app-textarea"
              />
              <label className="app-chip px-4 py-3 text-[15px]">
                <input
                  type="checkbox"
                  name="isDeepWork"
                  className="app-checkbox rounded"
                />
                <span>Mark as deep work</span>
              </label>
              <Button fullWidth>Save time</Button>
            </form>
          </RevealSheet>
        </div>

        <div className="grouped-section">
          <div className="grouped-row grouped-row-mobile-stack">
            <div className="min-w-0 flex-1">
              <p className="grouped-row-title">Actual time</p>
              <p className="grouped-row-copy">Total tracked on this task</p>
            </div>
            <span className="grouped-row-value">{formatMinutes(item.actualMinutes)}</span>
          </div>
          {item.sessions.length ? (
            item.sessions.map((session) => (
              <div key={session.id} className="grouped-row grouped-row-start grouped-row-mobile-stack">
                <div className="min-w-0 flex-1">
                  <p className="grouped-row-title">
                    {formatDateTime(session.startedAt)} to {formatDateTime(session.endedAt)}
                  </p>
                  <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                    {formatMinutes(
                      Math.max(
                        0,
                        Math.round(
                          ((session.endedAt ?? new Date()).getTime() - session.startedAt.getTime()) /
                            60000,
                        ),
                      ),
                    )}
                    {session.isDeepWork ? " • Deep work" : ""}
                  </p>
                  {session.sessionNotes ? (
                    <p className="mt-2 break-words text-[14px] leading-5 text-[color:var(--app-text-secondary)]">
                      {session.sessionNotes}
                    </p>
                  ) : null}
                </div>
                <form action={deleteTimeSessionAction} className="w-full sm:w-auto">
                  <input type="hidden" name="id" value={session.id} />
                  <Button type="submit" variant="ghost" className="w-full sm:w-auto">
                    Delete
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <div className="grouped-row">
              <div className="min-w-0 flex-1">
                <p className="grouped-row-title">No sessions yet</p>
                <p className="grouped-row-copy">Time stays optional.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <form action={deleteWorkItemAction}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="redirectTo" value="/items" />
        <Button type="submit" fullWidth variant="danger">
          Delete task
        </Button>
      </form>
    </>
  );
}
