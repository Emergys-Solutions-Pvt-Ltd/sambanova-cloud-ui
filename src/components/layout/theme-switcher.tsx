"use client";

import { Icon, type IconName } from "@/components/ui/icon/icon";
import { cn } from "@/lib/cn";
import {
  selectSetTheme,
  selectTheme,
  type ThemePreference,
  useThemeStore,
} from "@/stores/theme-store";

export const themeOptions: readonly { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: "system", label: "System", icon: "monitor" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

/**
 * Pill container, shared by this switcher and the radio items inside the account menu. Figma
 * (Component 98): 82x28, 1px border inside, three 22px segments 4px apart, 3px / 2px inner padding.
 */
export const themePillClasses =
  "inline-flex items-center gap-1 rounded-full border border-switcher-border bg-switcher px-0.75 py-0.5";

export const themeSegmentClasses =
  "flex size-5.5 items-center justify-center rounded-full text-muted outline-none " +
  "transition-colors duration-(--sn-duration-fast) ease-standard hover:text-primary " +
  "aria-checked:bg-switcher-active aria-checked:text-primary data-[highlighted]:text-primary " +
  "focus-visible:outline-2 focus-visible:outline-offset-1";

/** System / Light / Dark segmented control (Figma: sidebar footer "Theme" row). */
export function ThemeSwitcher({ className }: { className?: string }) {
  const theme = useThemeStore(selectTheme);
  const setTheme = useThemeStore(selectSetTheme);

  return (
    <div role="radiogroup" aria-label="Theme" className={cn(themePillClasses, className)}>
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => setTheme(option.value)}
          className={themeSegmentClasses}
        >
          <Icon name={option.icon} size={14} />
        </button>
      ))}
    </div>
  );
}
