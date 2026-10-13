import { apiErrorFromBody, postEventStream } from "@/lib/api";
import { type ChatCompletionChunk, type ChatCompletionRequest } from "@/types/domain";

/** Provisional: confirm path and base URL with the backend team (console proxy assumed). */
export const CHAT_COMPLETIONS_PATH = "/v1/chat/completions";

const STREAM_FAILED = "The response stopped unexpectedly.";

/** Streams an OpenAI-compatible chat completion, one parsed chunk at a time. Every failure is an `ApiError`. */
export async function* streamChatCompletion(
  request: ChatCompletionRequest,
  signal?: AbortSignal,
): AsyncGenerator<ChatCompletionChunk, void, undefined> {
  const body = { ...request, stream: true, stream_options: { include_usage: true } };
  for await (const data of postEventStream(CHAT_COMPLETIONS_PATH, { body, signal })) {
    let parsed: ChatCompletionChunk & { error?: unknown };
    try {
      parsed = JSON.parse(data) as ChatCompletionChunk & { error?: unknown };
    } catch {
      throw apiErrorFromBody(500, null, STREAM_FAILED);
    }
    // OpenAI-style failure after the 200 headers were sent.
    if (parsed.error) throw apiErrorFromBody(500, parsed, STREAM_FAILED);
    yield parsed;
  }
}
