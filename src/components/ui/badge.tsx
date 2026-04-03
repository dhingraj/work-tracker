import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center justify-center rounded-full px-2.5 py-1 text-center text-xs font-medium break-words",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
