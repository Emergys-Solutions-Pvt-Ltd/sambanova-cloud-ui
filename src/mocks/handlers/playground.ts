import { delay, http, HttpResponse } from "msw";

import {
  type ChatCompletionChunk,
  type ChatCompletionRequest,
  type ChatCompletionUsage,
  type ChatFinishReason,
  type PlaygroundMode,
  type RenameConversationInput,
  type SaveConversationInput,
} from "@/types/domain";

import { getMockConfig } from "../config";
import { chargeCredits, findAccountBySession } from "../db/accounts";
import { runAutoRechargeFor } from "../db/billing";
import {
  deleteConversationFor,
  getConversationFor,
  listConversationsFor,
  renameConversationFor,
  saveConversationFor,
} from "../db/playground";
import { readSessionToken } from "../db/session-cookie";
import { modelCatalogFixture } from "../fixtures/dashboard";
import { cannedReply } from "../fixtures/playground";

import { api, errorBody, findOwnProject, notFound, validationError, withSession } from "./shared";

/** Pause multiplier per catalog speed rating (5 = fastest). */
const SPEED_FACTOR: Record<number, number> = { 5: 0.6, 4: 0.8, 3: 1, 2: 1.3, 1: 1.6 };

/** Pieces per `max_tokens` (a streamed word is about 1.3 tokens). */
const TOKENS_PER_PIECE = 1.3;

/** Share of the pieces sent before the `stream-error` scenario breaks off. */
const STREAM_ERROR_AT = 0.4;
const STREAM_ERROR_MESSAGE = "The model stopped responding. Try again.";

const MAX_SAVED_TITLE = 200;
const MAX_RENAMED_TITLE = 80;
const PLAYGROUND_MODES: PlaygroundMode[] = ["single", "compare"];

const encoder = new TextEncoder();
const sseFrame = (payload: unknown) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
const DONE_FRAME = encoder.encode("data: [DONE]\n\n");

const estimateTokens = (chars: number) => Math.ceil(chars / 4);
const round2 = (value: number) => Math.round(value * 100) / 100;

