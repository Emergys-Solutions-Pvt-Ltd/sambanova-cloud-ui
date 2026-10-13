import {
  type Conversation,
  type ConversationSummary,
  type ConversationTurn,
  type SaveConversationInput,
} from "@/types/domain";

import { seedConversations } from "../fixtures/playground";

/**
 * Playground chat history. The real backend stores history server-side per project; this mock
 * keeps it in localStorage per account. A project is seeded with the Figma History items the
 * first time it is touched, so seeds appear once per account + project.
 */
const PLAYGROUND_KEY = "sn:mock-playground";

type ConversationsByAccount = Record<string, Record<string, Conversation[]>>;

function read(): ConversationsByAccount {
  try {
    return JSON.parse(localStorage.getItem(PLAYGROUND_KEY) ?? "{}") as ConversationsByAccount;
  } catch {
    return {};
  }
}

const write = (value: ConversationsByAccount) =>
  localStorage.setItem(PLAYGROUND_KEY, JSON.stringify(value));

/** Loads the store and the project's list, seeding (and persisting) a project seen for the first time. */
function load(accountId: string, projectId: string) {
  const all = read();
  const byProject = (all[accountId] ??= {});
  if (!byProject[projectId]) {
    byProject[projectId] = seedConversations(new Date());
    write(all);
  }
  return { all, list: byProject[projectId] };
}

const toSummary = ({ id, title, mode, updatedAt }: Conversation): ConversationSummary => ({
  id,
  title,
  mode,
  updatedAt,
});

/** Summaries for the project's History, most recently updated first. */
export function listConversationsFor(accountId: string, projectId: string): ConversationSummary[] {
  return load(accountId, projectId)
    .list.map(toSummary)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getConversationFor(accountId: string, projectId: string, id: string) {
  return load(accountId, projectId).list.find((item) => item.id === id) ?? null;
}

/** Creates or replaces the conversation; `updatedAt` becomes now, `createdAt` comes from the body. */
export function saveConversationFor(
  accountId: string,
  projectId: string,
  id: string,
  input: SaveConversationInput,
): Conversation {
  const { all, list } = load(accountId, projectId);
  const conversation: Conversation = {
    id,
    title: input.title.trim(),
    mode: input.mode,
    models: input.models,
    systemPrompt: input.systemPrompt,
    // `runId` is client-only stream bookkeeping and is never stored.
    turns: input.turns.map((turn) => {
      const replies: ConversationTurn["replies"] = {};
      for (const slot of ["a", "b"] as const) {
        const reply = turn.replies[slot];
        if (!reply) continue;
        const { runId: _runId, ...stored } = reply;
        replies[slot] = stored;
      }
      return { ...turn, replies };
    }),
    createdAt: input.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) list.push(conversation);
  else list[index] = conversation;
  write(all);
  return conversation;
}

/** Renames without touching `updatedAt`, so the item keeps its place. `null` when missing. */
export function renameConversationFor(
  accountId: string,
  projectId: string,
  id: string,
  title: string,
): ConversationSummary | null {
  const { all, list } = load(accountId, projectId);
  const conversation = list.find((item) => item.id === id);
  if (!conversation) return null;
  conversation.title = title.trim();
  write(all);
  return toSummary(conversation);
}

/** `false` when the conversation does not exist. */
export function deleteConversationFor(accountId: string, projectId: string, id: string) {
  const { all, list } = load(accountId, projectId);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return false;
  list.splice(index, 1);
  write(all);
  return true;
}
