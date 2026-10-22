import { http, HttpResponse } from "msw";

import { type PaginatedResponse } from "@/lib/api/types";
import { parseISODate } from "@/lib/date-range";
import { type ApiKeyUsageRow, type ApiKeyUsageSeries, type ApiKeyUsageStats } from "@/types/domain";

import { findAccountBySession } from "../db/accounts";
import { listKeyRequests, projectUsage, summarizeRequests } from "../db/api-key-usage";
import { listApiKeysFor, queryApiKeys } from "../db/api-keys";
import { readSessionToken } from "../db/session-cookie";
import { api, findOwnProject, notFound, validationError, withSession } from "./shared";

/** `?from=YYYY-MM-DD&to=YYYY-MM-DD`; `null` when missing, malformed or reversed. */
function readDayRange(request: Request) {
  const url = new URL(request.url);
  const from = parseISODate(url.searchParams.get("from"));
  const to = parseISODate(url.searchParams.get("to"));
  return from && to && from.getTime() <= to.getTime() ? { from, to } : null;
}

/**
 * What the Usage page reads: the totals and the daily series of every key of the project together,
 * and the keys with their own requests and spend. They come from the same requests as each key's
 * usage page, so a row there and the page it opens always agree.
 */
export const usageHandlers = [
  http.get(
    api("/projects/:projectId/usage"),
    withSession<{ projectId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      const range = readDayRange(request);
      if (!range) return validationError("Choose a valid date range.", { field: "range" });

      const { stats } = projectUsage(listApiKeysFor(account!.id, project.id), range.from, range.to);
      return HttpResponse.json(stats satisfies ApiKeyUsageStats);
    }),
  ),

  http.get(
    api("/projects/:projectId/usage/series"),
    withSession<{ projectId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      const range = readDayRange(request);
      if (!range) return validationError("Choose a valid date range.", { field: "range" });

      const { points } = projectUsage(
        listApiKeysFor(account!.id, project.id),
        range.from,
        range.to,
      );
      return HttpResponse.json({ points } satisfies ApiKeyUsageSeries);
    }),
  ),

  http.get(
    api("/projects/:projectId/usage/api-keys"),
    withSession<{ projectId: string }>(async ({ params, request }) => {
      const account = await findAccountBySession(readSessionToken());
      const project = await findOwnProject(params.projectId);
      if (!project) return notFound("Project");
      const range = readDayRange(request);
      if (!range) return validationError("Choose a valid date range.", { field: "range" });

      const url = new URL(request.url);
      const page = queryApiKeys(account!.id, project.id, {
        page: Number(url.searchParams.get("page")) || 1,
        pageSize: Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 10)),
        search: "",
        status: "all",
      });
      const data: ApiKeyUsageRow[] = page.data.map((key) => {
        const stats = summarizeRequests(listKeyRequests(key, range.from, range.to));
        return {
          id: key.id,
          name: key.name,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt,
          totalRequests: stats.totalRequests,
          estimatedSpend: stats.estimatedSpend,
        };
      });
      return HttpResponse.json({ ...page, data } satisfies PaginatedResponse<ApiKeyUsageRow>);
    }),
  ),
];
