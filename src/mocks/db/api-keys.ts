import { type ApiKey, type ApiKeyListParams, type CreatedApiKey } from "@/types/domain";

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

/** Every key of the project: created ones first, then the seed keys (Default project only). */
function allKeys(accountId: string, projectId: string): ApiKey[] {
  const created = readCreated()[scopeOf(accountId, projectId)] ?? [];
  const seed = projectId === defaultProjectId ? buildSeedApiKeys(Date.now()) : [];
  return [...created, ...seed];
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
  };
  const all = readCreated();
  all[scopeOf(accountId, projectId)] = [key, ...(all[scopeOf(accountId, projectId)] ?? [])];
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(all));
  return { ...key, secret };
}
