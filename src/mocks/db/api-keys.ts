import { type ApiKey, type CreatedApiKey } from "@/types/domain";

/**
 * API keys created through the mock API, kept in localStorage per account and project. Only the
 * masked part is stored; the full secret is returned once, when the key is created.
 */
const API_KEYS_KEY = "sn:mock-api-keys";

type KeysByScope = Record<string, ApiKey[]>;

const scopeOf = (accountId: string, projectId: string) => `${accountId}:${projectId}`;

function read(): KeysByScope {
  try {
    return JSON.parse(localStorage.getItem(API_KEYS_KEY) ?? "{}") as KeysByScope;
  } catch {
    return {};
  }
}

export function listApiKeysFor(accountId: string, projectId: string): ApiKey[] {
  return read()[scopeOf(accountId, projectId)] ?? [];
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
  const existing = listApiKeysFor(accountId, projectId);
  if (existing.some((key) => sameName(key.name, name))) return null;

  const secret = `sk-${crypto.randomUUID().replaceAll("-", "")}`;
  const key: ApiKey = {
    id: `key_${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    lastFour: randomLastFour(),
    status: "active",
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  const all = read();
  all[scopeOf(accountId, projectId)] = [key, ...existing];
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(all));
  return { ...key, secret };
}
