import Link from "next/link";

import { AreaFields } from "@/components/forms/area-fields";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import { getProjectsPageData } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import {
  deleteAreaAction,
  toggleProjectPinAction,
  updateAreaAction,
} from "@/server/actions/projects";

type SearchParams = Promise<{
  archived?: string;
}>;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const showArchived = params.archived === "1";
  const data = await getProjectsPageData({ showArchived });

  return (
    <>
      <section className="space-y-3">
        <div className="flex flex-wrap justify-end gap-2 px-1">
          <Link href={showArchived ? "/projects" : "/projects?archived=1"}>
            <Button type="button" variant="ghost">
              {showArchived ? "Hide archived" : "Show archived"}
            </Button>
          </Link>
        </div>

        {data.projects.length ? (
          <div className="grouped-section">
            {data.projects.map((project) => (
              <div key={project.id} className="grouped-row grouped-row-start grouped-row-mobile-stack">
                <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 flex-none rounded-full ${
                        project.health === "off_track"
                          ? "bg-rose-500"
                          : project.health === "at_risk"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                    />
                    <p className="break-words text-[17px] font-medium tracking-[-0.02em] text-[color:var(--app-text)] sm:truncate">
                      {project.name}
                    </p>
                    {project.pinned ? (
                      <span className="rounded-full bg-[color:var(--app-blue-tint)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--app-blue)]">
                        Pinned
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                    {project.area ? `${project.area.name} • ` : ""}
                    {project.status.replace("_", " ")}
                  </p>
                  <p className="mt-2 text-[13px] text-[color:var(--app-text-tertiary)]">
                    {project.openCount} open • {project.doneCount} done • {project.blockedCount} blocked
                  </p>
                  <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                    {project.nextDueItems.length
                      ? `Next: ${project.nextDueItems.map((item) => `${item.title} (${formatDate(item.dueDate)})`).join(", ")}`
                      : "No due items"}
                  </p>
                </Link>
                <form action={toggleProjectPinAction} className="w-full sm:w-auto">
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="redirectTo" value={showArchived ? "/projects?archived=1" : "/projects"} />
                  <Button type="submit" variant="ghost" className="w-full sm:w-auto">
                    {project.pinned ? "Unpin" : "Pin"}
                  </Button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No projects yet." />
        )}
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="section-label">Areas</p>
        </div>

        {data.areas.length ? (
          <div className="grouped-section">
            {data.areas.map((area) => (
              <div key={area.id} className="grouped-row grouped-row-start grouped-row-mobile-stack">
                <span
                  className="mt-1 h-3 w-3 flex-none rounded-full border border-black/5"
                  style={{ backgroundColor: area.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-medium tracking-[-0.02em] text-[color:var(--app-text)]">
                    {area.name}
                  </p>
                  {area.description ? (
                    <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                      {area.description}
                    </p>
                  ) : null}
                </div>
                <RevealSheet
                  triggerContent="Edit"
                  triggerClassName="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-3 py-1.5 text-[14px] font-semibold text-[color:var(--app-blue)] transition hover:bg-[color:var(--app-surface-muted)] sm:w-auto"
                  title={area.name}
                >
                  <form action={updateAreaAction} className="space-y-4">
                    <AreaFields area={area} />
                    <Button fullWidth variant="secondary">
                      Save area
                    </Button>
                  </form>
                  <form action={deleteAreaAction} className="mt-4">
                    <input type="hidden" name="id" value={area.id} />
                    <button
                      type="submit"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[color:var(--app-red)] px-4 py-2.5 text-[15px] font-semibold text-white transition hover:opacity-90"
                    >
                      Delete area
                    </button>
                  </form>
                </RevealSheet>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No areas yet." />
        )}
      </section>
    </>
  );
}
