import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/config/env";

import { toApiError } from "./errors";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Opt a single request out of automatic retries. */
    skipRetry?: boolean;
    /** Internal: number of retries already attempted. */
    retryCount?: number;
    /** Internal: already re-sent once after restarting the mocks. */
    mocksRestarted?: boolean;
  }
}

const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 300;
const IDEMPOTENT_METHODS = new Set(["get", "head", "options"]);

type AuthTokenGetter = () => string | null | Promise<string | null>;

// Stub until Auth0 lands: no token is attached.
let getAuthToken: AuthTokenGetter = () => null;

/** Plug in the real token source (Auth0) once auth is wired up. */
export function setAuthTokenGetter(getter: AuthTokenGetter) {
  getAuthToken = getter;
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { Accept: "application/json" },
  // The session is a cookie owned by the API, so it must travel with every request.
  withCredentials: true,
});

/**
 * Waits for the MSW worker when mocks are on and resolves the auth header.
 * Shared by `apiClient` and the fetch-based `postEventStream`.
 */
export async function prepareRequest(): Promise<Record<string, string>> {
  // Hold every request until the MSW worker is intercepting, so the first
  // query never races the worker. `env.useMocks` is inlined at build time, so
  // the mocks chunk is dropped from bundles built with mocks off.
  if (env.useMocks && typeof window !== "undefined") {
    const { startMocking } = await import("@/mocks/browser");
    await startMocking();
  }

  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * With mocks on, every API response comes from MSW as JSON. An HTML 404 means the request
 * slipped past the MSW worker and Next.js answered it (it has no `/api` routes).
 */
export function isMockBypass(status: number | undefined, contentType: unknown) {
  return (
    env.useMocks &&
    typeof window !== "undefined" &&
    status === 404 &&
    String(contentType ?? "").includes("text/html")
  );
}

/** Re-registers this page with the MSW worker after a bypass; see `restartMocking`. */
export async function restartMocks() {
  // Same guard as `prepareRequest`: it keeps `msw/browser` out of the server bundle.
  if (env.useMocks && typeof window !== "undefined") {
    const { restartMocking } = await import("@/mocks/browser");
    await restartMocking();
  }
}

apiClient.interceptors.request.use(async (config) => {
  for (const [name, value] of Object.entries(await prepareRequest())) {
    config.headers.set(name, value);
  }
  return config;
});

/** Retry only idempotent requests, and only for network failures or 5xx. Never 4xx. */
function shouldRetry(error: AxiosError, config: InternalAxiosRequestConfig) {
  if (config.skipRetry) return false;
  if (!IDEMPOTENT_METHODS.has((config.method ?? "get").toLowerCase())) return false;
  if ((config.retryCount ?? 0) >= MAX_RETRIES) return false;
  if (axios.isCancel(error) || config.signal?.aborted) return false;

  const status = error.response?.status;
  return status === undefined || status >= 500;
}

const backoff = (attempt: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, BASE_BACKOFF_MS * 2 ** attempt + Math.random() * 100),
  );

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    // Safe for any method: the bypassed request never reached a mock handler.
    if (
      config &&
      !config.mocksRestarted &&
      isMockBypass(error.response?.status, error.response?.headers["content-type"])
    ) {
      config.mocksRestarted = true;
      await restartMocks();
      return apiClient.request(config);
    }
    if (config && shouldRetry(error, config)) {
      const attempt = config.retryCount ?? 0;
      config.retryCount = attempt + 1;
      await backoff(attempt);
      return apiClient.request(config);
    }
    throw toApiError(error);
  },
);
