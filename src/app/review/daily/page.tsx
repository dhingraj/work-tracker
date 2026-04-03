import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import { getDailyReviewPageData } from "@/lib/data";
import { formatMinutes } from "@/lib/utils";
import { saveDailyPlanAction, saveDailyReviewAction } from "@/server/actions/review";

const secondaryTriggerClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-4 py-2.5 text-[15px] font-semibold text-[color:var(--app-text)] transition hover:bg-[color:var(--app-surface-muted)]";

export default async function DailyReviewPage() {
  const data = await getDailyReviewPageData();
  const plannedItems = [data.plan?.top1, data.plan?.top2, data.plan?.top3];

  return (
    <>
      <PageHeader
        eyebrow="Daily Review"
        title="Plan the day and close the loop"
        description="Pick a realistic top three, then capture what completed, what got blocked, and what should carry forward."
      />

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <section className="space-y-3">
            <div className="px-1">
              <p className="section-label">Snapshot</p>
              <h2 className="section-title">Today at a glance</h2>
            </div>
            <div className="app-stat-grid sm:grid-cols-2">
              <div className="app-stat-tile">
                <p className="app-stat-label">Tracked today</p>
                <p className="app-stat-value">{formatMinutes(data.todayMinutes)}</p>
                <p className="app-stat-copy">Logged focus so far</p>
              </div>
              <div className="app-stat-tile">
                <p className="app-stat-label">Planning pool</p>
                <p className="app-stat-value">{data.items.length}</p>
                <p className="app-stat-copy">Eligible items</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="px-1">
              <p className="section-label">Top 3</p>
              <h2 className="section-title">Today’s plan</h2>
            </div>

            <div className="grouped-section">
              {plannedItems.some(Boolean) ? (
                plannedItems.map((item, index) =>
                  item ? (
                    <div key={item.id} className="grouped-row">
                      <div className="min-w-0 flex-1">
                        <p className="grouped-row-title">Priority {index + 1}</p>
                        <p className="grouped-row-copy">{item.title}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={`empty-${index + 1}`} className="grouped-row">
                      <div className="min-w-0 flex-1">
                        <p className="grouped-row-title">Priority {index + 1}</p>
                        <p className="grouped-row-copy">Unassigned</p>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="grouped-row">
                  <div className="min-w-0 flex-1">
                    <p className="grouped-row-title">No plan saved yet</p>
                    <p className="grouped-row-copy">
                      Choose a small top three before the day starts moving.
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-[color:var(--app-border-soft)] p-4">
                {data.plan?.note ? (
                  <p className="rounded-[1rem] border border-[color:var(--app-border-soft)] bg-[color:var(--app-surface-muted)] px-4 py-3 text-sm text-[color:var(--app-text-secondary)]">
                    {data.plan.note}
                  </p>
                ) : (
                  <p className="text-sm text-[color:var(--app-text-secondary)]">
                    No planning note saved yet.
                  </p>
                )}

                <div className="mt-4">
                  <RevealSheet
                    triggerContent="Edit plan"
                    triggerClassName={secondaryTriggerClassName}
                    eyebrow="Top 3"
                    title="Today’s plan"
                    description="Choose a realistic top three and define what a good day looks like."
                  >
                    <form action={saveDailyPlanAction} className="space-y-4">
                      {[1, 2, 3].map((slot) => {
                        const field = `top${slot}Id` as const;
                        const selected =
                          slot === 1
                            ? data.plan?.top1Id ?? ""
                            : slot === 2
                              ? data.plan?.top2Id ?? ""
                              : data.plan?.top3Id ?? "";

                        return (
                          <div key={field} className="space-y-1.5">
                            <label
                              htmlFor={field}
                              className="text-sm font-medium text-[color:var(--app-text)]"
                            >
                              Priority {slot}
                            </label>
                            <select
                              id={field}
                              name={field}
                              defaultValue={selected}
                              className="app-select"
                            >
                              <option value="">Unassigned</option>
                              {data.items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                      <textarea
                        name="note"
                        rows={4}
                        defaultValue={data.plan?.note ?? ""}
                        placeholder="What does a good day actually look like?"
                        className="app-textarea"
                      />
                      <Button fullWidth>Save daily plan</Button>
                    </form>
                  </RevealSheet>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-3">
          <div className="px-1">
            <p className="section-label">Reflection</p>
            <h2 className="section-title">End-of-day review</h2>
          </div>

          <div className="grouped-section">
            <div className="grouped-row grouped-row-start">
              <div className="min-w-0 flex-1">
                <p className="grouped-row-title">Completed</p>
                <p className="mt-1 text-[14px] leading-5 text-[color:var(--app-text-secondary)]">
                  {data.review?.completed || "No reflection saved yet."}
                </p>
              </div>
            </div>
            <div className="grouped-row grouped-row-start">
              <div className="min-w-0 flex-1">
                <p className="grouped-row-title">Carry forward</p>
                <p className="mt-1 text-[14px] leading-5 text-[color:var(--app-text-secondary)]">
                  {data.review?.carryForward || "Nothing captured yet."}
                </p>
              </div>
            </div>
            <div className="grouped-row grouped-row-mobile-stack">
              <div className="min-w-0 flex-1">
                <p className="grouped-row-title">Energy score</p>
                <p className="grouped-row-copy">Quick quality signal for the day</p>
              </div>
              <span className="grouped-row-value">
                {data.review?.energyScore ? `${data.review.energyScore} / 5` : "Not scored"}
              </span>
            </div>
            <div className="border-t border-[color:var(--app-border-soft)] p-4">
              <RevealSheet
                triggerContent="Edit review"
                triggerClassName={secondaryTriggerClassName}
                eyebrow="Reflection"
                title="End-of-day review"
                description="Capture what completed, what blocked progress, and what should carry forward."
              >
                <form action={saveDailyReviewAction} className="space-y-4">
                  <textarea
                    name="completed"
                    rows={3}
                    defaultValue={data.review?.completed ?? ""}
                    placeholder="What completed?"
                    className="app-textarea"
                  />
                  <textarea
                    name="blocked"
                    rows={3}
                    defaultValue={data.review?.blocked ?? ""}
                    placeholder="What got blocked?"
                    className="app-textarea"
                  />
                  <textarea
                    name="lessons"
                    rows={3}
                    defaultValue={data.review?.lessons ?? ""}
                    placeholder="What did today teach?"
                    className="app-textarea"
                  />
                  <textarea
                    name="carryForward"
                    rows={3}
                    defaultValue={data.review?.carryForward ?? ""}
                    placeholder="What should carry forward?"
                    className="app-textarea"
                  />
                  <div className="space-y-1.5">
                    <label
                      htmlFor="energyScore"
                      className="text-sm font-medium text-[color:var(--app-text)]"
                    >
                      Energy score
                    </label>
                    <select
                      id="energyScore"
                      name="energyScore"
                      defaultValue={data.review?.energyScore ?? ""}
                      className="app-select"
                    >
                      <option value="">Not scored</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button fullWidth>Save daily review</Button>
                </form>
              </RevealSheet>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
