"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";
import { routes } from "@/config/routes";
import { cn } from "@/lib/cn";
import { selectSetTheme, selectTheme, useThemeStore } from "@/stores/theme-store";

import { themeOptions, ThemeSwitcher } from "./theme-switcher";

/** Signed-out footer: "Sign Up for Free" + the Theme row (Figma: guest sidebar, dark and light). */
export function GuestFooter({ collapsed }: { collapsed?: boolean }) {
  const theme = useThemeStore(selectTheme);
  const setTheme = useThemeStore(selectSetTheme);

  if (collapsed) {
    // Icon rail: sign-up link and a button that cycles System → Light → Dark.
    const index = themeOptions.findIndex((option) => option.value === theme);
    const next = themeOptions[(index + 1) % themeOptions.length]!;
    const current = themeOptions[index]!;
    return (
      <div className="flex flex-col items-center gap-2">
        <Tooltip content="Sign Up for Free">
          <Link
            href={routes.signup}
            aria-label="Sign Up for Free"
            className={cn(
              "flex size-11 items-center justify-center rounded-sm border border-control",
              "text-primary hover:bg-hover",
            )}
          >
            <Icon name="user" size="md" />
          </Link>
        </Tooltip>
        <Tooltip content={`Theme: ${current.label}`}>
          <IconButton
            icon={current.icon}
            size="lg"
            aria-label={`Theme: ${current.label}. Switch to ${next.label}`}
            onClick={() => setTheme(next.value)}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button href={routes.signup} variant="control" size="sm" fullWidth>
        Sign Up for Free
      </Button>
      <div className="flex items-center justify-between gap-4 border-t border-default pt-3">
        <span className="text-body-lg text-secondary">Theme</span>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
