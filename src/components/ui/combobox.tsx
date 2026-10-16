"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/cn";

import { menuItemClasses } from "./dropdown-menu";
import { Icon } from "./icon/icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Leading visual in the list and in the trigger, e.g. a model logo. */
  leading?: ReactNode;
  /** Larger leading visual for the trigger; falls back to `leading`. */
  triggerLeading?: ReactNode;
}

export interface ComboboxGroup {
  label?: string;
  options: ComboboxOption[];
}

export interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  groups: ComboboxGroup[];
  /** Accessible name for the trigger and the search box. */
  "aria-label": string;
  searchPlaceholder?: string;
  className?: string;
}

interface FlatOption extends ComboboxOption {
  group?: string;
}

/**
 * Searchable single-select (Figma: Compare Models picker). Focus stays in the
 * search field: ArrowUp/Down move the highlight, Enter picks, Escape closes.
 */
export function Combobox({
  value,
  onValueChange,
  groups,
  searchPlaceholder = "Search...",
  className,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = groups
    .flatMap((group) => group.options)
    .find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${ariaLabel}: ${selected?.label ?? "none"}`}
          className={cn(
            "flex h-10.5 w-full items-center justify-between gap-2.5 rounded-md border border-field bg-surface px-4",
            "text-body-lg text-primary transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            {selected?.triggerLeading ?? selected?.leading}
            <span className="truncate">{selected?.label ?? "Select"}</span>
          </span>
          <Icon name="chevron-down" size="sm" className="shrink-0 text-primary" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        surface="dropdown"
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-64"
      >
        <OptionList
          groups={groups}
          value={value}
          searchPlaceholder={searchPlaceholder}
          label={ariaLabel}
          onPick={(next) => {
            onValueChange(next);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function OptionList({
  groups,
  value,
  searchPlaceholder,
  label,
  onPick,
}: {
  groups: ComboboxGroup[];
  value: string;
  searchPlaceholder: string;
  label: string;
  onPick: (value: string) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        options: needle
          ? group.options.filter((option) => option.label.toLowerCase().includes(needle))
          : group.options,
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, query]);

  const flat: FlatOption[] = useMemo(
    () =>
      visibleGroups.flatMap((group) => group.options.map((o) => ({ ...o, group: group.label }))),
    [visibleGroups],
  );

  const [cursor, setCursor] = useState(() =>
    Math.max(
      0,
      flat.findIndex((option) => option.value === value),
    ),
  );

  const optionId = (index: number) => `${listId}-option-${index}`;

  // Keep the highlighted option in view while navigating, but open at the top of the list.
  const navigated = useRef(false);
  useEffect(() => {
    if (!navigated.current) return;
    document.getElementById(`${listId}-option-${cursor}`)?.scrollIntoView({ block: "nearest" });
  }, [cursor, listId]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    navigated.current = true;
    const last = flat.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setCursor((current) => Math.min(last, current + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setCursor((current) => Math.max(0, current - 1));
        break;
      case "Home":
        event.preventDefault();
        setCursor(0);
        break;
      case "End":
        event.preventDefault();
        setCursor(Math.max(0, last));
        break;
      case "Enter": {
        event.preventDefault();
        const option = flat[cursor];
        if (option) onPick(option.value);
        break;
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b border-panel px-4 py-2.5">
        <Icon name="search" size="md" className="shrink-0 text-muted" />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-label={`Search ${label}`}
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={flat[cursor] ? optionId(cursor) : undefined}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-body text-primary outline-none placeholder:text-muted"
        />
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label={label}
        className="max-h-44 scrollbar-thin overflow-y-auto py-1"
      >
        {visibleGroups.map((group) => (
          <div key={group.label ?? "options"} role="group" aria-label={group.label}>
            {group.label && (
              <p
                aria-hidden="true"
                className="px-4 pt-2 pb-1 text-caption tracking-caps text-menu-label uppercase"
              >
                {group.label}
              </p>
            )}
            {group.options.map((option) => {
              const current = flat.findIndex((item) => item.value === option.value);
              return (
                <div
                  key={option.value}
                  id={optionId(current)}
                  role="option"
                  aria-selected={option.value === value}
                  onMouseMove={() => setCursor(current)}
                  onClick={() => onPick(option.value)}
                  className={cn(
                    menuItemClasses,
                    "justify-between rounded-sm pl-4 font-medium",
                    current === cursor && "bg-hover text-primary",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {option.leading}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {option.value === value && <Icon name="check" size="sm" className="shrink-0" />}
                </div>
              );
            })}
          </div>
        ))}
        {flat.length === 0 && (
          <p className="px-4 py-3 text-body-sm text-muted">No results for “{query.trim()}”.</p>
        )}
      </div>
    </>
  );
}
