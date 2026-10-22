import {
  type ApiKey,
  type ApiKeyListParams,
  type CreatedApiKey,
  type GracePeriod,
} from "@/types/domain";

import { buildSeedApiKeys } from "../fixtures/api-keys";
import { projectsFixture } from "../fixtures";

/**
 * API keys in the mock API. The Default project starts with 1,000 generated keys (every account
 * sees them, so the table can be explored); other projects start empty. Keys created through the
 * API are kept per account and project in localStorage and listed first. Only the masked part is
 * stored; the full secret is returned once, when the key is created.
 */
const API_KEYS_KEY = "sn:mock-api-keys";

type KeysByScope = Record<string, ApiKey[]>;

const scopeOf = (accountId: string, projectId: string) => `${accountId}:${projectId}`;
const defaultProjectId = projectsFixture.find((project) => project.isDefault)?.id;

function readCreated(): KeysByScope {
  try {
    return JSON.parse(localStorage.getItem(API_KEYS_KEY) ?? "{}") as KeysByScope;
  } catch {
    return {};
  }
}

/** Renames and status changes, kept per key so they apply to seed keys too. */
const PATCHES_KEY = "sn:mock-api-key-patches";
type KeyPatch = {
  name?: string;
  status?: ApiKey["status"];
  renamedAt?: string;
  lastFour?: string;
  rotatedAt?: string;
  previousKeyExpiresAt?: string;
  deleted?: true;
};
type PatchesByScope = Record<string, Record<string, KeyPatch>>;

function readPatches(): PatchesByScope {
  try {
    return JSON.parse(localStorage.getItem(PATCHES_KEY) ?? "{}") as PatchesByScope;
  } catch {
    return {};
  }
}

/** Every key of the project: created ones first, then the seed keys (Default project only), with edits applied. */
function allKeys(accountId: string, projectId: string): ApiKey[] {
  const created = readCreated()[scopeOf(accountId, projectId)] ?? [];
  const seed = projectId === defaultProjectId ? buildSeedApiKeys(Date.now()) : [];
  const patches = readPatches()[scopeOf(accountId, projectId)] ?? {};
  return [...created, ...seed]
    .filter((key) => !patches[key.id]?.deleted)
    .map((key) => (patches[key.id] ? { ...key, ...patches[key.id] } : key));
}

/** The id as Figma shows it ("sdk_live...........a129"), which is what the search box matches. */
const maskedId = (key: ApiKey) => `sdk_live...........${key.lastFour}`;

export interface ApiKeyPage {
  data: ApiKey[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** One page of keys, filtered by status and by a search over name and ID. A page past the end is clamped. */
export function queryApiKeys(
  accountId: string,
  projectId: string,
  { page, pageSize, search, status }: ApiKeyListParams,
): ApiKeyPage {
  const needle = search.trim().toLowerCase();
  const matches = allKeys(accountId, projectId).filter(
    (key) =>
      (status === "all" || key.status === status) &&
      (!needle || key.name.toLowerCase().includes(needle) || maskedId(key).includes(needle)),
  );

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    data: matches.slice(start, start + pageSize),
    page: current,
    pageSize,
    total: matches.length,
    totalPages,
  };
}

/** Every key of the project in list order, for what adds up over all of them (project usage). */
export function listApiKeysFor(accountId: string, projectId: string) {
  return allKeys(accountId, projectId);
}

/** One key of the project, or `undefined` when it does not exist (or was deleted). */
export function findApiKeyFor(accountId: string, projectId: string, keyId: string) {
  return allKeys(accountId, projectId).find((key) => key.id === keyId);
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const randomLastFour = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(4)), (value) => (value % 36).toString(36)).join(
    "",
  );

/** Returns the new key with its secret, or `null` when the project already has a key with that name. */
export function createApiKeyFor(
  accountId: string,
  projectId: string,
  name: string,
): CreatedApiKey | null {
  if (allKeys(accountId, projectId).some((key) => sameName(key.name, name))) return null;

  const secret = `sk-${crypto.randomUUID().replaceAll("-", "")}`;
  const key: ApiKey = {
    id: `key_${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    lastFour: randomLastFour(),
    status: "active",
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    renamedAt: null,
  };
  const all = readCreated();
  all[scopeOf(accountId, projectId)] = [key, ...(all[scopeOf(accountId, projectId)] ?? [])];
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(all));
  return { ...key, secret };
}

export type UpdateResult = ApiKey | "not-found" | "duplicate";

/** Applies a rename and/or status change. A rename to a name another key already has is refused. */
export function updateApiKeyFor(
  accountId: string,
  projectId: string,
  keyId: string,
  input: { name?: string; status?: ApiKey["status"] },
): UpdateResult {
  const keys = allKeys(accountId, projectId);
  const key = keys.find((item) => item.id === keyId);
  if (!key) return "not-found";

  const patch: KeyPatch = {};
  if (input.name !== undefined && input.name.trim() !== key.name) {
    const name = input.name.trim();
    if (keys.some((item) => item.id !== keyId && sameName(item.name, name))) return "duplicate";
    patch.name = name;
    patch.renamedAt = new Date().toISOString();
  }
  if (input.status !== undefined) patch.status = input.status;

  const all = readPatches();
  const scope = scopeOf(accountId, projectId);
  all[scope] = { ...all[scope], [keyId]: { ...all[scope]?.[keyId], ...patch } };
  localStorage.setItem(PATCHES_KEY, JSON.stringify(all));
  return { ...key, ...patch };
}

const GRACE_MS: Record<GracePeriod, number> = {
  immediately: 0,
  "1h": 3_600_000,
  "24h": 86_400_000,
  "3d": 259_200_000,
  "7d": 604_800_000,
};

function savePatch(accountId: string, projectId: string, keyId: string, patch: KeyPatch) {
  const all = readPatches();
  const scope = scopeOf(accountId, projectId);
  all[scope] = { ...all[scope], [keyId]: { ...all[scope]?.[keyId], ...patch } };
  localStorage.setItem(PATCHES_KEY, JSON.stringify(all));
}

/** New secret for the key; the old one expires after the grace period. Returns the key with the secret, or `null` if unknown. */
export function rotateApiKeyFor(
  accountId: string,
  projectId: string,
  keyId: string,
  gracePeriod: GracePeriod,
): CreatedApiKey | null {
  const key = allKeys(accountId, projectId).find((item) => item.id === keyId);
  if (!key) return null;

  const now = Date.now();
  const patch: KeyPatch = {
    lastFour: randomLastFour(),
    rotatedAt: new Date(now).toISOString(),
    previousKeyExpiresAt: new Date(now + GRACE_MS[gracePeriod]).toISOString(),
  };
  savePatch(accountId, projectId, keyId, patch);
  return { ...key, ...patch, secret: `sk-${crypto.randomUUID().replaceAll("-", "")}` };
}

/** Removes the key. Returns false when it does not exist. */
export function deleteApiKeyFor(accountId: string, projectId: string, keyId: string) {
  if (!allKeys(accountId, projectId).some((key) => key.id === keyId)) return false;
  savePatch(accountId, projectId, keyId, { deleted: true });
  return true;
}
