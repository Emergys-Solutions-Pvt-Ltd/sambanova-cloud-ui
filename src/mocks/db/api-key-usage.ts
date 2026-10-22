import { addDays, compareDays, startOfDay, toISODate } from "@/lib/date-range";
import {
  type ApiKey,
  type ApiKeyRequestLog,
  type ApiKeyUsageSeriesPoint,
  type ApiKeyUsageStats,
} from "@/types/domain";

import {
  USAGE_ERRORS,
  USAGE_MODELS,
  USAGE_PROMPTS,
  type UsageModel,
} from "../fixtures/api-key-usage";
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

const REQUEST_ID_LENGTH = 25;

/** Everything one request decides by chance. The tokens are 0 when it failed. */
interface RequestDraw {
  requestedAt: Date;
  model: UsageModel;
  prompt: (typeof USAGE_PROMPTS)[number];
  id: string;
  /** Set when the request ended in an error. */
  failure: (typeof USAGE_ERRORS)[number] | null;
  responseTimeMs: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

/**
 * The single source of a request's numbers, so the log and the totals can never disagree. Only the
 * log needs the ID text; `withId: false` skips its draws (same ones, so the rest stays identical).
 */
function drawRequest(
  keyId: string,
  day: Date,
  dayISO: string,
  index: number,
  withId: boolean,
): RequestDraw {
  const random = mulberry32(hashString(`${keyId}:${dayISO}:${index}`));
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
  let id = "";
  if (withId) id = requestId(random);
  else for (let step = 0; step < REQUEST_ID_LENGTH; step += 1) random();
  const base = { requestedAt, model, prompt, id };

  if (random() < ERROR_RATE) {
    const failure = pick(USAGE_ERRORS, random);
    return {
      ...base,
      failure,
      responseTimeMs: failure.responseTimeMs,
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
    };
  }

  const inputTokens = between(random, 800, 5_000);
  const responseTimeMs = between(random, 500, 5_500);
  const outputTokens = between(random, 1_000, 8_000);
  const cachedTokens = Math.floor(inputTokens * random() * 0.6);
  return { ...base, failure: null, responseTimeMs, inputTokens, outputTokens, cachedTokens };
}

function buildRequest(keyId: string, day: Date, index: number): ApiKeyRequestLog {
  const draw = drawRequest(keyId, day, toISODate(day), index, true);
  const base = {
    id: draw.id,
    requestedAt: draw.requestedAt.toISOString(),
    model: draw.model.name,
    request: draw.prompt.request,
  };

  if (draw.failure) {
    const { responseTimeMs, ...error } = draw.failure;
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

  return {
    ...base,
    responseTimeMs: draw.responseTimeMs,
    status: "success",
    inputTokens: draw.inputTokens,
    outputTokens: draw.outputTokens,
    cachedTokens: draw.cachedTokens,
    responsePreview: draw.prompt.response,
    error: null,
  };
}

/** How many requests the key makes on `day`. */
function requestCountOn(keyId: string, day: Date, dayISO: string) {
  const random = mulberry32(hashString(`${keyId}:${dayISO}`));
  const weekend = day.getDay() === 0 || day.getDay() === 6;
  // A slow wave (a few days per hill, shifted per key) with some noise on top, so the usage charts
  // show rises and falls rather than random spikes. Weekends are quieter.
  const dayNumber = Math.floor(
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86_400_000,
  );
  const wave = 0.5 + 0.5 * Math.sin(dayNumber / 3.2 + (hashString(keyId) % 628) / 100);
  const mean = weekend ? 1.5 + wave * 2.5 : 4 + wave * 5;
  return Math.max(0, Math.round(mean + (random() - 0.5) * 3));
}

/** Requests of one day, newest first. */
function requestsOn(keyId: string, day: Date): ApiKeyRequestLog[] {
  const count = requestCountOn(keyId, day, toISODate(day));
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

/** Longest range the series endpoint answers (two years); an earlier start is moved up to fit. */
export const MAX_SERIES_DAYS = 731;

/** First day of a series: the start of the range, moved up when the range is longer than two years. */
function seriesStart(from: Date, to: Date) {
  const limit = addDays(to, -(MAX_SERIES_DAYS - 1));
  return compareDays(limit, from) > 0 ? limit : startOfDay(from);
}

/** One point per day from `from` to `to`, built from the same requests as the log and the totals. */
export function dailyUsage(
  key: ApiKey,
  from: Date,
  to: Date,
  now = Date.now(),
): ApiKeyUsageSeriesPoint[] {
  const first = seriesStart(from, to);

  const perDay = new Map<string, { input: number; output: number; cached: number }>();
  for (const request of listKeyRequests(key, first, to, now)) {
    const date = toISODate(new Date(request.requestedAt));
    const totals = perDay.get(date) ?? { input: 0, output: 0, cached: 0 };
    totals.input += request.inputTokens ?? 0;
    totals.output += request.outputTokens ?? 0;
    totals.cached += request.cachedTokens ?? 0;
    perDay.set(date, totals);
  }

  const points: ApiKeyUsageSeriesPoint[] = [];
  for (let day = first; compareDays(day, to) <= 0; day = addDays(day, 1)) {
    const date = toISODate(day);
    const totals = perDay.get(date);
    points.push({
      date,
      inputTokens: totals?.input ?? 0,
      outputTokens: totals?.output ?? 0,
      cachedTokens: totals?.cached ?? 0,
    });
  }
  return points;
}

/** What one key, or all of them together, did on one day. */
interface DayTotals {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  /** In USD, not yet rounded. */
  spend: number;
}

const emptyTotals = (): DayTotals => ({
  requests: 0,
  inputTokens: 0,
  outputTokens: 0,
  cachedTokens: 0,
  spend: 0,
});

/** Adds the key's requests of `day` to `into`, counting the same requests as the log without building their text. */
function addKeyDay(
  into: DayTotals,
  keyId: string,
  day: Date,
  dayISO: string,
  createdAt: number,
  now: number,
) {
  const count = requestCountOn(keyId, day, dayISO);
  for (let index = 0; index < count; index += 1) {
    const draw = drawRequest(keyId, day, dayISO, index, false);
    const time = draw.requestedAt.getTime();
    if (time < createdAt || time > now) continue;

    into.requests += 1;
    into.inputTokens += draw.inputTokens;
    into.outputTokens += draw.outputTokens;
    into.cachedTokens += draw.cachedTokens;
    into.spend +=
      (draw.inputTokens * draw.model.inputPerMillion +
        draw.outputTokens * draw.model.outputPerMillion) /
      1_000_000;
  }
}

/** Usage of every key of a project together: the four totals and the daily series. */
export interface ProjectUsage {
  stats: ApiKeyUsageStats;
  points: ApiKeyUsageSeriesPoint[];
}

let lastProjectUsage: { signature: string; usage: ProjectUsage } | null = null;

/**
 * All keys together over the day range, from the same requests as each key's own usage page (a key's
 * row and its page always show the same numbers). A project can hold a thousand keys, so requests
 * are only counted here, not built, and the last answer is kept: the totals and the series of one
 * page load come from a single pass.
 */
export function projectUsage(keys: ApiKey[], from: Date, to: Date, now = Date.now()): ProjectUsage {
  const signature = [
    Math.floor(now / 60_000),
    toISODate(from),
    toISODate(to),
    keys.map((key) => key.id).join(","),
  ].join("|");
  if (lastProjectUsage?.signature === signature) return lastProjectUsage.usage;

  const perDay = new Map<string, DayTotals>();
  const lastDay = startOfDay(new Date(Math.min(to.getTime(), now)));
  for (const key of keys) {
    if (!key.lastUsedAt) continue;

    const createdAt = new Date(key.createdAt).getTime();
    const firstDay = startOfDay(new Date(Math.max(from.getTime(), createdAt)));
    for (let day = firstDay; day.getTime() <= lastDay.getTime(); day = addDays(day, 1)) {
      const dayISO = toISODate(day);
      let totals = perDay.get(dayISO);
      if (!totals) {
        totals = emptyTotals();
        perDay.set(dayISO, totals);
      }
      addKeyDay(totals, key.id, day, dayISO, createdAt, now);
    }
  }

  const sum = emptyTotals();
  for (const totals of perDay.values()) {
    sum.requests += totals.requests;
    sum.inputTokens += totals.inputTokens;
    sum.outputTokens += totals.outputTokens;
    sum.spend += totals.spend;
  }

  const points: ApiKeyUsageSeriesPoint[] = [];
  for (let day = seriesStart(from, to); compareDays(day, to) <= 0; day = addDays(day, 1)) {
    const date = toISODate(day);
    const totals = perDay.get(date);
    points.push({
      date,
      inputTokens: totals?.inputTokens ?? 0,
      outputTokens: totals?.outputTokens ?? 0,
      cachedTokens: totals?.cachedTokens ?? 0,
    });
  }

  const usage: ProjectUsage = {
    stats: {
      totalRequests: sum.requests,
      inputTokens: sum.inputTokens,
      outputTokens: sum.outputTokens,
      estimatedSpend: Math.round(sum.spend * 100) / 100,
    },
    points,
  };
  lastProjectUsage = { signature, usage };
  return usage;
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