/** USD rounded up to cents: at least $0.01 once the model produced a token, else nothing. */
function replyCost(
  pricing: { input: number; output: number },
  promptTokens: number,
  completionTokens: number,
) {
  if (completionTokens === 0) return 0;
  const raw = (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
  return Math.max(0.01, Math.ceil(raw * 100) / 100);
}

/** The signed-in account's id when it can see the project, else `null` (→ 404 Project). */
async function accountWithProject(projectId: string) {
  const account = await findAccountBySession(readSessionToken());
  if (!account || !(await findOwnProject(projectId))) return null;
  return account.id;
}

const chatNotFound = () =>
  HttpResponse.json(errorBody("NOT_FOUND", "Chat not found."), { status: 404 });

type ConversationParams = { projectId: string; id: string };

/** Mock Playground API: streaming chat completions and per-project chat history. */
export const playgroundHandlers = [
  http.post(
    api("/v1/chat/completions"),
    withSession(async ({ request, finalize }) => {
      const t0 = performance.now();
      const { scenario, latencyMs, tokenDelayMs } = getMockConfig();
      const account = (await findAccountBySession(readSessionToken()))!;
      const input = (await request.json()) as Partial<ChatCompletionRequest>;
      const messages = Array.isArray(input.messages) ? input.messages : [];
      const lastMessage = messages.at(-1);

      if (!lastMessage || lastMessage.role !== "user") {
        return validationError("Add a message.", { field: "messages" });
      }
      const model = modelCatalogFixture.find((item) => item.apiId === input.model);
      if (!model) {
        return HttpResponse.json(errorBody("MODEL_NOT_FOUND", "This model isn’t available."), {
          status: 404,
        });
      }
      if (scenario === "insufficient-credits" || account.creditBalance <= 0) {
        return HttpResponse.json(
          errorBody(
            "INSUFFICIENT_CREDITS",
            "You don’t have enough credits to complete this request.",
          ),
          { status: 402 },
        );
      }

      const systemPrompt = messages.find((message) => message.role === "system")?.content ?? "";
      const reply = cannedReply({ prompt: lastMessage.content, model, systemPrompt });
      // Newlines stay inside the pieces, so joining them reproduces the markdown exactly.
      const allPieces = reply.match(/\S+\s*|\n+/g) ?? [];
      const pieceLimit =
        input.max_tokens && input.max_tokens > 0
          ? Math.ceil(input.max_tokens / TOKENS_PER_PIECE)
          : Infinity;
      const pieces = allPieces.slice(0, pieceLimit);
      const finishReason: ChatFinishReason = allPieces.length > pieceLimit ? "length" : "stop";
      const errorAfter =
        scenario === "stream-error" ? Math.floor(pieces.length * STREAM_ERROR_AT) : Infinity;
      const pieceDelayMs = tokenDelayMs * (SPEED_FACTOR[model.features.speed] ?? 1);

      const promptChars = messages.reduce((sum, message) => sum + message.content.length, 0);
      const promptTokens = estimateTokens(promptChars);

      const id = `chatcmpl-${crypto.randomUUID().slice(0, 8)}`;
      const created = Math.floor(Date.now() / 1000);
      const chunk = (
        delta: ChatCompletionChunk["choices"][number]["delta"],
        reason: ChatFinishReason | null,
      ): ChatCompletionChunk => ({
        id,
        object: "chat.completion.chunk",
        created,
        model: model.apiId,
        choices: [{ index: 0, delta, finish_reason: reason }],
      });

      let streamedChars = 0;
      let cancelled = false;
      const stopped = () => cancelled || request.signal.aborted;

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          // Checked before every enqueue: enqueueing after a cancel throws.
          const send = (bytes: Uint8Array) => {
            if (stopped()) return false;
            controller.enqueue(bytes);
            return true;
          };

          try {
            if (!send(sseFrame(chunk({ role: "assistant" }, null)))) return;

            let tFirst: number | undefined;
            for (const [index, piece] of pieces.entries()) {
              await delay(pieceDelayMs);
              if (index === errorAfter) {
                if (!send(sseFrame(errorBody("STREAM_INTERRUPTED", STREAM_ERROR_MESSAGE)))) {
                  return;
                }
                controller.close();
                return;
              }
              if (!send(sseFrame(chunk({ content: piece }, null)))) return;
              tFirst ??= performance.now();
              streamedChars += piece.length;
            }

            if (!send(sseFrame(chunk({}, finishReason)))) return;

            const tEnd = performance.now();
            const first = tFirst ?? tEnd;
            const completionTokens = estimateTokens(streamedChars);
            const usage: ChatCompletionUsage = {
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: promptTokens + completionTokens,
              time_to_first_token: round2((first - t0) / 1000 + latencyMs / 1000),
              total_latency: round2((tEnd - t0) / 1000 + latencyMs / 1000),
              // Tokens per second: performance.now() is in milliseconds.
              completion_tokens_after_first_per_sec: round2(
                completionTokens / Math.max((tEnd - first) / 1000, 0.001),
              ),
            };
            // Separate usage-only frame, as with OpenAI `stream_options.include_usage`.
            const usageFrame: ChatCompletionChunk = { ...chunk({}, null), choices: [], usage };
            if (!send(sseFrame(usageFrame))) return;
            if (!send(DONE_FRAME)) return;
            controller.close();
          } catch (error) {
            // The consumer went away between the check and the enqueue: nothing left to send.
            if (!stopped()) controller.error(error);
          }
        },
        // Stop button, abort or navigation: the transferred stream reports the cancel here.
        cancel() {
          cancelled = true;
        },
      });

      // Runs once the stream completes, errors or is cancelled: charge for what was generated.
      finalize(async () => {
        const cost = replyCost(model.pricing, promptTokens, estimateTokens(streamedChars));
        if (cost <= 0) return;
        await chargeCredits(account.id, cost);
        await runAutoRechargeFor(account.id);
      });

      return new HttpResponse(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }),
  ),

  http.get(
    api("/projects/:projectId/playground/conversations"),
    withSession<{ projectId: string }>(async ({ params }) => {
      const accountId = await accountWithProject(params.projectId);
      if (!accountId) return notFound("Project");
      return HttpResponse.json(listConversationsFor(accountId, params.projectId));
    }),
  ),

  http.get(
    api("/projects/:projectId/playground/conversations/:id"),
    withSession<ConversationParams>(async ({ params }) => {
      const accountId = await accountWithProject(params.projectId);
      if (!accountId) return notFound("Project");
      const conversation = getConversationFor(accountId, params.projectId, params.id);
      return conversation ? HttpResponse.json(conversation) : chatNotFound();
    }),
  ),

  http.put(
    api("/projects/:projectId/playground/conversations/:id"),
    withSession<ConversationParams>(async ({ params, request }) => {
      const accountId = await accountWithProject(params.projectId);
      if (!accountId) return notFound("Project");

      const input = (await request.json()) as Partial<SaveConversationInput>;
      const title = typeof input.title === "string" ? input.title.trim() : "";
      if (!title) return validationError("Enter a name.", { field: "title" });
      if (title.length > MAX_SAVED_TITLE) {
        return validationError(`Use ${MAX_SAVED_TITLE} characters or fewer.`, { field: "title" });
      }
      if (!Array.isArray(input.turns) || input.turns.length === 0) {
        return validationError("Add a message.", { field: "turns" });
      }
      if (!input.mode || !PLAYGROUND_MODES.includes(input.mode)) {
        return validationError("Choose a chat mode.", { field: "mode" });
      }

      const conversation = saveConversationFor(accountId, params.projectId, params.id, {
        title,
        mode: input.mode,
        models: input.models ?? {},
        systemPrompt: input.systemPrompt ?? "",
        turns: input.turns,
        createdAt: input.createdAt ?? new Date().toISOString(),
      });
      return HttpResponse.json(conversation);
    }),
  ),

  http.patch(
    api("/projects/:projectId/playground/conversations/:id"),
    withSession<ConversationParams>(async ({ params, request }) => {
      const accountId = await accountWithProject(params.projectId);
      if (!accountId) return notFound("Project");

      const input = (await request.json()) as Partial<RenameConversationInput>;
      const title = typeof input.title === "string" ? input.title.trim() : "";
      if (!title) return validationError("Enter a name.", { field: "title" });
      if (title.length > MAX_RENAMED_TITLE) {
        return validationError(`Use ${MAX_RENAMED_TITLE} characters or fewer.`, {
          field: "title",
        });
      }

      const summary = renameConversationFor(accountId, params.projectId, params.id, title);
      return summary ? HttpResponse.json(summary) : chatNotFound();
    }),
  ),

  http.delete(
    api("/projects/:projectId/playground/conversations/:id"),
    withSession<ConversationParams>(async ({ params }) => {
      const accountId = await accountWithProject(params.projectId);
      if (!accountId) return notFound("Project");
      return deleteConversationFor(accountId, params.projectId, params.id)
        ? new HttpResponse(null, { status: 204 })
        : chatNotFound();
    }),
  ),
];
