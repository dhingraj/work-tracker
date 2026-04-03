import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] p-4 shadow-[var(--app-shadow-soft)] sm:p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
