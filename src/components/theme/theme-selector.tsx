"use client";

import { cn } from "@/lib/utils";
import { themeOptions } from "@/lib/theme";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeSelector() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="Theme preference"
        className="app-segmented-control"
      >
        {themeOptions.map((option) => {
          const active = option.value === theme;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(option.value)}
              className={cn("app-segmented-option", active && "app-segmented-option-active")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-[color:var(--app-text-tertiary)]">
        {theme === "system"
          ? `Following system appearance, currently ${resolvedTheme}.`
          : `${resolvedTheme[0].toUpperCase()}${resolvedTheme.slice(1)} mode is active.`}
      </p>
    </div>
  );
}
