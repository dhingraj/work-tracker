import Link from "next/link";

import { TagFields } from "@/components/forms/tag-fields";
import { ThemeSelector } from "@/components/theme/theme-selector";
import { Button } from "@/components/ui/button";
import { RevealSheet } from "@/components/ui/reveal-sheet";
import { getSettingsPageData, getWorkspaceScaffold } from "@/lib/data";
import { createTagAction, deleteTagAction } from "@/server/actions/work-items";
import { updateSettingsAction } from "@/server/actions/settings";

const secondaryTriggerClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] px-4 py-2.5 text-[15px] font-semibold text-[color:var(--app-text)] transition hover:bg-[color:var(--app-surface-muted)] sm:w-auto";

const primaryTriggerClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[color:var(--app-blue)] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(0,122,255,0.2)] transition hover:bg-[color:var(--app-blue-strong)] sm:w-auto";

export default async function SettingsPage() {
  const [data, scaffold] = await Promise.all([
    getSettingsPageData(),
    getWorkspaceScaffold(),
  ]);

  return (
    <>
      <section className="flex flex-wrap justify-end gap-2 px-1">
        <Link href="/logout" className={secondaryTriggerClassName}>
          Sign out
        </Link>
        <RevealSheet
          triggerContent="New tag"
          triggerClassName={secondaryTriggerClassName}
          title="Create tag"
        >
          <form action={createTagAction} className="space-y-4">
            <TagFields />
            <Button fullWidth variant="secondary">
              Save tag
            </Button>
          </form>
        </RevealSheet>
        <RevealSheet
          triggerContent="Edit defaults"
          triggerClassName={primaryTriggerClassName}
          title="Edit defaults"
        >
          <form action={updateSettingsAction} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                defaultValue={data.user.name}
                placeholder="Name"
                className="app-input"
              />
              <input
                name="email"
                type="email"
                defaultValue={data.user.email}
                placeholder="Email"
                className="app-input"
              />
            </div>
            <input
              name="timezone"
              defaultValue={data.user.timezone}
              placeholder="Timezone"
              className="app-input"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                name="dailyTargetMinutes"
                type="number"
                min="30"
                defaultValue={data.user.dailyTargetMinutes}
                placeholder="Daily target"
                className="app-input"
              />
              <input
                name="deepWorkTarget"
                type="number"
                min="0"
                defaultValue={data.user.deepWorkTarget}
                placeholder="Deep work target"
                className="app-input"
              />
              <input
                name="defaultSessionMinutes"
                type="number"
                min="10"
                defaultValue={data.user.defaultSessionMinutes}
                placeholder="Default focus block"
                className="app-input"
              />
            </div>
            <select
              name="weekStartsOn"
              defaultValue={data.user.weekStartsOn}
              className="app-select"
            >
              <option value={0}>Week starts on Sunday</option>
              <option value={1}>Week starts on Monday</option>
            </select>
            <Button fullWidth>Save settings</Button>
          </form>
        </RevealSheet>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <section className="space-y-3">
            <p className="section-label px-1">Appearance</p>
            <div className="grouped-section">
              <div className="px-4 py-4">
                <ThemeSelector />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="section-label px-1">Defaults</p>

            <div className="grouped-section">
              <div className="grouped-row grouped-row-mobile-stack">
                <div className="min-w-0 flex-1">
                  <p className="grouped-row-title">Profile</p>
                  <p className="grouped-row-copy">{data.user.email}</p>
                </div>
                <span className="grouped-row-value">{data.user.name}</span>
              </div>
              <div className="grouped-row grouped-row-mobile-stack">
                <p className="min-w-0 flex-1 grouped-row-title">Timezone</p>
                <span className="grouped-row-value">{data.user.timezone}</span>
              </div>
              <div className="grouped-row grouped-row-mobile-stack">
                <p className="min-w-0 flex-1 grouped-row-title">Week start</p>
                <span className="grouped-row-value">
                  {data.user.weekStartsOn === 0 ? "Sunday" : "Monday"}
                </span>
              </div>
              <div className="border-t border-[color:var(--app-border-soft)] p-4">
                <div className="app-stat-grid sm:grid-cols-3">
                  <div className="app-stat-tile">
                    <p className="app-stat-label">Daily target</p>
                    <p className="app-stat-value">{data.user.dailyTargetMinutes}m</p>
                  </div>
                  <div className="app-stat-tile">
                    <p className="app-stat-label">Deep work</p>
                    <p className="app-stat-value">{data.user.deepWorkTarget}</p>
                  </div>
                  <div className="app-stat-tile">
                    <p className="app-stat-label">Focus block</p>
                    <p className="app-stat-value">{data.user.defaultSessionMinutes}m</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="space-y-3">
            <p className="section-label px-1">Workspace</p>

            <div className="grouped-section">
              <div className="p-4">
                <div className="app-stat-grid sm:grid-cols-3">
                  <div className="app-stat-tile">
                    <p className="app-stat-label">Projects</p>
                    <p className="app-stat-value">{scaffold.projects.length}</p>
                  </div>
                  <div className="app-stat-tile">
                    <p className="app-stat-label">Areas</p>
                    <p className="app-stat-value">{scaffold.areas.length}</p>
                  </div>
                  <div className="app-stat-tile">
                    <p className="app-stat-label">Tracked</p>
                    <p className="app-stat-value">
                      {Math.round(data.trackedMinutesLast30Sessions / 60)}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="section-label">Tags</p>
              <span className="text-[13px] text-[color:var(--app-text-tertiary)]">
                {scaffold.tags.length} total
              </span>
            </div>

            <div className="grouped-section">
              <div className="px-4 py-4">
                {scaffold.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {scaffold.tags.map((tag) => (
                      <form
                        key={tag.id}
                        action={deleteTagAction}
                        className="app-chip bg-[color:var(--app-surface-solid)]"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                        <input type="hidden" name="id" value={tag.id} />
                        <button
                          type="submit"
                          className="rounded-full px-2 py-0.5 text-xs text-[color:var(--app-text-tertiary)] transition hover:bg-[color:var(--app-surface-muted)] hover:text-[color:var(--app-red)]"
                        >
                          Remove
                        </button>
                      </form>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--app-text-secondary)]">No tags yet.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
