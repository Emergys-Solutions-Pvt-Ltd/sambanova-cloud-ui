import { addDays, compareDays, startOfDay, toISODate } from "@/lib/date-range";
import { type ApiKey, type ApiKeyRequestLog, type ApiKeyUsageStats } from "@/types/domain";

import { USAGE_ERRORS, USAGE_MODELS, USAGE_PROMPTS } from "../fixtures/api-key-usage";
import { hashString, mulberry32 } from "../random";

/**
 * The request log of an API key. Nothing is stored: every request is derived from the key's ID and
 * the day it happened on, so the same key always shows the same history and any date range can be
 * answered. A key that has never been used has no requests; others get a few per day, fewer on
 * weekends, between the day the key was created and now.
 */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const DAY_SECONDS = 86_400;
/** Share of requests that end in an error. */
const ERROR_RATE = 0.06;

type Random = () => number;

const pick = <Item>(items: readonly Item[], random: Random) =>
  items[Math.floor(random() * items.length)]!;

function pickModel(random: Random) {
  const total = USAGE_MODELS.reduce((sum, model) => sum + model.weight, 0);
  let roll = random() * total;
  for (const model of USAGE_MODELS) {
    roll -= model.weight;
    if (roll < 0) return model;
  }
  return USAGE_MODELS[0]!;
}

/** "req_01J8H7K2QJ8XSZ9V3Y1T7E6R4": 25 characters of Crockford base 32, like the Figma example. */
const requestId = (random: Random) =>
  `req_${Array.from({ length: 25 }, () => CROCKFORD[Math.floor(random() * CROCKFORD.length)]).join("")}`;

const between = (random: Random, min: number, max: number) =>
  Math.floor(min + random() * (max - min + 1));

function buildRequest(keyId: string, day: Date, index: number): ApiKeyRequestLog {
  const random = mulberry32(hashString(`${keyId}:${toISODate(day)}:${index}`));
  const requestedAt = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    0,
    0,
    between(random, 0, DAY_SECONDS - 1),
  );
  const model = pickModel(random);
  const prompt = pick(USAGE_PROMPTS, random);
  const base = {
    id: requestId(random),
    requestedAt: requestedAt.toISOString(),
    model: model.name,
    request: prompt.request,
  };

  if (random() < ERROR_RATE) {
    const { responseTimeMs, ...error } = pick(USAGE_ERRORS, random);
    return {
      ...base,
      responseTimeMs,
      status: "error",
      inputTokens: null,
      outputTokens: null,
      cachedTokens: null,
      responsePreview: null,
      error,
    };
  }

  const inputTokens = between(random, 800, 5_000);
  return {
    ...base,
    responseTimeMs: between(random, 500, 5_500),
    status: "success",
    inputTokens,
    outputTokens: between(random, 1_000, 8_000),
    cachedTokens: Math.floor(inputTokens * random() * 0.6),
    responsePreview: prompt.response,
    error: null,
  };
}

/** Requests of one day, newest first. */
function requestsOn(keyId: string, day: Date): ApiKeyRequestLog[] {
  const random = mulberry32(hashString(`${keyId}:${toISODate(day)}`));
  const weekend = day.getDay() === 0 || day.getDay() === 6;
  const count = Math.floor(random() * (weekend ? 4 : 10.4));
  return Array.from({ length: count }, (_, index) => buildRequest(keyId, day, index)).sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt),
  );
}

/** The key's requests from `from` to `to` (both days included), newest first. */
export function listKeyRequests(key: ApiKey, from: Date, to: Date, now = Date.now()) {
  if (!key.lastUsedAt) return [];

  const createdAt = new Date(key.createdAt).getTime();
  const firstDay = startOfDay(new Date(Math.max(from.getTime(), createdAt)));
  const lastDay = startOfDay(new Date(Math.min(to.getTime(), now)));

  const requests: ApiKeyRequestLog[] = [];
  for (let day = lastDay; compareDays(day, firstDay) >= 0; day = addDays(day, -1)) {
    for (const request of requestsOn(key.id, day)) {
      const time = new Date(request.requestedAt).getTime();
      if (time >= createdAt && time <= now) requests.push(request);
    }
  }
  return requests;
}

const priceOf = (model: string) => USAGE_MODELS.find((item) => item.name === model);

export function summarizeRequests(requests: ApiKeyRequestLog[]): ApiKeyUsageStats {
  let inputTokens = 0;
  let outputTokens = 0;
  let spend = 0;
  for (const request of requests) {
    const input = request.inputTokens ?? 0;
    const output = request.outputTokens ?? 0;
    const price = priceOf(request.model);
    inputTokens += input;
    outputTokens += output;
    if (price) {
      spend += (input * price.inputPerMillion + output * price.outputPerMillion) / 1_000_000;
    }
  }
  return {
    totalRequests: requests.length,
    inputTokens,
    outputTokens,
    estimatedSpend: Math.round(spend * 100) / 100,
  };
}

export function pageOf<Item>(items: Item[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total: items.length,
    totalPages,
  };
}
