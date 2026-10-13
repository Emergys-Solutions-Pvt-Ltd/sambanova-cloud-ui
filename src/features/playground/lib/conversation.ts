import { type ChatMessage, type CompareSlot, type ConversationTurn } from "@/types/domain";

const TITLE_MAX = 80;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Client id such as "cnv_1a2b3c4d". Call from event handlers only (never during render). */
export function newId(prefix: "cnv" | "trn" | "run") {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

/** History title from the first prompt: first line, whitespace collapsed, ≤ 80 chars with "…". */
export function makeTitle(prompt: string) {
  const line =
    prompt
      .split("\n")
      .map((part) => part.replace(/\s+/g, " ").trim())
      .find(Boolean) ?? "";
  if (!line) return "New chat";
  return line.length > TITLE_MAX ? `${line.slice(0, TITLE_MAX - 1).trimEnd()}…` : line;
}

/**
 * Messages for one slot's request: optional system prompt, every earlier turn
 * (user + that slot's settled, non-empty assistant reply), then the turn's prompt.
 */
export function buildRequestMessages(
  turns: readonly ConversationTurn[],
  uptoTurnId: string,
  slot: CompareSlot,
  systemPrompt: string,
): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const system = systemPrompt.trim();
  if (system) messages.push({ role: "system", content: system });

  for (const turn of turns) {
    messages.push({ role: "user", content: turn.prompt });
    if (turn.id === uptoTurnId) break;
    const reply = turn.replies[slot];
    if (reply && (reply.status === "done" || reply.status === "stopped") && reply.content.trim()) {
      messages.push({ role: "assistant", content: reply.content });
    }
  }
  return messages;
}

export type DateGroupLabel = "Today" | "Last 7 days" | "Last 30 days" | "Older";

export interface DateGroup<T> {
  label: DateGroupLabel;
  items: T[];
}

const isSameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** History buckets (Figma: History `1398:118993`); keeps input order inside a group, drops empty groups. */
export function groupByDate<T extends { updatedAt: string }>(
  items: readonly T[],
  now: Date,
): DateGroup<T>[] {
  const groups: DateGroup<T>[] = [
    { label: "Today", items: [] },
    { label: "Last 7 days", items: [] },
    { label: "Last 30 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const item of items) {
    const date = new Date(item.updatedAt);
    const age = now.getTime() - date.getTime();
    const bucket = isSameLocalDay(date, now)
      ? 0
      : age <= 7 * DAY_MS
        ? 1
        : age <= 30 * DAY_MS
          ? 2
          : 3;
    groups[bucket]!.items.push(item);
  }
  return groups.filter((group) => group.items.length > 0);
}

/** Case-insensitive title search; an empty query returns every item. */
export function filterByTitle<T extends { title: string }>(items: readonly T[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  return items.filter((item) => item.title.toLowerCase().includes(needle));
}
