import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4 px-1 py-1 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="text-[13px] font-medium tracking-[-0.01em] text-[color:var(--app-text-tertiary)]">
            {eyebrow}
          </p>
        ) : null}
        <div className="min-w-0 space-y-1">
          <h1 className="break-words text-[1.75rem] font-semibold tracking-[-0.045em] text-[color:var(--app-text)] md:text-[2.35rem]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl break-words text-[14px] leading-5 text-[color:var(--app-text-secondary)] md:text-[15px] md:leading-6">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
    </div>
  );
}
