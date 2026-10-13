"use client";

import { useId } from "react";

import { Icon } from "@/components/ui/icon/icon";
import { type QuickRoleId } from "@/types/domain";

import { QUICK_ROLES } from "../lib/roles";

export interface QuickSelectCardsProps {
  /** Checked role, or null when the prompt matches no card. */
  value: QuickRoleId | null;
  /** Called when a card is chosen. Clicking the checked card does nothing (radios never deselect). */
  onValueChange: (id: QuickRoleId) => void;
}

/**
 * Single-choice role cards (Figma: Quick Select Card `626:17121`, System Prompt `1398:119544`).
 * Native radios, so arrow keys move the choice; hover and checked share the light border and
 * the check badge marks the checked card.
 */
export function QuickSelectCards({ value, onValueChange }: QuickSelectCardsProps) {
  const name = useId();
  return (
    <fieldset>
      <legend className="sr-only">Quick select a role</legend>
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_ROLES.map((role) => {
          const checked = value === role.id;
          return (
            <label
              key={role.id}
              className="relative flex cursor-pointer flex-col gap-3 rounded-lg border border-default bg-input p-4 transition-colors duration-(--sn-duration-fast) ease-standard hover:border-card-active has-checked:border-card-active has-focus-visible:border-focus motion-reduce:transition-none"
            >
              <input
                type="radio"
                name={name}
                value={role.id}
                checked={checked}
                onChange={() => onValueChange(role.id)}
                className="sr-only"
              />
              <span className="flex items-center gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-md ${role.tileClass}`}
                >
                  <Icon name={role.icon} size={20} className={role.iconClass} />
                </span>
                <span className="text-body-lg leading-tight font-semibold text-primary">
                  {role.title}
                </span>
              </span>
              <span className="text-body-sm leading-normal text-muted">{role.description}</span>
              {checked && (
                <span
                  aria-hidden="true"
                  className="absolute top-2.25 right-2.25 grid size-5 place-items-center rounded-full bg-button-primary text-button-primary-fg shadow-badge"
                >
                  <Icon name="check-bold" size={11} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
