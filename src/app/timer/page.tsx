import Link from "next/link";

import { LiveTimer } from "@/components/timer/live-timer";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import { getTimerPageData } from "@/lib/data";
import { formatDateTime, formatMinutes } from "@/lib/utils";
import {
  createManualSessionAction,
  deleteTimeSessionAction,
  startTimerAction,
  stopTimerAction,
} from "@/server/actions/timer";

const secondaryTriggerClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-4 py-2.5 text-[15px] font-semibold text-[color:var(--app-text)] transition hover:bg-[color:var(--app-surface-muted)]";

export default async function TimerPage() {
  const data = await getTimerPageData();

  return (
    <>
      <PageHeader
        eyebrow="Focus"
        title="Run a session or backfill time"
        description="Use this screen after planning in Calendar. Keep time logging lightweight and only as detailed as execution requires."
        actions={
          <Link href="/calendar">
            <Button type="button" variant="secondary">
              Back to calendar
            </Button>
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <section className="app-accent-panel p-5">
            <div>
              <p className="section-label">Current</p>
              <h2 className="mt-1 break-words text-[1.8rem] font-semibold tracking-[-0.04em] text-[color:var(--app-text)]">
                {data.activeSession?.workItem?.title ?? "No active session"}
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-[color:var(--app-text-secondary)]">
                {data.activeSession ? (
                  <>
                    Running for <LiveTimer startedAt={data.activeSession.startedAt.toISOString()} />
                  </>
                ) : (
                  "Choose a planned item below and start a focus block when you are ready."
                )}
              </p>
            </div>

            {data.activeSession ? (
              <form action={stopTimerAction} className="mt-5 space-y-3">
                <input type="hidden" name="sessionId" value={data.activeSession.id} />
                <textarea
                  name="sessionNotes"
                  rows={3}
                  placeholder="What changed during this block?"
                  className="app-textarea"
                />
                <input
                  name="interruptionReason"
                  placeholder="Interruption reason, if any"
                  className="app-input"
                />
                <Button className="w-full">Stop timer</Button>
              </form>
            ) : null}
          </section>

          <section className="space-y-3">
            <div className="px-1">
              <p className="section-label">Start Focus</p>
              <h2 className="section-title">Quick launch</h2>
            </div>

            {data.workItems.length ? (
              <div className="grouped-section">
                {data.workItems.map((item) => (
                  <form
                    key={item.id}
                    action={startTimerAction}
                    className="grouped-row grouped-row-start grouped-row-mobile-stack"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="grouped-row-title">{item.title}</p>
                      <p className="grouped-row-copy">
                        {item.project?.name ?? "No project"} • {item.status.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                      <Badge
                        className={
                          item.status === "blocked"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200"
                            : "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-200"
                        }
                      >
                        {item.priority}
                      </Badge>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <label className="app-chip w-full px-3 py-2 text-xs sm:w-auto">
                          <input
                            type="checkbox"
                            name="isDeepWork"
                            defaultChecked
                            className="app-checkbox rounded"
                          />
                          <span>Deep</span>
                        </label>
                        <input type="hidden" name="workItemId" value={item.id} />
                        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                          Start
                        </Button>
                      </div>
                    </div>
                  </form>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No eligible items to start."
                description="Move an item into planned or in-progress status first."
                actionHref="/items"
                actionLabel="Open items"
              />
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="space-y-3">
            <div className="px-1">
              <p className="section-label">Manual Entry</p>
              <h2 className="section-title">Backfill a session</h2>
            </div>

            <div className="grouped-section">
              <div className="grouped-row grouped-row-start">
                <div className="min-w-0 flex-1">
                  <p className="grouped-row-title">Keep the timer view clean</p>
                  <p className="grouped-row-copy">
                    Use manual entry only when you need to recover time that was logged elsewhere.
                  </p>
                </div>
              </div>
              <div className="border-t border-[color:var(--app-border-soft)] p-4">
                <RevealSheet
                  triggerContent="Log manual time"
                  triggerClassName={secondaryTriggerClassName}
                  eyebrow="Manual entry"
                  title="Backfill a session"
                  description="Add a past work block without leaving the timer page."
                >
                  <form action={createManualSessionAction} className="space-y-3">
                    <select name="workItemId" defaultValue="" className="app-select">
                      <option value="">Unassigned session</option>
                      {data.workItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        name="startedAt"
                        type="datetime-local"
                        required
                        className="app-input"
                      />
                      <input
                        name="endedAt"
                        type="datetime-local"
                        required
                        className="app-input"
                      />
                    </div>
                    <textarea
                      name="sessionNotes"
                      rows={3}
                      placeholder="What got done?"
                      className="app-textarea"
                    />
                    <input
                      name="interruptionReason"
                      placeholder="Interruption reason, if relevant"
                      className="app-input"
                    />
                    <label className="app-chip px-4 py-3">
                      <input type="checkbox" name="isDeepWork" className="app-checkbox rounded" />
                      <span>Count as deep work</span>
                    </label>
                    <Button fullWidth>Save session</Button>
                  </form>
                </RevealSheet>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="px-1">
              <p className="section-label">Recent Sessions</p>
              <h2 className="section-title">Time log history</h2>
            </div>

            {data.recentSessions.length ? (
              <div className="grouped-section">
                {data.recentSessions.map((session) => (
                  <div key={session.id} className="grouped-row grouped-row-start grouped-row-mobile-stack">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <p className="grouped-row-title">
                            {session.workItem?.title ?? "Unassigned session"}
                          </p>
                          <p className="grouped-row-copy">
                            {formatDateTime(session.startedAt)} •{" "}
                            {formatMinutes(session.durationMinutes)}
                          </p>
                        </div>
                        <Badge
                          className={
                            session.isDeepWork
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {session.isDeepWork ? "Deep work" : session.source}
                        </Badge>
                      </div>
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
                ))}
              </div>
            ) : (
              <EmptyState
                title="No sessions yet."
                description="Time stays optional until you start logging focus blocks."
              />
            )}
          </section>
        </div>
      </section>
    </>
  );
}
