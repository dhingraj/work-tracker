"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FolderKanban, Home, ListTodo, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/items", label: "Tasks", icon: ListTodo },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--app-border)] bg-[color:var(--app-nav)] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 backdrop-blur-xl md:left-1/2 md:max-w-xl md:-translate-x-1/2 md:rounded-t-[1.35rem] md:border md:border-b-0">
      <ul className="grid grid-cols-5 gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition",
                  active
                    ? "bg-[color:var(--app-surface-solid)] text-[color:var(--app-blue)] shadow-[var(--app-shadow-soft)]"
                    : "text-[color:var(--app-text-tertiary)] hover:bg-[color:var(--app-surface-muted)] hover:text-[color:var(--app-text)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
