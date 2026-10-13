"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { type ReactElement } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";
import { type SelectGroup } from "./select";

export type OptionMenuSurface = "flat" | "bordered";

export interface OptionMenuProps {
  /** Selected option, or null when nothing is chosen yet. */
  value: string | null;
  onValueChange: (value: string) => void;
  groups: SelectGroup[];
  /** Accessible name of the listbox trigger when the trigger has no better name of its own. */
  "aria-label": string;
  /** Any button-like element; it receives the Radix trigger props, `data-state` and the ref. */
  trigger: ReactElement;
  /** flat = borderless raised card (composer model menu); bordered = hairline card (compare columns). */
  surface: OptionMenuSurface;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /** Makes the menu exactly as wide as its trigger. */
  matchTriggerWidth?: boolean;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const surfaces: Record<OptionMenuSurface, { content: string; label: string; item: string }> = {
  flat: {
    content: "rounded-lg bg-surface-raised p-1 shadow-lg",
    label:
      "flex h-7 items-start truncate px-4 pt-2 text-caption leading-5 text-menu-label uppercase",
    item: "flex h-9 cursor-pointer items-center justify-between gap-2 rounded-item px-4 text-body leading-5 text-content outline-none select-none data-[highlighted]:bg-option-hover",
  },
  bordered: {
    content: "rounded-lg border border-hairline bg-surface-raised pt-2 pb-1.5 shadow-lg",
    label: "flex h-7 items-center truncate px-4 text-caption leading-5 text-menu-label uppercase",
    item: "flex h-9 cursor-pointer items-center justify-between gap-2 px-4 text-label text-content outline-none select-none data-[highlighted]:bg-option-hover",
  },
};

/**
 * Listbox menu opened from a custom trigger (Figma: Playground model menus). Radix Select supplies
 * the behaviour: arrow keys, Home / End, typeahead, Enter / Space to choose, Escape to close and
 * focus returning to the trigger. The selected row shows a check.
 */
export function OptionMenu({
  value,
  onValueChange,
  groups,
  "aria-label": ariaLabel,
  trigger,
  surface,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  matchTriggerWidth,
  contentClassName,
  open,
  onOpenChange,
}: OptionMenuProps) {
  const styles = surfaces[surface];
  return (
    <SelectPrimitive.Root
      // Radix treats "" as "no selection".
      value={value ?? ""}
      // Radix can report "" (e.g. while the value is missing from the options); never a real choice.
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectPrimitive.Trigger asChild aria-label={ariaLabel}>
        {trigger}
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={12}
          className={cn(
            "z-popover max-h-(--radix-select-content-available-height) overflow-hidden outline-none",
            "data-[state=open]:animate-pop-in",
            styles.content,
            matchTriggerWidth && "w-(--radix-select-trigger-width)",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="scrollbar-thin overflow-y-auto">
            {groups.map((group, index) => (
              <SelectPrimitive.Group key={group.label ?? index}>
                {group.label && (
                  <SelectPrimitive.Label className={styles.label}>
                    {group.label}
                  </SelectPrimitive.Label>
                )}
                {group.options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={styles.item}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {option.leading}
                      <SelectPrimitive.ItemText className="truncate">
                        {option.label}
                      </SelectPrimitive.ItemText>
                    </span>
                    <SelectPrimitive.ItemIndicator className="shrink-0">
                      <Icon name="check" size={18} className="text-primary" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
