"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon/icon";
import { iconNames } from "@/components/ui/icon/icon-data.generated";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import {
  selectSetTheme,
  selectTheme,
  type ThemePreference,
  useThemeStore,
} from "@/stores/theme-store";

const OPTIONS: { value: ThemePreference; label: string; icon: "monitor" | "sun" | "moon" }[] = [
  { value: "system", label: "System", icon: "monitor" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

/** Switches the whole app theme through useThemeStore (persisted). */
export function ThemeSwitch() {
  const theme = useThemeStore(selectTheme);
  const setTheme = useThemeStore(selectSetTheme);

  return (
    <div
      role="radiogroup"
      aria-label="App theme"
      className="inline-flex items-center gap-1 rounded-full border border-switcher-border bg-switcher p-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-caption",
            theme === option.value
              ? "bg-switcher-active text-primary"
              : "text-muted hover:text-primary",
          )}
        >
          <Icon name={option.icon} size="xs" />
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Resolved value of a CSS custom property on this element, read after mount. */
export function CssValue({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const read = () => {
      if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(name).trim());
    };
    read();
    // Re-read when the app theme changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [name]);

  return (
    <span ref={ref} className={cn("font-mono text-tiny break-all text-muted", className)}>
      {value || "…"}
    </span>
  );
}

/** Color swatch that copies its CSS variable on click. */
export function Swatch({
  variable,
  label,
  guessed,
}: {
  variable: string;
  label: string;
  guessed?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(`var(${variable})`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="group flex min-w-0 items-center gap-3 rounded-md p-1.5 text-left hover:bg-hover"
      title={`Copy var(${variable})`}
    >
      <span
        className="size-9 shrink-0 rounded-sm border border-default"
        style={{ background: `var(${variable})` }}
      />
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 text-caption text-primary">
          {label}
          {guessed && (
            <span className="rounded-xs bg-warning-bg px-1 text-micro text-warning">GUESS</span>
          )}
          {copied && <span className="text-micro text-success">copied</span>}
        </span>
        <CssValue name={variable} />
      </span>
    </button>
  );
}

export function IconGallery() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
      {iconNames.map((name) => (
        <li
          key={name}
          className="flex flex-col items-center gap-2 rounded-md border border-subtle p-3 text-center"
        >
          <Icon name={name} size="lg" className="text-secondary" />
          <span className="text-tiny break-all text-muted">{name}</span>
        </li>
      ))}
    </ul>
  );
}

/** Uncontrolled-looking Select demo (the real Select is controlled, so it keeps its own state here). */
export function SelectDemo() {
  const [value, setValue] = useState("a");
  return (
    <div className="w-53.25">
      <Select
        aria-label="Example model"
        value={value}
        onValueChange={setValue}
        groups={[
          {
            label: "Reasoning",
            options: [
              { value: "a", label: "DeepSeek-V3.1" },
              { value: "b", label: "gpt-oss-120b" },
            ],
          },
        ]}
      />
    </div>
  );
}
