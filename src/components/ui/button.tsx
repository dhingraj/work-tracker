import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  type = "submit",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 max-w-full flex-wrap items-center justify-center rounded-full px-4 py-2.5 text-center text-[15px] font-semibold leading-5 transition duration-150 whitespace-normal break-words",
        "focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        "focus:ring-4 focus:ring-[color:var(--app-blue-soft)]",
        variant === "primary" &&
          "bg-[color:var(--app-blue)] text-white shadow-[0_8px_18px_rgba(0,122,255,0.2)] hover:bg-[color:var(--app-blue-strong)]",
        variant === "secondary" &&
          "border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] text-[color:var(--app-text)] hover:bg-[color:var(--app-surface-muted)]",
        variant === "ghost" &&
          "bg-transparent text-[color:var(--app-blue)] hover:bg-[color:var(--app-blue-soft)]",
        variant === "danger" && "bg-[color:var(--app-red)] text-white hover:opacity-90",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
