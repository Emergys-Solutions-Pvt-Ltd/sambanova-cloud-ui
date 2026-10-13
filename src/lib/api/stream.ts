import { env } from "@/config/env";

import { prepareRequest } from "./client";
import { ApiError, apiErrorFromBody, fetchFailureToApiError } from "./errors";

interface EventStreamOptions {
  /** JSON request body. */
  body: unknown;
  signal?: AbortSignal;
}

/** Sentinel `data:` payload that ends an OpenAI-compatible stream. */
const DONE = "[DONE]";

const cancelled = () =>
  new ApiError({ status: 0, code: "CANCELLED", message: "The request was cancelled." });

/**
 * Incremental server-sent-events parser. Text may be fed in arbitrary pieces (split mid-line,
 * `\r\n` split across pieces); it returns the `data` payload of every event completed so far.
 * Comment lines (`: …`) and fields other than `data` are ignored; several `data:` lines in one
 * event are joined with `\n`.
 */
function createEventParser() {
  let buffer = "";
  let dataLines: string[] = [];

  const dispatch = (events: string[]) => {
    if (dataLines.length > 0) {
      const data = dataLines.join("\n");
      // An event whose data is empty is not dispatched (SSE spec).
      if (data) events.push(data);
    }
    dataLines = [];
  };

  const processLine = (line: string, events: string[]) => {
    if (line === "") return dispatch(events);
    if (line.startsWith(":")) return; // comment / keep-alive
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    if (field !== "data") return; // event, id, retry: not used by chat completions
    const value = colon === -1 ? "" : line.slice(colon + 1);
    dataLines.push(value.startsWith(" ") ? value.slice(1) : value);
  };

  return {
    /** Feeds decoded text; returns the events it completed. */
    push(text: string) {
      buffer += text;
      const events: string[] = [];
      let start = 0;
      for (;;) {
        const lf = buffer.indexOf("\n", start);
        const cr = buffer.indexOf("\r", start);
        const end = cr !== -1 && (lf === -1 || cr < lf) ? cr : lf;
        if (end === -1) break;
        // A trailing "\r" may be the first half of "\r\n": wait for the next piece.
        if (end === cr && end === buffer.length - 1) break;
        processLine(buffer.slice(start, end), events);
        start = end + (end === cr && buffer[end + 1] === "\n" ? 2 : 1);
      }
      buffer = buffer.slice(start);
      return events;
    },
    /** End of body: flushes a last line and an event that had no closing blank line. */
    end() {
      const events: string[] = [];
      const rest = buffer.replace(/\r$/, "");
      buffer = "";
      if (rest) processLine(rest, events);
      dispatch(events);
      return events;
    },
  };
}

/** Reads an error body that may be JSON, text or empty; an abort while reading wins. */
async function readErrorBody(response: Response, signal?: AbortSignal): Promise<unknown> {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as unknown) : null;
  } catch (error) {
    if (signal?.aborted) throw fetchFailureToApiError(error, signal);
    return null;
  }
}

/**
 * POSTs JSON and yields the `data:` payload of each server-sent event until `data: [DONE]`
 * or the end of the body. Same base URL, cookie and auth header as `apiClient`; every failure
 * is an `ApiError` (abort → `CANCELLED`, status 0). Stopping early (break, abort) closes the
 * connection. No total timeout: cancel through `signal`.
 */
export async function* postEventStream(
  path: string,
  { body, signal }: EventStreamOptions,
): AsyncGenerator<string, void, undefined> {
  let response: Response;
  try {
    const headers = await prepareRequest();
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...headers,
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    throw fetchFailureToApiError(error, signal);
  }

  if (!response.ok) {
    const data = await readErrorBody(response, signal);
    throw apiErrorFromBody(response.status, data, response.statusText || "Something went wrong.");
  }
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = createEventParser();

  try {
    for (;;) {
      if (signal?.aborted) throw cancelled();

      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch (error) {
        throw fetchFailureToApiError(error, signal);
      }

      const events = chunk.done
        ? parser.push(decoder.decode()).concat(parser.end())
        : parser.push(decoder.decode(chunk.value, { stream: true }));

      for (const data of events) {
        if (data === DONE) return;
        // Events already buffered must not leak out after the caller aborted.
        if (signal?.aborted) throw cancelled();
        yield data;
      }

      if (chunk.done) return;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
