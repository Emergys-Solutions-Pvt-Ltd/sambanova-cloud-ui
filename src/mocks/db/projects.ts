import { type Project } from "@/types/domain";

import { projectsFixture } from "../fixtures";
import { PROJECT_DESCRIPTIONS } from "../fixtures/project-settings";

/**
 * Projects created through the mock API, kept per account in localStorage so they survive
 * reloads. The fixture projects are visible to everyone; created ones only to their owner.
 *
 * Settings edits (rename, description, delete) are kept apart in `sn:mock-project-edits`,
 * per account, so they apply to fixture and created projects alike.
 */
const PROJECTS_KEY = "sn:mock-projects";
const EDITS_KEY = "sn:mock-project-edits";

type ProjectsByAccount = Record<string, Project[]>;

interface ProjectEdit {
  name?: string;
  description?: string;
  updatedAt?: string;
  deleted?: boolean;
}

type EditsByAccount = Record<string, Record<string, ProjectEdit>>;

function readJson<T>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as T;
  } catch {
    return {} as T;
  }
}

const read = () => readJson<ProjectsByAccount>(PROJECTS_KEY);
const readEdits = () => readJson<EditsByAccount>(EDITS_KEY);

export function listProjectsFor(accountId: string): Project[] {
  const edits = readEdits()[accountId] ?? {};
  return [...projectsFixture, ...(read()[accountId] ?? [])]
    .filter((project) => !edits[project.id]?.deleted)
    .map((project) => {
      const name = edits[project.id]?.name;
      return name ? { ...project, name } : project;
    });
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Returns the new project, or `null` when the account already has a project with that name. */
export function createProjectFor(accountId: string, name: string): Project | null {
  const existing = listProjectsFor(accountId);
  if (existing.some((project) => sameName(project.name, name))) return null;

  const project: Project = {
    id: `prj_${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    isDefault: false,
    createdAt: new Date().toISOString(),
  };
  const all = read();
  localStorage.setItem(
    PROJECTS_KEY,
    JSON.stringify({ ...all, [accountId]: [...(all[accountId] ?? []), project] }),
  );
  return project;
}

/** True for the shared fixture projects, which the mock seeds with the Figma team. */
export const isFixtureProject = (projectId: string) =>
  projectsFixture.some((project) => project.id === projectId);

export interface ProjectRecord {
  project: Project;
  description: string;
  updatedAt: string;
}

/** The project with its settings fields, or `null` when the account can't see it. */
export function getProjectRecordFor(accountId: string, projectId: string): ProjectRecord | null {
  const project = listProjectsFor(accountId).find((item) => item.id === projectId);
  if (!project) return null;
  const edit = readEdits()[accountId]?.[projectId] ?? {};
  return {
    project,
    description: edit.description ?? PROJECT_DESCRIPTIONS[projectId] ?? "",
    updatedAt: edit.updatedAt ?? project.createdAt,
  };
}

function writeEdit(accountId: string, projectId: string, patch: ProjectEdit) {
  const all = readEdits();
  const byProject = (all[accountId] ??= {});
  byProject[projectId] = { ...byProject[projectId], ...patch };
  localStorage.setItem(EDITS_KEY, JSON.stringify(all));
}

export type UpdateProjectResult =
  { status: "ok"; record: ProjectRecord } | { status: "not-found" } | { status: "name-taken" };

/** Renames and/or re-describes a project; `updatedAt` moves only when something changed. */
export function updateProjectFor(
  accountId: string,
  projectId: string,
  patch: { name?: string; description?: string },
): UpdateProjectResult {
  const current = getProjectRecordFor(accountId, projectId);
  if (!current) return { status: "not-found" };

  const name = patch.name?.trim();
  if (
    name !== undefined &&
    listProjectsFor(accountId).some(
      (project) => project.id !== projectId && sameName(project.name, name),
    )
  ) {
    return { status: "name-taken" };
  }

  const description = patch.description?.trim();
  const changed =
    (name !== undefined && name !== current.project.name) ||
    (description !== undefined && description !== current.description);
  if (changed) {
    writeEdit(accountId, projectId, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      updatedAt: new Date().toISOString(),
    });
  }
  return { status: "ok", record: getProjectRecordFor(accountId, projectId)! };
}

/** Deletes a project for this account. The default project can't be deleted. */
export function deleteProjectFor(
  accountId: string,
  projectId: string,
): "deleted" | "not-found" | "default" {
  const project = listProjectsFor(accountId).find((item) => item.id === projectId);
  if (!project) return "not-found";
  if (project.isDefault) return "default";
  writeEdit(accountId, projectId, { deleted: true, updatedAt: new Date().toISOString() });
  return "deleted";
}
