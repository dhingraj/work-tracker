"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FolderKanban,
  Home,
  ListTodo,
  Search,
  Settings,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const quickLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Tasks", href: "/items", icon: ListTodo },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Timer", href: "/timer", icon: Clock3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function navigateToSearch() {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigateToSearch();
  }

  function handleLinkClick(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition-all duration-200",
        open ? "pointer-events-auto visible" : "pointer-events-none invisible",
      )}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[color:var(--app-overlay)] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-x-3 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] mx-auto max-w-xl overflow-hidden rounded-[1.5rem] border border-[color:var(--app-border)] bg-[color:var(--app-surface-solid)] shadow-[var(--app-shadow-panel)] transition-all duration-200",
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        {/* Search input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-b border-[color:var(--app-border-soft)] px-4 py-3.5"
        >
          <Search className="h-5 w-5 flex-none text-[color:var(--app-text-tertiary)]" />
          <input
            ref={inputRef}
            id={titleId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[17px] text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-placeholder)] focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-full p-1 text-[color:var(--app-text-tertiary)] transition hover:text-[color:var(--app-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-[color:var(--app-border-soft)] bg-[color:var(--app-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--app-text-tertiary)] transition hover:text-[color:var(--app-text)]"
            >
              Esc
            </button>
          )}
        </form>

        {/* Quick links */}
        <div className="p-2">
          {query.trim() ? (
            <button
              type="button"
              onClick={navigateToSearch}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[color:var(--app-surface-muted)]"
            >
              <Search className="h-4 w-4 flex-none text-[color:var(--app-blue)]" />
              <span className="text-[15px] font-medium text-[color:var(--app-text)]">
                Search for &ldquo;{query}&rdquo;
              </span>
            </button>
          ) : null}
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold tracking-wide text-[color:var(--app-text-tertiary)] uppercase">
            Jump to
          </p>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleLinkClick(link.href)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-[color:var(--app-surface-muted)]"
                >
                  <Icon className="h-4 w-4 flex-none text-[color:var(--app-text-tertiary)]" />
                  <span className="text-[15px] font-medium text-[color:var(--app-text)]">
                    {link.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopBar() {
  const [open, setOpen] = useState(false);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[color:var(--app-border-soft)] bg-[color:var(--app-nav)] px-4 pb-2.5 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] backdrop-blur-xl md:left-1/2 md:max-w-5xl md:-translate-x-1/2">
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-[color:var(--app-text)]">
          Work Tracker
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--app-text-tertiary)] transition hover:bg-[color:var(--app-surface-muted)] hover:text-[color:var(--app-text)]"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
