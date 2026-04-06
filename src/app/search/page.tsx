import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  workItemPriorityTone,
  workItemStatusAccent,
  workItemStatusTone,
} from "@/lib/constants";
import { searchWorkspace } from "@/lib/search";
import { cn, formatDate, formatStatusLabel } from "@/lib/utils";

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const results = await searchWorkspace(q ?? "");

  return (
    <>
      <section>
        <form method="GET" action="/search" className="grouped-section">
          <div className="grouped-row gap-3">
            <Search className="h-5 w-5 flex-none text-[color:var(--app-text-tertiary)]" />
            <input
              name="q"
              type="search"
              defaultValue={results.query}
              placeholder="Search tasks, projects…"
              autoFocus
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[17px] text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-placeholder)] focus:outline-none"
            />
            {results.query ? (
              <Link
                href="/search"
                className="shrink-0 text-[15px] font-medium text-[color:var(--app-blue)]"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      {!results.query ? (
        <EmptyState
          title="Search your workspace"
          description="Find tasks and projects by title or content."
        />
      ) : results.items.length === 0 && results.projects.length === 0 ? (
        <EmptyState
          title={`No results for "${results.query}"`}
          description="Try a different search term."
        />
      ) : null}

      {results.projects.length > 0 ? (
        <section className="space-y-3">
          <p className="section-label px-1">Projects</p>
          <div className="grouped-section">
            {results.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="grouped-row grouped-row-mobile-stack transition hover:bg-[color:var(--app-surface-subtle)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="grouped-row-title">{project.name}</p>
                  <p className="grouped-row-copy">
                    {formatStatusLabel(project.status)}
                  </p>
                </div>
                <span className="grouped-row-value">
                  {project.openCount} open
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {results.items.length > 0 ? (
        <section className="space-y-3">
          <p className="section-label px-1">
            Tasks
            <span className="ml-2 font-normal text-[color:var(--app-text-placeholder)]">
              {results.items.length} found
            </span>
          </p>
          <div className="grouped-section">
            {results.items.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="grouped-row grouped-row-start transition hover:bg-[color:var(--app-surface-subtle)]"
              >
                <span
                  className={cn(
                    "mt-2 h-2.5 w-2.5 flex-none rounded-full",
                    workItemStatusAccent[item.status],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-[17px] font-medium tracking-[-0.02em] text-[color:var(--app-text)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[13px] text-[color:var(--app-text-tertiary)]">
                        {item.projectName ?? "Inbox"}
                        {item.dueDate
                          ? ` · Due ${formatDate(item.dueDate)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Badge className={workItemStatusTone[item.status]}>
                        {formatStatusLabel(item.status)}
                      </Badge>
                      <Badge
                        className={
                          workItemPriorityTone[
                            item.priority as keyof typeof workItemPriorityTone
                          ]
                        }
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                  {item.notes ? (
                    <p className="mt-2 line-clamp-2 break-words text-[14px] leading-5 text-[color:var(--app-text-secondary)]">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
