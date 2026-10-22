"use client";

import { type ComponentPropsWithRef, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon/icon";
import { PillRadioGroup } from "@/components/ui/pill-radio-group";
import { Tooltip } from "@/components/ui/tooltip";
import { type PermissionSet } from "@/types/domain";

import { LEVEL_LABELS, PERMISSION_AREAS, samePermissions } from "../lib/permissions";

type CloseAutoFocusHandler = ComponentPropsWithRef<typeof DialogContent>["onCloseAutoFocus"];

export interface EditPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whose permissions: a member ("this member") or a role ("this role"). */
  subject: "member" | "role";
  /** Shown under the title, e.g. "Emily Davis · Developer". */
  context?: string;
  /** Permissions when the dialog opens; kept by the caller while the dialog animates out. */
  permissions: PermissionSet | null;
  /** Read-only with this explanation in the banner (Owner role, or no right to edit). */
  readOnlyReason?: string;
  saving?: boolean;
  onSave: (permissions: PermissionSet) => void;
  onCloseAutoFocus?: CloseAutoFocusHandler;
}

const BANNER: Record<EditPermissionsDialogProps["subject"], string> = {
  member:
    "Update the permissions assigned to this member. Changes apply only to this project and do not affect other projects.",
  role: "Update the permissions of this role. Changes apply to its members in this project only and do not affect other projects.",
};

function PermissionsForm({
  initial,
  readOnly,
  banner,
  saving,
  onSave,
}: {
  initial: PermissionSet;
  readOnly: boolean;
  banner: string;
  saving: boolean;
  onSave: (permissions: PermissionSet) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(initial);
  const dirty = !samePermissions(draft, initial);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (dirty && !readOnly) onSave(draft);
      }}
      className="flex flex-col gap-7.5 pt-2"
    >
      <div className="flex gap-3 rounded-md border border-info-border bg-info-bg p-3">
        <span className="flex size-5 shrink-0 items-center justify-center text-info">
          <Icon name="alert-circle" size={18} />
        </span>
        <p className="text-body-sm font-semibold text-info">{banner}</p>
      </div>

      <fieldset className="flex flex-col gap-7.5">
        <legend className="mb-7.5 text-body text-primary">Permissions</legend>
        <div className="flex flex-col gap-4">
          {PERMISSION_AREAS.map((area) => {
            const labelId = `${id}-${area.id}`;
            return (
              <div key={area.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span id={labelId} className="text-body text-primary">
                    {area.label}
                  </span>
                  <Tooltip content={area.description} side="top" className="max-w-64">
                    <button
                      type="button"
                      aria-label={`About ${area.label}`}
                      className="flex size-4 items-center justify-center rounded-full text-primary"
                    >
                      <Icon name="exclamation-circle" size={14} />
                    </button>
                  </Tooltip>
                </div>
                <PillRadioGroup
                  aria-labelledby={labelId}
                  value={draft[area.id]}
                  disabled={readOnly || saving}
                  options={area.levels.map((level) => ({
                    value: level,
                    label: LEVEL_LABELS[level],
                  }))}
                  onValueChange={(level) =>
                    setDraft((current) => ({ ...current, [area.id]: level }))
                  }
                />
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="cancel" className="w-22.5" disabled={saving}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
        </DialogClose>
        {!readOnly && (
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save Changes
          </Button>
        )}
      </div>
    </form>
  );
}

/**
 * Edit Permissions (Figma: member `1387:66713`, role `1387:67755`): an info banner, then one pill
 * selector per permission area. Save stays disabled until something changes.
 */
export function EditPermissionsDialog({
  open,
  onOpenChange,
  subject,
  context,
  permissions,
  readOnlyReason,
  saving = false,
  onSave,
  onCloseAutoFocus,
}: EditPermissionsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!saving) onOpenChange(next);
      }}
    >
      <DialogContent
        size="md"
        title="Edit Permissions"
        description={context}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {permissions && (
          <PermissionsForm
            initial={permissions}
            readOnly={Boolean(readOnlyReason)}
            banner={readOnlyReason ?? BANNER[subject]}
            saving={saving}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
