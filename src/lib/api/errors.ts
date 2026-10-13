import { isAxiosError, isCancel } from "axios";

import { type ApiErrorShape } from "./types";

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor({ status, code, message, details }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const STATUS_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
  504: "GATEWAY_TIMEOUT",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickString = (source: Record<string, unknown>, key: string) =>
  typeof source[key] === "string" ? (source[key] as string) : undefined;

/**
 * Builds an `ApiError` from an HTTP status and a response body shaped
 * `{ code, message, details }` or `{ error: { ... } }`. Used for Axios and fetch responses alike.
 */
export function apiErrorFromBody(
  status: number,
  data: unknown,
  fallbackMessage = "Something went wrong.",
): ApiError {
  const body = isRecord(data) && isRecord(data.error) ? data.error : data;
  const record = isRecord(body) ? body : {};

  return new ApiError({
    status,
    code: pickString(record, "code") ?? STATUS_CODES[status] ?? `HTTP_${status}`,
    message: pickString(record, "message") ?? fallbackMessage,
    details: record.details,
  });
}

const isAbortError = (error: unknown) => isRecord(error) && error.name === "AbortError";

/**
 * Converts a `fetch()` (or stream read) rejection into an `ApiError` with the same codes as
 * Axios failures: an abort is `CANCELLED`, anything else `NETWORK_ERROR`.
 */
export function fetchFailureToApiError(error: unknown, signal?: AbortSignal): ApiError {
  if (isApiError(error)) return error;

  if (signal?.aborted || isAbortError(error)) {
    return new ApiError({ status: 0, code: "CANCELLED", message: "The request was cancelled." });
  }

  return new ApiError({
    status: 0,
    code: "NETWORK_ERROR",
    message: "Unable to reach the server. Check your connection and try again.",
  });
}

/**
 * Converts anything thrown by Axios (or our own code) into an `ApiError`.
 * Accepts error bodies shaped `{ code, message, details }` or `{ error: { ... } }`.
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isCancel(error)) {
    return new ApiError({ status: 0, code: "CANCELLED", message: "The request was cancelled." });
  }

  if (isAxiosError(error)) {
    if (!error.response) {
      const timedOut = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
      return new ApiError({
        status: 0,
        code: timedOut ? "TIMEOUT" : "NETWORK_ERROR",
        message: timedOut
          ? "The request timed out. Please try again."
          : "Unable to reach the server. Check your connection and try again.",
      });
    }

    const { status, data } = error.response;
    return apiErrorFromBody(status, data, error.message ?? "Something went wrong.");
  }

  return new ApiError({
    status: 0,
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "Something went wrong.",
  });
}
