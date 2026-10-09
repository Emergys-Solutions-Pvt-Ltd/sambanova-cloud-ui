import { delay, http, HttpResponse, type HttpResponseResolver } from "msw";

import { env } from "@/config/env";
import { type PaginatedResponse } from "@/lib/api/types";
import { type CreateExampleItemInput, type ExampleItem } from "@/types/domain";

import { getMockConfig } from "../config";
import { exampleItemsByProject, projectsFixture, userFixture } from "../fixtures";
import {
  modelCatalogFixture,
  partnersFixture,
  recommendedModelsFixture,
  usageOverviewFixture,
  webinarsFixture,
} from "../fixtures/dashboard";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const errorBody = (code: string, message: string) => ({ error: { code, message } });

/** Applies the configured latency and error scenario before running the real resolver. */
function withScenario<Params extends Record<string, string>>(
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

const notFound = (what: string) =>
  HttpResponse.json(errorBody("NOT_FOUND", `${what} not found.`), { status: 404 });

export const handlers = [
  http.get(
    api("/me"),
    withScenario(() => {
      if (getMockConfig().scenario === "guest") {
        return HttpResponse.json(errorBody("UNAUTHORIZED", "Not signed in."), { status: 401 });
      }
      return HttpResponse.json(userFixture);
    }),
  ),

  http.get(
    api("/projects"),
    withScenario(() => HttpResponse.json(projectsFixture)),
  ),

  http.get(
    api("/projects/:projectId"),
    withScenario<{ projectId: string }>(({ params }) => {
      const project = projectsFixture.find((item) => item.id === params.projectId);
      return project ? HttpResponse.json(project) : notFound("Project");
    }),
  ),

  http.get(
    api("/projects/:projectId/usage-overview"),
    withScenario<{ projectId: string }>(({ params }) => {
      const project = projectsFixture.find((item) => item.id === params.projectId);
      return project ? HttpResponse.json(usageOverviewFixture) : notFound("Project");
    }),
  ),

  http.get(
    api("/models"),
    withScenario(() => HttpResponse.json(modelCatalogFixture)),
  ),

  http.get(
    api("/models/recommended"),
    withScenario(() => HttpResponse.json(recommendedModelsFixture)),
  ),

  http.get(
    api("/marketing/webinars"),
    withScenario(() => HttpResponse.json(webinarsFixture)),
  ),

  http.get(
    api("/marketing/partners"),
    withScenario(() => HttpResponse.json(partnersFixture)),
  ),

  http.get(
    api("/projects/:projectId/examples"),
    withScenario<{ projectId: string }>(({ params, request }) => {
      const items = exampleItemsByProject.get(params.projectId);
      if (!items) return notFound("Project");

      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 10));
      const start = (page - 1) * pageSize;

      const body: PaginatedResponse<ExampleItem> = {
        data: items.slice(start, start + pageSize),
        page,
        pageSize,
        total: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
      };
      return HttpResponse.json(body);
    }),
  ),

  http.post(
    api("/projects/:projectId/examples"),
    withScenario<{ projectId: string }>(async ({ params, request }) => {
      const items = exampleItemsByProject.get(params.projectId);
      if (!items) return notFound("Project");

      const input = (await request.json()) as Partial<CreateExampleItemInput>;
      const name = input.name?.trim();
      if (!name) {
        return HttpResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Name is required.",
              details: { field: "name" },
            },
          },
          { status: 422 },
        );
      }

      const item: ExampleItem = {
        id: `${params.projectId}_item_${crypto.randomUUID().slice(0, 8)}`,
        projectId: params.projectId,
        name,
        createdAt: new Date().toISOString(),
      };
      items.unshift(item);
      return HttpResponse.json(item, { status: 201 });
    }),
  ),
];
