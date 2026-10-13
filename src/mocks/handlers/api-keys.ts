import { http, HttpResponse } from "msw";

import { type PaginatedResponse } from "@/lib/api/types";
import { parseISODate } from "@/lib/date-range";
import {
  type ApiKey,
  type ApiKeyDetail,
  type ApiKeyRequestLog,
  type ApiKeyUsageSeries,
  type ApiKeyUsageStats,
  type CreateApiKeyInput,
  type RotateApiKeyInput,
  type UpdateApiKeyInput,
} from "@/types/domain";

import { findAccountBySession } from "../db/accounts";
import { dailyUsage, listKeyRequests, pageOf, summarizeRequests } from "../db/api-key-usage";
import {
  createApiKeyFor,
  deleteApiKeyFor,
  findApiKeyFor,
  queryApiKeys,
  rotateApiKeyFor,
  updateApiKeyFor,
} from "../db/api-keys";
import { readSessionToken } from "../db/session-cookie";
import { api, findOwnProject, notFound, validationError, withSession } from "./shared";

/** `?from=YYYY-MM-DD&to=YYYY-MM-DD` of the usage endpoints; `null` when missing, malformed or reversed. */
function readDayRange(request: Request) {
  const url = new URL(request.url);
  const from = parseISODate(url.searchParams.get("from"));
  const to = parseISODate(url.searchParams.get("to"));
  return from && to && from.getTime() <= to.getTime() ? { from, to } : null;
}

/**
 * API keys of a project: list, create, rename or enable/disable, rotate and delete, plus what the
 * View API Key Usage page reads (the key with its creator, usage totals, the daily series for the
 * charts and the request log).
 */
export const apiKeyHandlers = [
  http.get(
    api("/projects/:projectId/api-keys"),
    withSession<{ projectId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");

      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      const page = queryApiKeys(account!.id, project.id, {
        page: Number(url.searchParams.get("page")) || 1,
        pageSize: Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 10)),
        search: url.searchParams.get("search") ?? "",
        status: status === "active" || status === "disabled" ? status : "all",
      });
      return HttpResponse.json(page satisfies PaginatedResponse<ApiKey>);
    }),
  ),

  http.post(
    api("/projects/:projectId/api-keys"),
    withSession<{ projectId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");

      const input = (await request.json()) as Partial<CreateApiKeyInput>;
      const name = input.name?.trim() ?? "";
      if (name.length < 3 || name.length > 50) {
        return validationError("Key name must be 3 to 50 characters.", { field: "name" });
      }

      const created = createApiKeyFor(account!.id, project.id, name);
      if (!created) {
        return HttpResponse.json(
          {
            error: {
              code: "API_KEY_NAME_TAKEN",
              message: "An API key with this name already exists.",
              details: { field: "name" },
            },
          },
          { status: 409 },
        );
      }
      return HttpResponse.json(created, { status: 201 });
    }),
  ),

  http.patch(
    api("/projects/:projectId/api-keys/:keyId"),
    withSession<{ projectId: string; keyId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");

      const input = (await request.json()) as UpdateApiKeyInput;
      if (input.name !== undefined) {
        const name = input.name.trim();
        if (name.length < 3 || name.length > 50) {
          return validationError("Key name must be 3 to 50 characters.", { field: "name" });
        }
      }
      if (input.status !== undefined && input.status !== "active" && input.status !== "disabled") {
        return validationError("Status must be active or disabled.", { field: "status" });
      }

      const result = updateApiKeyFor(account!.id, project.id, params.keyId, input);
      if (result === "not-found") return notFound("API key");
      if (result === "duplicate") {
        return HttpResponse.json(
          {
            error: {
              code: "API_KEY_NAME_TAKEN",
              message: "An API key with this name already exists.",
              details: { field: "name" },
            },
          },
          { status: 409 },
        );
      }
      return HttpResponse.json(result);
    }),
  ),

  http.post(
    api("/projects/:projectId/api-keys/:keyId/rotate"),
    withSession<{ projectId: string; keyId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");

      const { gracePeriod } = (await request.json()) as Partial<RotateApiKeyInput>;
      if (!gracePeriod || !["immediately", "1h", "24h", "3d", "7d"].includes(gracePeriod)) {
        return validationError("Choose a grace period.", { field: "gracePeriod" });
      }
      const rotated = rotateApiKeyFor(account!.id, project.id, params.keyId, gracePeriod);
      return rotated ? HttpResponse.json(rotated) : notFound("API key");
    }),
  ),

  http.delete(
    api("/projects/:projectId/api-keys/:keyId"),
    withSession<{ projectId: string; keyId: string }>(async ({ params }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      return deleteApiKeyFor(account!.id, project.id, params.keyId)
        ? new HttpResponse(null, { status: 204 })
        : notFound("API key");
    }),
  ),

  http.get(
    api("/projects/:projectId/api-keys/:keyId"),
    withSession<{ projectId: string; keyId: string }>(async ({ params }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      const key = findApiKeyFor(account!.id, project.id, params.keyId);
      if (!key) return notFound("API key");
      // Keys carry no owner in the mock data; the signed-in member is shown as the creator.
      return HttpResponse.json({ ...key, createdBy: account!.name } satisfies ApiKeyDetail);
    }),
  ),

  http.get(
    api("/projects/:projectId/api-keys/:keyId/usage"),
    withSession<{ projectId: string; keyId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      const key = findApiKeyFor(account!.id, project.id, params.keyId);
      if (!key) return notFound("API key");
      const range = readDayRange(request);
      if (!range) return validationError("Choose a valid date range.", { field: "range" });

      const stats = summarizeRequests(listKeyRequests(key, range.from, range.to));
      return HttpResponse.json(stats satisfies ApiKeyUsageStats);
    }),
  ),

  http.get(
    api("/projects/:projectId/api-keys/:keyId/usage/series"),
    withSession<{ projectId: string; keyId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      const key = findApiKeyFor(account!.id, project.id, params.keyId);
      if (!key) return notFound("API key");
      const range = readDayRange(request);
      if (!range) return validationError("Choose a valid date range.", { field: "range" });

      const body: ApiKeyUsageSeries = { points: dailyUsage(key, range.from, range.to) };
      return HttpResponse.json(body);
    }),
  ),

  http.get(
    api("/projects/:projectId/api-keys/:keyId/requests"),
    withSession<{ projectId: string; keyId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      const key = findApiKeyFor(account!.id, project.id, params.keyId);
      if (!key) return notFound("API key");
      const range = readDayRange(request);
      if (!range) return validationError("Choose a valid date range.", { field: "range" });

      const url = new URL(request.url);
      const page = pageOf(
        listKeyRequests(key, range.from, range.to),
        Number(url.searchParams.get("page")) || 1,
        Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 10)),
      );
      return HttpResponse.json(page satisfies PaginatedResponse<ApiKeyRequestLog>);
    }),
  ),
];
