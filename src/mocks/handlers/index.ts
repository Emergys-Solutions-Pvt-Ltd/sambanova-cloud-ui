import { delay, http, HttpResponse, type HttpResponseResolver } from "msw";

import { env } from "@/config/env";
import { type PaginatedResponse } from "@/lib/api/types";
import {
  type AuthResponse,
  type CreateExampleItemInput,
  type ExampleItem,
  type LoginInput,
  type SignupInput,
} from "@/types/domain";

import { getMockConfig } from "../config";
import {
  createSession,
  endSession,
  findAccountBySession,
  registerAccount,
  toUser,
  verifyCredentials,
} from "../db/accounts";
import { clearSessionCookie, readSessionToken, writeSessionCookie } from "../db/session-cookie";
import { exampleItemsByProject, projectsFixture } from "../fixtures";
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

/** Rejects with 401 unless the request carries a valid session cookie, like the real API will. */
function withSession<Params extends Record<string, string>>(
  resolver: HttpResponseResolver<Params>,
): HttpResponseResolver<Params> {
  return withScenario<Params>(async (info) => {
    const account = await findAccountBySession(readSessionToken());
    if (!account) return unauthorized();
    return resolver(info);
  });
}

const unauthorized = (message = "Not signed in.") =>
  HttpResponse.json(errorBody("UNAUTHORIZED", message), { status: 401 });

const validationError = (message: string, details: Record<string, string>) =>
  HttpResponse.json({ error: { code: "VALIDATION_ERROR", message, details } }, { status: 422 });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const notFound = (what: string) =>
  HttpResponse.json(errorBody("NOT_FOUND", `${what} not found.`), { status: 404 });

export const handlers = [
  http.get(
    api("/me"),
    withScenario(async () => {
      const account = await findAccountBySession(readSessionToken());
      if (!account) {
        // A cookie that no longer maps to a session is dropped, as a real API would.
        clearSessionCookie();
        return unauthorized();
      }
      return HttpResponse.json(toUser(account));
    }),
  ),

  http.post(
    api("/auth/signup"),
    withScenario(async ({ request }) => {
      const input = (await request.json()) as Partial<SignupInput>;
      const fullName = input.fullName?.trim() ?? "";
      const email = input.email?.trim() ?? "";
      const password = input.password ?? "";

      if (fullName.length < 2)
        return validationError("Enter your full name.", { field: "fullName" });
      if (!EMAIL_PATTERN.test(email))
        return validationError("Enter a valid email address.", { field: "email" });
      if (password.length < 8) {
        return validationError("Use at least 8 characters.", { field: "password" });
      }

      const account = await registerAccount({ fullName, email, password });
      if (!account) {
        return HttpResponse.json(
          errorBody("EMAIL_TAKEN", "An account with this email already exists. Log in instead."),
          { status: 409 },
        );
      }

      writeSessionCookie(createSession(account.id));
      const body: AuthResponse = { user: toUser(account) };
      return HttpResponse.json(body, { status: 201 });
    }),
  ),

  http.post(
    api("/auth/login"),
    withScenario(async ({ request }) => {
      const input = (await request.json()) as Partial<LoginInput>;
      const account = await verifyCredentials(input.email ?? "", input.password ?? "");
      // Same message for an unknown email and a wrong password, so accounts can't be probed.
      if (!account) return unauthorized("Incorrect email or password.");

      writeSessionCookie(createSession(account.id));
      const body: AuthResponse = { user: toUser(account) };
      return HttpResponse.json(body);
    }),
  ),

  http.post(
    api("/auth/logout"),
    withScenario(() => {
      const token = readSessionToken();
      if (token) endSession(token);
      clearSessionCookie();
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    api("/projects"),
    withSession(() => HttpResponse.json(projectsFixture)),
  ),

  http.get(
    api("/projects/:projectId"),
    withSession<{ projectId: string }>(({ params }) => {
      const project = projectsFixture.find((item) => item.id === params.projectId);
      return project ? HttpResponse.json(project) : notFound("Project");
    }),
  ),

  http.get(
    api("/projects/:projectId/usage-overview"),
    withSession<{ projectId: string }>(({ params }) => {
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
    withSession<{ projectId: string }>(({ params, request }) => {
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
    withSession<{ projectId: string }>(async ({ params, request }) => {
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
