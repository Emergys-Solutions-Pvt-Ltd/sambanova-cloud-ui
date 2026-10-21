"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { menuItemClasses } from "./dropdown-menu";
import { Icon } from "./icon/icon";
import { fieldDropdownSurface, menuSurfaceAboveModal } from "./popover";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional leading visual, e.g. a model logo. */
  leading?: ReactNode;
}

export interface SelectGroup {
  /** Group heading ("Reasoning", "Text"…). Omit for a flat list. */
  label?: string;
  options: SelectOption[];
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  groups: SelectGroup[];
  /** Accessible name; required because the trigger shows only the current value. */
  "aria-label": string;
  /** Icon shown before the value. */
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  /**
   * compact = 38px Quickstart select; field = form inputs in modals (37px, r8, input stroke);
   * toolbar = table filter (37px, r8, table-control stroke); form = 45px modal field (Figma:
   * Invite Member); inline = 37px select inside a table row (Figma: Members › Edit Role).
   */
  variant?: SelectVariant;
  id?: string;
  onBlur?: () => void;
  invalid?: boolean;
  /**
   * Color of the placeholder text: "muted" (default), "subtle" (gray-500, Figma: Add Credits) or
   * "primary" (Figma: Grace Period shows white "Select").
   */
  placeholderTone?: "muted" | "subtle" | "primary";
  /** Controlled open state; omit for Radix's own. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type SelectVariant = "compact" | "field" | "toolbar" | "form" | "inline";

/** Per-variant box, stroke and chevron; kept apart so no variant overrides another through `className`. */
const triggerVariants: Record<
  SelectVariant,
  { box: string; border: string; chevron: string; chevronSize: number }
> = {
  compact: {
    box: "h-9.5 rounded-sm bg-input px-2.5",
    border: "border-input",
    chevron: "text-muted",
    chevronSize: 16,
  },
  field: {
    box: "h-9.25 rounded-md bg-input pr-2.5 pl-4",
    border: "border-input",
    chevron: "text-muted",
    chevronSize: 16,
  },
  toolbar: {
    box: "h-9.25 rounded-md bg-table-head px-4",
    border: "border-table-control",
    chevron: "text-muted",
    chevronSize: 16,
  },
  form: {
    box: "h-11.25 rounded-md bg-input px-4",
    border: "border-field",
    chevron: "text-primary",
    chevronSize: 18,
  },
  inline: {
    box: "h-9.25 rounded-md bg-field-strong pr-2.5 pl-4 font-medium",
    border: "border-strong",
    chevron: "text-primary",
    chevronSize: 18,
  },
};

/** 38px field select (Figma: Quickstart model and endpoint selectors). Radix supplies the behaviour. */
export function Select({
  value,
  onValueChange,
  groups,
  icon,
  placeholder,
  className,
  contentClassName,
  disabled,
  variant = "compact",
  id,
  onBlur,
  invalid,
  placeholderTone = "muted",
  open,
  defaultOpen,
  onOpenChange,
  "aria-label": ariaLabel,
}: SelectProps) {
  const styles = triggerVariants[variant];
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        onBlur={onBlur}
        className={cn(
          "inline-flex w-full items-center justify-between gap-3 border text-body text-primary outline-none",
          styles.box,
          invalid ? "border-error-border" : styles.border,
          "transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover",
          "disabled:cursor-not-allowed disabled:text-disabled",
          placeholderTone === "muted" && "data-[placeholder]:text-muted",
          placeholderTone === "subtle" && "data-[placeholder]:text-subtle",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate">
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
        </span>
        <SelectPrimitive.Icon asChild>
          <Icon
            name="chevron-down"
            size={styles.chevronSize}
            className={cn("shrink-0", styles.chevron)}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            variant === "field" ? fieldDropdownSurface : menuSurfaceAboveModal,
            "min-w-(--radix-select-trigger-width) overflow-hidden",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="max-h-72 overflow-y-auto">
            {groups.map((group, index) => (
              <SelectPrimitive.Group key={group.label ?? index}>
                {group.label && (
                  <SelectPrimitive.Label className="px-4 pt-2 pb-1 text-caption tracking-caps text-menu-label uppercase">
                    {group.label}
                  </SelectPrimitive.Label>
                )}
                {group.options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      menuItemClasses,
                      "justify-between data-[state=checked]:text-primary",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {option.leading}
                      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    </span>
                    <SelectPrimitive.ItemIndicator>
                      <Icon name="check" size="sm" />
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
