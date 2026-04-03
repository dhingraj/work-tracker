"use client";

import type { ReactNode } from "react";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type RevealSheetProps = {
  triggerContent: ReactNode;
  triggerAriaLabel?: string;
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
  closeOnSubmit?: boolean;
};

export function RevealSheet({
  triggerContent,
  triggerAriaLabel,
  title,
  description,
  eyebrow,
  children,
  triggerClassName,
  panelClassName,
  contentClassName,
  closeOnSubmit = true,
}: RevealSheetProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={triggerAriaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        {triggerContent}
      </button>

      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 transition",
          open ? "pointer-events-auto visible" : "pointer-events-none invisible",
        )}
      >
        <button
          type="button"
          aria-label="Close panel"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-[color:var(--app-overlay)] transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />

        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[calc(100dvh-0.5rem)] overflow-hidden rounded-t-[1.5rem] border border-[color:var(--app-border)] bg-[color:var(--app-bg)] shadow-[var(--app-shadow-panel)] transition-transform duration-300 ease-out md:inset-y-4 md:left-1/2 md:right-auto md:w-[min(34rem,calc(100vw-2rem))] md:max-h-none md:-translate-x-1/2 md:rounded-[1.75rem]",
            open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full",
            panelClassName,
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-[color:var(--app-border)] bg-[color:var(--app-surface-muted)] px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
            <div className="min-w-0 space-y-2">
              <div className="h-1.5 w-14 rounded-full bg-[color:var(--app-border)] md:hidden" />
              {eyebrow ? (
                <p className="text-[13px] font-medium tracking-[-0.01em] text-[color:var(--app-text-tertiary)]">
                  {eyebrow}
                </p>
              ) : null}
              <div className="space-y-1">
                <h2
                  id={titleId}
                  className="break-words text-[1.45rem] font-semibold tracking-[-0.04em] text-[color:var(--app-text)] sm:text-[1.6rem]"
                >
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="break-words text-[15px] leading-6 text-[color:var(--app-text-secondary)]"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-full border border-[color:var(--app-border-soft)] bg-[color:var(--app-surface-solid)] p-2 text-[color:var(--app-text-tertiary)] transition hover:text-[color:var(--app-text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            onSubmitCapture={closeOnSubmit ? () => setOpen(false) : undefined}
            className={cn(
              "max-h-[calc(100dvh-7rem)] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-4 sm:px-5 sm:pt-5 md:max-h-[calc(100vh-9rem)] md:pb-6",
              contentClassName,
            )}
          >
            {children}
          </div>
        </section>
      </div>
    </>
  );
}
