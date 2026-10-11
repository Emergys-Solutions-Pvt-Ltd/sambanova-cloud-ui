import { type Project } from "@/types/domain";

import { projectsFixture } from "../fixtures";

/**
 * Projects created through the mock API, kept per account in localStorage so they survive
 * reloads. The fixture projects are visible to everyone; created ones only to their owner.
 */
const PROJECTS_KEY = "sn:mock-projects";

type ProjectsByAccount = Record<string, Project[]>;

function read(): ProjectsByAccount {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? "{}") as ProjectsByAccount;
  } catch {
    return {};
  }
}

export function listProjectsFor(accountId: string): Project[] {
  return [...projectsFixture, ...(read()[accountId] ?? [])];
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
