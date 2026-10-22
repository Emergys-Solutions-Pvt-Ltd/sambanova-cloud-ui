import { env } from "@/config/env";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/stores/theme-store";

export type ResolvedTheme = "light" | "dark";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

/**
 * The theme the app shows while the switcher is off (`NEXT_PUBLIC_ENABLE_THEME_SWITCHER`). A saved
 * choice or the OS setting is ignored then, and left untouched in storage for when it comes back.
 */
export const LOCKED_THEME: ResolvedTheme = "dark";

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (!env.themeSwitcher) return LOCKED_THEME;
  if (preference !== "system") return preference;
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

/** Sets the resolved theme on <html>; tokens.css switches on `data-theme`. */
export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themePreference = env.themeSwitcher ? preference : LOCKED_THEME;
  return resolved;
}

/** Calls `onChange` when the OS light/dark setting flips. Returns an unsubscribe. */
export function watchSystemTheme(onChange: () => void) {
  const query = window.matchMedia(LIGHT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Inline <head> script that applies the theme before first paint, so the page never flashes the
 * wrong theme. With the switcher off it just sets dark. With it on it mirrors `applyTheme`, reads
 * the Zustand persist format ({ state: { theme }, version }) and defaults to dark when nothing is
 * saved. Falls back to the markup's own `data-theme="dark"` if anything fails.
 */
export const themeInitScript = env.themeSwitcher
  ? `(function(){try{var p="dark";var raw=localStorage.getItem(${JSON.stringify(
      THEME_STORAGE_KEY,
    )});if(raw){var s=JSON.parse(raw);if(s&&s.state&&(s.state.theme==="light"||s.state.theme==="dark"||s.state.theme==="system"))p=s.state.theme;}var r=p==="system"?(window.matchMedia(${JSON.stringify(
      LIGHT_QUERY,
    )}).matches?"light":"dark"):p;var d=document.documentElement;d.dataset.theme=r;d.dataset.themePreference=p;}catch(e){}})();`
  : `(function(){var d=document.documentElement;d.dataset.theme=${JSON.stringify(
      LOCKED_THEME,
    )};d.dataset.themePreference=${JSON.stringify(LOCKED_THEME)};})();`;
