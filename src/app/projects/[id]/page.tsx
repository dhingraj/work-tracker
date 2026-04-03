import Link from "next/link";
import { WorkItemStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { ProjectFields } from "@/components/forms/project-fields";
import { TaskCaptureForm } from "@/components/forms/task-capture-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import { workItemPriorityTone, workItemStatusAccent, workItemStatusTone } from "@/lib/constants";
import { getProjectDetail, getWorkspaceScaffold } from "@/lib/data";
import { formatDate, formatMinutes, formatStatusLabel } from "@/lib/utils";
import {
  createProjectSectionAction,
  deleteProjectAction,
  toggleProjectPinAction,
  updateProjectAction,
} from "@/server/actions/projects";
import {
  archiveCompletedItemsAction,
  createWorkItemAction,
  quickCaptureAction,
} from "@/server/actions/work-items";

type SearchParams = Promise<{
  completed?: string;
}>;

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [data, scaffold] = await Promise.all([getProjectDetail(id), getWorkspaceScaffold()]);

  if (!data) {
    notFound();
  }

  const { project, areas } = data;
  const openItems = project.workItems.filter((item) => item.status !== WorkItemStatus.done && item.status !== WorkItemStatus.archived);
  const completedItems = project.workItems.filter((item) => item.status === WorkItemStatus.done);
  const showCompleted = query.completed === "1";
  const sectionItems = project.sections.map((section) => ({
    ...section,
    items: openItems.filter((item) => item.sectionId === section.id),
  }));
  const unsectionedItems = openItems.filter((item) => !item.sectionId);

  return (
    <>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={undefined}
        actions={
          <>
            <RevealSheet
              triggerContent="Add Task"
              triggerClassName="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--app-blue)] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(0,122,255,0.2)] transition hover:bg-[color:var(--app-blue-strong)]"
              eyebrow="Tasks"
              title="New Task"
            >
              <TaskCaptureForm
                action={createWorkItemAction}
                fastAction={quickCaptureAction}
                projects={scaffold.projects.map((entry) => ({
                  id: entry.id,
                  name: entry.name,
                }))}
                sections={project.sections.map((section) => ({
                  id: section.id,
                  name: section.name,
                  projectId: project.id,
                  projectName: project.name,
                }))}
                tags={scaffold.tags.map((tag) => ({
                  id: tag.id,
                  name: tag.name,
                  color: tag.color,
                }))}
                redirectTo={`/projects/${project.id}`}
                defaultProjectId={project.id}
                defaultStatus={WorkItemStatus.planned}
                titlePlaceholder="Next task"
              />
            </RevealSheet>
            <RevealSheet
              triggerContent="Edit"
              triggerClassName="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-4 py-2.5 text-[15px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)]"
              eyebrow="Project"
              title={`Edit ${project.name}`}
            >
              <form action={updateProjectAction} className="space-y-4">
                <ProjectFields
                  project={project}
                  areas={areas}
                  redirectTo={`/projects/${project.id}`}
                />
                <Button fullWidth>Save project</Button>
              </form>
            </RevealSheet>
          </>
        }
      />

      <section className="grouped-section">
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Progress</p>
            <p className="grouped-row-copy">
              {project.status.replace("_", " ")}
              {project.area ? ` • ${project.area.name}` : ""}
            </p>
          </div>
          <div className="grouped-row-side text-[13px] text-[color:var(--app-text-tertiary)] sm:text-right">
            <p>{project.openCount} open</p>
            <p>{project.doneCount} done</p>
            <p>{project.blockedCount} blocked</p>
          </div>
        </div>
        <div className="grouped-row grouped-row-start grouped-row-mobile-stack sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Next due</p>
            {project.nextDueItems.length ? (
              <div className="mt-1 space-y-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                {project.nextDueItems.map((item) => (
                  <p key={item.title} className="break-words">
                    {item.title} • {formatDate(item.dueDate)}
                  </p>
                ))}
              </div>
            ) : (
              <p className="grouped-row-copy">No due items</p>
            )}
          </div>
          <span className="grouped-row-value">{formatMinutes(project.trackedMinutes)}</span>
        </div>
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Pinned</p>
            <p className="grouped-row-copy">{project.pinned ? "Kept near the top" : "Normal order"}</p>
          </div>
          <form action={toggleProjectPinAction} className="w-full sm:w-auto">
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="redirectTo" value={`/projects/${project.id}`} />
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              {project.pinned ? "Unpin" : "Pin"}
            </Button>
          </form>
        </div>
        {project.notes ? (
          <div className="grouped-row grouped-row-start">
            <div className="min-w-0 flex-1">
              <p className="grouped-row-title">Notes</p>
              <p className="mt-1 break-words text-[14px] leading-5 text-[color:var(--app-text-secondary)]">
                {project.notes}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="section-label">Sections</p>
          <RevealSheet
            triggerContent="Add Section"
            triggerClassName="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-4 py-2 text-[14px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)] sm:w-auto"
            title="New Section"
          >
            <form action={createProjectSectionAction} className="space-y-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="redirectTo" value={`/projects/${project.id}`} />
              <input name="name" placeholder="Section name" className="app-input" required />
              <Button fullWidth>Create section</Button>
            </form>
          </RevealSheet>
        </div>

        {sectionItems.map((section) => (
          <section key={section.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="section-title">{section.name}</p>
              <RevealSheet
                triggerContent="Add"
                triggerClassName="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-3 py-1.5 text-[13px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)] sm:w-auto"
                title={`New Task`}
              >
                <TaskCaptureForm
                  action={createWorkItemAction}
                  fastAction={quickCaptureAction}
                  projects={[{ id: project.id, name: project.name }]}
                  sections={project.sections.map((entry) => ({
                    id: entry.id,
                    name: entry.name,
                    projectId: project.id,
                    projectName: project.name,
                  }))}
                  tags={scaffold.tags.map((tag) => ({
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                  }))}
                  redirectTo={`/projects/${project.id}`}
                  defaultProjectId={project.id}
                  defaultSectionId={section.id}
                  defaultStatus={WorkItemStatus.planned}
                  titlePlaceholder={`Add to ${section.name}`}
                />
              </RevealSheet>
            </div>
            <div className="grouped-section">
              {section.items.length ? (
                section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="grouped-row grouped-row-start grouped-row-mobile-stack transition hover:bg-[color:var(--app-surface-subtle)]"
                  >
                    <span
                      className={`mt-2 h-2.5 w-2.5 flex-none rounded-full ${workItemStatusAccent[item.status]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-[17px] font-medium tracking-[-0.02em] text-[color:var(--app-text)] sm:truncate">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                            {item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No date"}
                            {item.subtasks.length ? ` • ${item.completedSubtasks}/${item.subtasks.length}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
                          <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${workItemStatusTone[item.status]}`}>
                            {formatStatusLabel(item.status)}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${workItemPriorityTone[item.priority]}`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="grouped-row">
                  <div className="min-w-0 flex-1">
                    <p className="grouped-row-copy">Nothing here.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}

        {unsectionedItems.length ? (
          <section className="space-y-2">
            <div className="px-1">
              <p className="section-title">Other</p>
            </div>
            <div className="grouped-section">
              {unsectionedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="grouped-row grouped-row-mobile-stack transition hover:bg-[color:var(--app-surface-subtle)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-[17px] font-medium tracking-[-0.02em] text-[color:var(--app-text)] sm:truncate">
                      {item.title}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${workItemStatusTone[item.status]}`}>
                    {formatStatusLabel(item.status)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {!openItems.length ? <EmptyState title="Nothing open." /> : null}
      </section>

      <section className="grouped-section">
        <div className="grouped-row grouped-row-mobile-stack">
          <div className="min-w-0 flex-1">
            <p className="grouped-row-title">Completed</p>
            <p className="grouped-row-copy">{completedItems.length} kept out of the main list.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {completedItems.length ? (
              <form action={archiveCompletedItemsAction} className="w-full sm:w-auto">
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="redirectTo" value={`/projects/${project.id}`} />
                <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                  Archive done
                </Button>
              </form>
            ) : null}
            <Link href={showCompleted ? `/projects/${project.id}` : `/projects/${project.id}?completed=1`} className="w-full sm:w-auto">
              <Button type="button" variant="ghost" className="w-full sm:w-auto">
                {showCompleted ? "Hide" : "Show"}
              </Button>
            </Link>
          </div>
        </div>
        {showCompleted ? (
          completedItems.length ? (
            completedItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="grouped-row grouped-row-mobile-stack transition hover:bg-[color:var(--app-surface-subtle)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[17px] font-medium tracking-[-0.02em] text-[color:var(--app-text)] sm:truncate">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                    {item.completedAt ? `Done ${formatDate(item.completedAt)}` : "Completed"}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="grouped-row">
              <div className="min-w-0 flex-1">
                <p className="grouped-row-copy">Nothing completed yet.</p>
              </div>
            </div>
          )
        ) : null}
      </section>

      <form action={deleteProjectAction}>
        <input type="hidden" name="id" value={project.id} />
        <Button fullWidth variant="danger">
          Delete project
        </Button>
      </form>
    </>
  );
}
