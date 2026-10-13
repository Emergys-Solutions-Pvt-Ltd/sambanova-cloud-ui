import { delay, HttpResponse, type HttpResponseResolver } from "msw";

import { env } from "@/config/env";

import { getMockConfig } from "../config";
import { findAccountBySession } from "../db/accounts";
import { listProjectsFor } from "../db/projects";
import { readSessionToken } from "../db/session-cookie";

/** Absolute mock URL for an API path, e.g. `api("/me")` → `/api/me`. */
export const api = (path: string) => `${env.apiBaseUrl}${path}`;

/** The error envelope every mock endpoint sends: `{ error: { code, message } }`. */
export const errorBody = (code: string, message: string) => ({ error: { code, message } });

/** Applies the configured latency and error scenario before running the real resolver. */
export function withScenario<Params extends Record<string, string>>(
  resolver: HttpResponseResolver<Params>,
): HttpResponseResolver<Params> {
  return async (info) => {
    const { latencyMs, scenario } = getMockConfig();
    await delay(latencyMs);

    if (scenario === "error") {
      return HttpResponse.json(
        errorBody("INTERNAL_ERROR", "Simulated server error (mock scenario: error)."),
        { status: 500 },
      );
    }
    return resolver(info);
  };
}

/** Rejects with 401 unless the request carries a valid session cookie, like the real API will. */
export function withSession<Params extends Record<string, string>>(
  resolver: HttpResponseResolver<Params>,
): HttpResponseResolver<Params> {
  return withScenario<Params>(async (info) => {
    const account = await findAccountBySession(readSessionToken());
    if (!account) return unauthorized();
    return resolver(info);
  });
}

/** 401 UNAUTHORIZED response. */
export const unauthorized = (message = "Not signed in.") =>
  HttpResponse.json(errorBody("UNAUTHORIZED", message), { status: 401 });

/** 422 VALIDATION_ERROR response; `details.field` names the offending input. */
export const validationError = (message: string, details: Record<string, string>) =>
  HttpResponse.json({ error: { code: "VALIDATION_ERROR", message, details } }, { status: 422 });

/** 404 NOT_FOUND response, e.g. `notFound("Project")` → "Project not found.". */
export const notFound = (what: string) =>
  HttpResponse.json(errorBody("NOT_FOUND", `${what} not found.`), { status: 404 });

/** A project visible to the signed-in account (shared fixtures plus the ones it created). */
export async function findOwnProject(projectId: string) {
  const account = await findAccountBySession(readSessionToken());
  return account ? listProjectsFor(account.id).find((item) => item.id === projectId) : undefined;
}
