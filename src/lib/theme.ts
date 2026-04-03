export const THEME_STORAGE_KEY = "work-tracker-theme";

export const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export type ThemePreference = (typeof themeOptions)[number]["value"];
export type ResolvedTheme = "light" | "dark";

export function isThemePreference(value: unknown): value is ThemePreference {
  return themeOptions.some((option) => option.value === value);
}

export function getThemeScript() {
  return `
    (() => {
      const storageKey = "${THEME_STORAGE_KEY}";
      const root = document.documentElement;
      const stored = window.localStorage.getItem(storageKey);
      const preference =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "dark";
      const resolved =
        preference === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : preference;

      root.dataset.themePreference = preference;
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    })();
  `;
}
