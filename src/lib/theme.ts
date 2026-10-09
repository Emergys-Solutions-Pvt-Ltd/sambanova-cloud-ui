import { THEME_STORAGE_KEY, type ThemePreference } from "@/stores/theme-store";

export type ResolvedTheme = "light" | "dark";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

/** Sets the resolved theme on <html>; tokens.css switches on `data-theme`. */
export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  return resolved;
}

/** Calls `onChange` when the OS light/dark setting flips. Returns an unsubscribe. */
export function watchSystemTheme(onChange: () => void) {
  const query = window.matchMedia(LIGHT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Inline <head> script that applies the saved theme before first paint, so the
 * page never flashes the wrong theme. Mirrors `applyTheme`, and reads the
 * Zustand persist format: { state: { theme }, version }. Falls back to the
 * CSS prefers-color-scheme rules if anything fails.
 */
export const themeInitScript = `(function(){try{var p="system";var raw=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(raw){var s=JSON.parse(raw);if(s&&s.state&&(s.state.theme==="light"||s.state.theme==="dark"||s.state.theme==="system"))p=s.state.theme;}var r=p==="system"?(window.matchMedia(${JSON.stringify(
  LIGHT_QUERY,
)}).matches?"light":"dark"):p;var d=document.documentElement;d.dataset.theme=r;d.dataset.themePreference=p;}catch(e){}})();`;
