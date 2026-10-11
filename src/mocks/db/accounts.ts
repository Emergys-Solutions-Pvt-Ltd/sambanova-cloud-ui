import { type User } from "@/types/domain";

import { SIGNUP_CREDIT_BALANCE, seedAccounts } from "../fixtures/auth";

/**
 * Mock account + session store, kept in localStorage so accounts created through
 * Sign Up and signed-in sessions survive reloads. Stands in for the API's database;
 * passwords are stored as SHA-256 hashes (a real backend uses a slow salted hash).
 */
interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  creditBalance: number;
  createdAt: string;
}

const ACCOUNTS_KEY = "sn:mock-accounts";
const SESSIONS_KEY = "sn:mock-sessions";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function hashPassword(password: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

async function loadAccounts(): Promise<StoredAccount[]> {
  const stored = read<StoredAccount[] | null>(ACCOUNTS_KEY, null);
  if (stored) return stored;

  const seeded = await Promise.all(
    seedAccounts.map(async (seed, index): Promise<StoredAccount> => ({
      id: `usr_seed_${index + 1}`,
      name: seed.fullName,
      email: normalizeEmail(seed.email),
      passwordHash: await hashPassword(seed.password),
      creditBalance: seed.creditBalance,
      createdAt: new Date().toISOString(),
    })),
  );
  write(ACCOUNTS_KEY, seeded);
  return seeded;
}

export const toUser = (account: StoredAccount): User => ({
  id: account.id,
  name: account.name,
  email: account.email,
  avatarUrl: null,
  creditBalance: account.creditBalance,
});

export async function registerAccount(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const accounts = await loadAccounts();
  const email = normalizeEmail(input.email);
  if (accounts.some((account) => account.email === email)) return null;

  const account: StoredAccount = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    name: input.fullName.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    creditBalance: SIGNUP_CREDIT_BALANCE,
    createdAt: new Date().toISOString(),
  };
  write(ACCOUNTS_KEY, [...accounts, account]);
  return account;
}

/** Adds credit to the account's balance and returns the new balance. */
export async function addCreditsTo(accountId: string, amount: number) {
  const accounts = await loadAccounts();
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return null;

  account.creditBalance += amount;
  write(ACCOUNTS_KEY, accounts);
  return account.creditBalance;
}

export async function verifyCredentials(email: string, password: string) {
  const accounts = await loadAccounts();
  const account = accounts.find((item) => item.email === normalizeEmail(email));
  if (!account) return null;
  return account.passwordHash === (await hashPassword(password)) ? account : null;
}

/** Opens a session for the account and returns its opaque token. */
export function createSession(accountId: string) {
  const token = crypto.randomUUID();
  write(SESSIONS_KEY, { ...read<Record<string, string>>(SESSIONS_KEY, {}), [token]: accountId });
  return token;
}

export function endSession(token: string) {
  const { [token]: _removed, ...rest } = read<Record<string, string>>(SESSIONS_KEY, {});
  write(SESSIONS_KEY, rest);
}

export async function findAccountBySession(token: string | null) {
  if (!token) return null;
  const accountId = read<Record<string, string>>(SESSIONS_KEY, {})[token];
  if (!accountId) return null;
  return (await loadAccounts()).find((account) => account.id === accountId) ?? null;
}
