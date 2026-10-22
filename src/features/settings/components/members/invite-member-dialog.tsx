"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FormField, TextField } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useActiveProject, useProjects } from "@/features/projects";
import { isApiError } from "@/lib/api";
import { useInviteMemberDialogStore } from "@/stores/invite-member-dialog-store";
import { toast } from "@/stores/toast-store";

import { useCreateInvitation } from "../../hooks/use-invitations";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "../../lib/permissions";

const inviteSchema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  projectId: z.string().min(1, "Select a project."),
  role: z.enum(ASSIGNABLE_ROLES, { error: "Select a role." }),
});

type InviteValues = z.input<typeof inviteSchema>;
type InviteOutput = z.output<typeof inviteSchema>;

const ROLE_OPTIONS = [
  { options: ASSIGNABLE_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] })) },
];

function InviteMemberForm({ onDone }: { onDone: () => void }) {
  const id = useId();
  const projects = useProjects();
  const activeProjectId = useActiveProject().project?.id ?? "";
  const invite = useCreateInvitation();

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<InviteValues, unknown, InviteOutput>({
    resolver: zodResolver(inviteSchema),
    mode: "onTouched",
    defaultValues: { email: "", projectId: activeProjectId, role: undefined },
  });

  const onSubmit = handleSubmit(({ email, projectId, role }) => {
    clearErrors("root");
    invite.mutate(
      { projectId, input: { email, role } },
      {
        onSuccess: (invitation) => {
          onDone();
          toast.success(`Invitation sent to ${invitation.email}`, 2500);
        },
        onError: (error) => {
          const field = isApiError(error)
            ? (error.details as { field?: string } | undefined)?.field
            : undefined;
          const message = isApiError(error)
            ? error.message
            : "Could not send the invitation. Try again.";
          if (field === "email" || field === "role") setError(field, { message });
          else setError("root", { message });
        },
      },
    );
  });

  const projectGroups = [
    {
      options: (projects.data ?? []).map((project) => ({
        value: project.id,
        label: project.name,
      })),
    },
  ];

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7.5 pt-2">
      <div className="flex flex-col gap-4">
        <TextField
          label="Email Address"
          labelClassName="font-normal"
          type="email"
          fieldSize="lg"
          bordered
          autoFocus
          autoComplete="off"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Project"
            htmlFor={`${id}-project`}
            labelClassName="font-normal"
            error={errors.projectId?.message}
            errorId={`${id}-project-error`}
          >
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <Select
                  id={`${id}-project`}
                  variant="form"
                  aria-label="Project"
                  placeholder="Select"
                  groups={projectGroups}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={Boolean(errors.projectId)}
                />
              )}
            />
          </FormField>

          <FormField
            label="Role"
            htmlFor={`${id}-role`}
            labelClassName="font-normal"
            error={errors.role?.message}
            errorId={`${id}-role-error`}
          >
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  id={`${id}-role`}
                  variant="form"
                  aria-label="Role"
                  placeholder="Select"
                  groups={ROLE_OPTIONS}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={Boolean(errors.role)}
                />
              )}
            />
          </FormField>
        </div>
      </div>

      {errors.root?.message && (
        <p
          role="alert"
          className="-mt-3.5 rounded-md border border-error-border bg-error-bg px-3 py-2 text-body-sm text-error"
        >
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="cancel" className="w-22.5" disabled={invite.isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" loading={invite.isPending} disabled={!isValid}>
          Invite Member
        </Button>
      </div>
    </form>
  );
}

/**
 * "Invite Member" (Figma `1387:67216`): email, project (defaults to the active one) and role.
 * Mounted once by the settings header; any settings view opens it through the store.
 */
export function InviteMemberDialog() {
  const open = useInviteMemberDialogStore((state) => state.open);
  const close = useInviteMemberDialogStore((state) => state.close);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        size="md"
        variant="subtle"
        title="Invite Member"
        description="Invite members to collaborate on this project. Assign a role to control what they can access."
      >
        <InviteMemberForm onDone={close} />
      </DialogContent>
    </Dialog>
  );
}
