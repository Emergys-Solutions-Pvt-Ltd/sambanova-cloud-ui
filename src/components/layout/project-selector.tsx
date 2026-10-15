"use client";

import Link from "next/link";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon/icon";
import { dropdownLabelClasses, dropdownRowClasses } from "@/components/ui/dropdown-menu";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { routes } from "@/config/routes";
import { useActiveProject, useProjects, useSwitchProject } from "@/features/projects";
import { cn } from "@/lib/cn";
import { useCreateProjectDialogStore } from "@/stores/create-project-dialog-store";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";
import { type Project } from "@/types/domain";

interface ProjectListProps {
  projects: Project[];
  activeId: string | undefined;
  onSelect: (project: Project) => void;
}

/**
 * Project options using the listbox pattern: focus stays on the list, ArrowUp/Down move
 * `aria-activedescendant`, Home/End jump, Enter picks, Escape closes the popover (handled by Radix).
 * The list is the first tabbable element, so Radix focuses it when the popover opens, with the
 * active project highlighted.
 */
function ProjectList({ projects, activeId, onSelect }: ProjectListProps) {
  const listId = useId();
  const [cursor, setCursor] = useState(() =>
    Math.max(
      0,
      projects.findIndex((project) => project.id === activeId),
    ),
  );

  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    document.getElementById(optionId(cursor))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId only depends on listId
  }, [cursor, listId]);

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = projects.length - 1;
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
      case "Enter":
      case " ": {
        event.preventDefault();
        const project = projects[cursor];
        if (project) onSelect(project);
        break;
      }
    }
  };

  if (projects.length === 0) {
    return <p className="px-4 py-3 text-body-sm text-muted">No projects yet.</p>;
  }

  return (
    <ul
      id={listId}
      role="listbox"
      aria-label="Projects"
      tabIndex={0}
      aria-activedescendant={projects[cursor] ? optionId(cursor) : undefined}
      onKeyDown={onKeyDown}
      className="max-h-60 overflow-y-auto outline-none"
    >
      {projects.map((project, index) => {
        const selected = project.id === activeId;
        return (
          <li
            key={project.id}
            id={optionId(index)}
            role="option"
            aria-selected={selected}
            onMouseMove={() => setCursor(index)}
            onClick={() => onSelect(project)}
            className={cn(
              dropdownRowClasses,
              "justify-between",
              index === cursor && "bg-hover text-primary",
            )}
          >
            <span className="min-w-0 truncate">{project.name}</span>
            {selected && <Icon name="check" size="sm" className="shrink-0 text-primary" />}
          </li>
        );
      })}
    </ul>
  );
}

const GUEST_PROJECT_NAME = "Default project";

/** Signed-out state: the switcher is disabled and the default project is shown (there is nothing to switch to). */
function GuestProjectSelector({ collapsed }: { collapsed?: boolean }) {
  return collapsed ? (
    <button
      type="button"
      disabled
      aria-label={`Project: ${GUEST_PROJECT_NAME}. Log in to switch projects`}
      title="Log in to switch projects"
      className="flex size-11 items-center justify-center rounded-sm border border-control opacity-60"
    >
      <Avatar name={GUEST_PROJECT_NAME} size="xs" />
    </button>
  ) : (
    <button
      type="button"
      disabled
      aria-label={`Project: ${GUEST_PROJECT_NAME}. Log in to switch projects`}
      title="Log in to switch projects"
      className="flex h-8.5 w-full items-center justify-between gap-2 rounded-sm border border-control px-3 py-2 text-caption font-medium text-primary opacity-60"
    >
      <span className="truncate">{GUEST_PROJECT_NAME}</span>
      <Icon name="chevron-up-down" size="sm" className="shrink-0" />
    </button>
  );
}

/** Active-project switcher at the top of the sidebar (Figma: "Default project" selector). Signed-in users only. */
export function ProjectSelector({ collapsed }: { collapsed?: boolean }) {
  const authenticated = useSessionStore(selectIsAuthenticated);
  return authenticated ? (
    <ProjectSwitcher collapsed={collapsed} />
  ) : (
    <GuestProjectSelector collapsed={collapsed} />
  );
}

function ProjectSwitcher({ collapsed }: { collapsed?: boolean }) {
  const openCreateProjectDialog = useCreateProjectDialogStore((state) => state.openDialog);
  // The dialog focuses its own input; the menu must not pull focus back to its trigger on close.
  const handingOffToDialog = useRef(false);
  const openCreateProject = () => {
    handingOffToDialog.current = true;
    openCreateProjectDialog();
  };
  const [open, setOpen] = useState(false);
  const projects = useProjects();
  const { project } = useActiveProject();
  const switchProject = useSwitchProject();

  const label = project?.name ?? "Select project";
  const loading = projects.isPending;

  const trigger = collapsed ? (
    <button
      type="button"
      aria-label={`Project: ${label}. Switch project`}
      className="flex size-11 items-center justify-center rounded-sm border border-control hover:bg-hover"
    >
      {project ? (
        <Avatar name={project.name} size="xs" />
      ) : (
        <Skeleton className="size-6 rounded-full" />
      )}
    </button>
  ) : (
    <button
      type="button"
      aria-label={`Project: ${label}. Switch project`}
      className="flex h-8.5 w-full items-center justify-between gap-2 rounded-sm border border-control px-3 py-2 text-caption font-medium text-primary hover:bg-hover"
    >
      {loading ? <Skeleton className="h-3.5 w-24" /> : <span className="truncate">{label}</span>}
      <Icon name="chevron-up-down" size="sm" className="shrink-0" />
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {collapsed ? (
        <Tooltip content={label}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      )}

      <PopoverContent
        align="start"
        side={collapsed ? "right" : "bottom"}
        onCloseAutoFocus={(event) => {
          if (!handingOffToDialog.current) return;
          handingOffToDialog.current = false;
          event.preventDefault();
        }}
        className="w-(--radix-popover-trigger-width) min-w-64"
      >
        <p className={dropdownLabelClasses}>Projects</p>

        {loading && (
          <div aria-busy="true" aria-label="Loading projects" className="flex flex-col gap-2 p-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        )}

        {projects.error && (
          <div role="alert" className="flex flex-col items-start gap-2 px-4 py-3 text-body-sm">
            <span className="text-error">Couldn’t load projects.</span>
            <Button variant="secondary" size="sm" onClick={() => void projects.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {projects.data && (
          <ProjectList
            projects={projects.data}
            activeId={project?.id}
            onSelect={(next) => {
              switchProject(next.id);
              setOpen(false);
            }}
          />
        )}

        <div role="separator" className="my-1 h-px bg-menu-line" />

        <PopoverClose asChild>
          <Link href={routes.projects} className={dropdownRowClasses}>
            <Icon name="layers-subtract" size="sm" />
            Manage Projects
          </Link>
        </PopoverClose>
        <PopoverClose asChild>
          <button type="button" onClick={openCreateProject} className={dropdownRowClasses}>
            <Icon name="plus" size="sm" />
            Create project
          </button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
