import { delay, http, HttpResponse, type HttpResponseResolver } from "msw";

import { env } from "@/config/env";
import { type PaginatedResponse } from "@/lib/api/types";
import { checkExpiry, digitsOnly, isValidCardNumber, isValidSecurityCode } from "@/lib/card";
import { parseISODate } from "@/lib/date-range";
import {
  type ApiKey,
  type ApiKeyDetail,
  type ApiKeyRequestLog,
  type ApiKeyUsageStats,
  type AuthResponse,
  type CreateExampleItemInput,
  type CreateApiKeyInput,
  type CreateProjectInput,
  type PurchaseCreditsInput,
  type RotateApiKeyInput,
  type UpdateApiKeyInput,
  type PurchaseCreditsResponse,
  type ExampleItem,
  type LoginInput,
  type SignupInput,
} from "@/types/domain";

import { getMockConfig } from "../config";
import {
  addCreditsTo,
  createSession,
  endSession,
  findAccountBySession,
  registerAccount,
  toUser,
  verifyCredentials,
} from "../db/accounts";
import { listKeyRequests, pageOf, summarizeRequests } from "../db/api-key-usage";
import {
  createApiKeyFor,
  deleteApiKeyFor,
  findApiKeyFor,
  queryApiKeys,
  rotateApiKeyFor,
  updateApiKeyFor,
} from "../db/api-keys";
import { getBillingAddress, recordPurchase } from "../db/billing";
import { createProjectFor, listProjectsFor } from "../db/projects";
import { clearSessionCookie, readSessionToken, writeSessionCookie } from "../db/session-cookie";
import { exampleItemsByProject } from "../fixtures";
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

const MIN_PURCHASE = 5;
const MAX_PURCHASE = 1000;
const DECLINED_TEST_CARD = "4000000000000002";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A project visible to the signed-in account (shared fixtures plus the ones it created). */
async function findOwnProject(projectId: string) {
  const account = await findAccountBySession(readSessionToken());
  return account ? listProjectsFor(account.id).find((item) => item.id === projectId) : undefined;
}

/** Example items for a project; projects created at runtime start empty. */
function itemsForProject(projectId: string) {
  return exampleItemsByProject.get(projectId) ?? [];
}

const notFound = (what: string) =>
  HttpResponse.json(errorBody("NOT_FOUND", `${what} not found.`), { status: 404 });

/** `?from=YYYY-MM-DD&to=YYYY-MM-DD` of the usage endpoints; `null` when missing, malformed or reversed. */
function readDayRange(request: Request) {
  const url = new URL(request.url);
  const from = parseISODate(url.searchParams.get("from"));
  const to = parseISODate(url.searchParams.get("to"));
  return from && to && from.getTime() <= to.getTime() ? { from, to } : null;
}

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
    api("/billing/address"),
    withSession(async () => {
      const account = await findAccountBySession(readSessionToken());
      return HttpResponse.json(getBillingAddress(account!.id));
    }),
  ),

  http.post(
    api("/billing/credits"),
    withSession(async ({ request }) => {
      const account = await findAccountBySession(readSessionToken());
      const input = (await request.json()) as Partial<PurchaseCreditsInput>;
      const { amount, billingAddress, card } = input;

      if (!Number.isInteger(amount) || amount! < MIN_PURCHASE || amount! > MAX_PURCHASE) {
        return validationError("Enter an amount between $5 and $1,000.", { field: "amount" });
      }
      if (!billingAddress?.fullName?.trim()) {
        return validationError("Enter your full name.", { field: "fullName" });
      }
      if (!billingAddress.country) {
        return validationError("Select your country or region.", { field: "country" });
      }
      if (!billingAddress.address?.trim()) {
        return validationError("Enter your address.", { field: "address" });
      }
      if (!card || !isValidCardNumber(card.number ?? "")) {
        return validationError("Your Card number is invalid", { field: "cardNumber" });
      }
      const expiry = checkExpiry(card.expiry ?? "");
      if (expiry !== "valid") {
        return validationError(
          expiry === "expired"
            ? "Your card's expiry date is in the past"
            : "Your card's expiry date is invalid",
          { field: "expiry" },
        );
      }
      if (!isValidSecurityCode(card.cvc ?? "")) {
        return validationError("Your card's security code is incomplete", { field: "cvc" });
      }

      // Test card that the payment provider always declines.
      if (digitsOnly(card.number) === DECLINED_TEST_CARD) {
        return HttpResponse.json(
          {
            error: {
              code: "PAYMENT_DECLINED",
              message: "Your card was declined",
              details: { field: "cardNumber" },
            },
          },
          { status: 402 },
        );
      }

      const purchase = recordPurchase(account!.id, amount!, billingAddress);
      const balance = (await addCreditsTo(account!.id, amount!)) ?? 0;
      const body: PurchaseCreditsResponse = { balance, purchase };
      return HttpResponse.json(body, { status: 201 });
    }),
  ),

  http.get(
    api("/projects"),
    withSession(async () => {
      const account = await findAccountBySession(readSessionToken());
      return HttpResponse.json(listProjectsFor(account!.id));
    }),
  ),

  http.post(
    api("/projects"),
    withSession(async ({ request }) => {
      const account = await findAccountBySession(readSessionToken());
      const input = (await request.json()) as Partial<CreateProjectInput>;
      const name = input.name?.trim() ?? "";

      if (name.length < 3 || name.length > 50) {
        return validationError("Project name must be 3 to 50 characters.", { field: "name" });
      }

      const project = createProjectFor(account!.id, name);
      if (!project) {
        return HttpResponse.json(
          {
            error: {
              code: "PROJECT_NAME_TAKEN",
              message: "A project with this name already exists.",
              details: { field: "name" },
            },
          },
          { status: 409 },
        );
      }
      return HttpResponse.json(project, { status: 201 });
    }),
  ),

  http.get(
    api("/projects/:projectId"),
    withSession<{ projectId: string }>(async ({ params }) => {
      const project = await findOwnProject(params.projectId);
      return project ? HttpResponse.json(project) : notFound("Project");
    }),
  ),

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

  http.get(
    api("/projects/:projectId/usage-overview"),
    withSession<{ projectId: string }>(async ({ params }) => {
      const project = await findOwnProject(params.projectId);
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
    withSession<{ projectId: string }>(async ({ params, request }) => {
      if (!(await findOwnProject(params.projectId))) return notFound("Project");
      const items = itemsForProject(params.projectId);

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
      if (!(await findOwnProject(params.projectId))) return notFound("Project");
      const items = exampleItemsByProject.get(params.projectId) ?? [];
      exampleItemsByProject.set(params.projectId, items);

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
