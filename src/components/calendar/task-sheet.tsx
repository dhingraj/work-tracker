"use client";

import { useEffect, useId } from "react";

import { WorkItemStatus } from "@prisma/client";

import { TaskCaptureForm } from "@/components/forms/task-capture-form";
import { cn } from "@/lib/utils";
import { createWorkItemAction, quickCaptureAction } from "@/server/actions/work-items";

type CalendarTaskSheetProps = {
  open: boolean;
  onClose: () => void;
  selectedDateKey: string;
  selectedDateLabel: string;
  redirectTo: string;
  projects: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; projectId: string; projectName: string }>;
  tags: Array<{ id: string; name: string; color: string }>;
};

export function CalendarTaskSheet({
  open,
  onClose,
  selectedDateKey,
  selectedDateLabel,
  redirectTo,
  projects,
  sections,
  tags,
}: CalendarTaskSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const input =
        document.getElementById("quick-capture-title") ??
        document.getElementById("sheet-task-title");
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [onClose, open]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition",
        open ? "pointer-events-auto visible" : "pointer-events-none invisible",
      )}
    >
      <button
        type="button"
        aria-label="Close add task sheet"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[color:var(--app-overlay)] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[calc(100dvh-0.5rem)] flex-col overflow-hidden rounded-t-[1.5rem] border border-[color:var(--app-border)] bg-[color:var(--app-bg)] shadow-[var(--app-shadow-panel)] transition-transform duration-300 ease-out md:inset-x-auto md:bottom-auto md:left-1/2 md:top-6 md:max-h-[calc(100vh-3rem)] md:w-[min(34rem,calc(100vw-2rem))] md:-translate-x-1/2 md:rounded-[1.75rem]",
          open ? "translate-y-0 md:translate-y-0" : "translate-y-full md:-translate-x-1/2 md:translate-y-8",
        )}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-[color:var(--app-border)] bg-[color:var(--app-surface-muted)] px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="text-[17px] font-medium text-[color:var(--app-blue)]"
            >
              Cancel
            </button>
            <h2
              id={titleId}
              className="min-w-0 break-words text-center text-[17px] font-semibold tracking-[-0.02em] text-[color:var(--app-text)]"
            >
              New Task
            </h2>
            <span className="w-14" />
          </header>

          <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-4">
            <TaskCaptureForm
              action={createWorkItemAction}
              fastAction={quickCaptureAction}
              projects={projects}
              sections={sections}
              tags={tags}
              redirectTo={redirectTo}
              defaultDueDate={selectedDateKey}
              defaultStatus={WorkItemStatus.planned}
              titlePlaceholder={`Add to ${selectedDateLabel}`}
              submitLabel="Add"
              detailsLabel="More"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
