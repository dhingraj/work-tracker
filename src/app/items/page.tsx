import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  homeItemViewMeta,
  workItemPriorityTone,
  workItemStatusAccent,
  workItemStatusOptions,
  workItemStatusTone,
} from "@/lib/constants";
import { getItemsPageData } from "@/lib/data";
import { formatDate, formatStatusLabel } from "@/lib/utils";

type SearchParams = Promise<{
  status?: string;
  projectId?: string;
  date?: string;
  overdue?: string;
  view?: string;
}>;

type ResolvedSearchParams = {
  status?: string;
  projectId?: string;
  date?: string;
  overdue?: string;
  view?: string;
};

const filterFieldNames = ["status", "projectId", "date", "overdue", "view"] as const;

function PersistentFilterInputs({
  filters,
  exclude = [],
}: {
  filters: ResolvedSearchParams;
  exclude?: Array<(typeof filterFieldNames)[number]>;
}) {
  return filterFieldNames.map((name) => {
    if (exclude.includes(name)) {
      return null;
    }

    const value = filters[name];
    if (!value) {
      return null;
    }

    return <input key={name} type="hidden" name={name} value={value} />;
  });
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = await searchParams;
  const data = await getItemsPageData(filters);
  const activeViewMeta = data.activeView ? homeItemViewMeta[data.activeView] : null;
  const resetHref = activeViewMeta?.href ?? "/items";

  return (
    <>
      <section className="space-y-3">
        <div className="grouped-section">
          <form className="grouped-row">
            <PersistentFilterInputs filters={filters} exclude={["projectId", "status"]} />
            <select
              name="projectId"
              defaultValue={filters.projectId ?? ""}
              className="app-select min-w-0 flex-1"
            >
              <option value="">All projects</option>
              {data.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="app-select min-w-0 flex-1"
            >
              <option value="">Open</option>
              {workItemStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </form>
          <form className="grouped-row grouped-row-mobile-stack">
            <PersistentFilterInputs filters={filters} exclude={["date", "overdue"]} />
            <input
              name="date"
              type="date"
              defaultValue={filters.date ?? ""}
              className="app-input"
            />
            <label className="app-chip w-full sm:w-auto">
              <input
                type="checkbox"
                name="overdue"
                value="1"
                defaultChecked={filters.overdue === "1"}
                className="app-checkbox rounded"
              />
              <span>Overdue</span>
            </label>
            <Link href={resetHref} className="w-full sm:w-auto">
              <Button type="button" variant="ghost" className="w-full sm:w-auto">
                Reset
              </Button>
            </Link>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Apply
            </Button>
          </form>
        </div>
      </section>

      {data.items.length ? (
        <section className="grouped-section">
          {data.items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="grouped-row grouped-row-start transition hover:bg-[color:var(--app-surface-subtle)]"
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
                      {item.project?.name ?? "Inbox"}
                      {item.section ? ` • ${item.section.name}` : ""}
                      {item.dueDate ? ` • Due ${formatDate(item.dueDate)}` : ""}
                      {item.totalSubtasks ? ` • ${item.completedSubtasks}/${item.totalSubtasks}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <Badge className={workItemStatusTone[item.status]}>
                      {formatStatusLabel(item.status)}
                    </Badge>
                    <Badge className={workItemPriorityTone[item.priority]}>{item.priority}</Badge>
                  </div>
                </div>
                {item.notes ? (
                  <p className="mt-2 break-words text-[14px] leading-5 text-[color:var(--app-text-secondary)]">
                    {item.notes}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState title="No tasks matched." description="Try a different filter." />
      )}
    </>
  );
}
