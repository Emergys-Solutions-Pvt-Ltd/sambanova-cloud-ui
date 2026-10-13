import { formatTokenCount } from "@/lib/format";
import {
  type AssistantReply,
  type CatalogModel,
  type CompareSlot,
  type Conversation,
  type ReplyMetrics,
} from "@/types/domain";

import { modelCatalogFixture } from "./model-catalog";

/**
 * Deterministic Playground answers and History seeds. Replies 1 and 2A/2B are the exact
 * Figma texts (chat-b `1398:122190`, compare `1398:120093` / `1398:120107`); the rest are
 * placeholders written in the same markdown style.
 */

/** Figma "Answer received" (`1398:122165`): the remove-duplicates answer, verbatim. */
const REMOVE_DUPLICATES_REPLY = `### Brief Overview

This solution removes duplicate values by using JavaScript's built-in Set object. It provides an efficient and readable approach with minimal code.

\`\`\`javascript
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

// Example
const numbers = [1, 2, 2, 3, 4, 4, 5];
console.log(removeDuplicates(numbers));
\`\`\`

### Explanation

- A Set automatically stores only unique values.
- The spread operator (...) converts the Set back into an array.
- This approach is concise, easy to understand, and performs well for most use cases.

For modern JavaScript applications, using Set is the preferred solution because it improves readability while avoiding manual loops or nested comparisons.`;

/** Figma "Compare Results" column A (`1398:120093`, DeepSeek). */
const KPI_DASHBOARD_REPLY_A = `\`\`\`typescript
interface KPIProps {
  title: string;
  value: string;
  change: number;
}
\`\`\`

### Architecture

- Uses reusable KPI card components.
- Separates layout from business logic.
- State managed with React Context.
- Responsive sidebar using CSS Grid.
- TypeScript interfaces ensure component safety.`;

/** Figma "Compare Results" column B (`1398:120107`, every non-DeepSeek model). */
const KPI_DASHBOARD_REPLY_B = `\`\`\`typescript
type KPICardProps = {
  heading: string;
  value: string;
  trend?: number;
};
\`\`\`

### Architecture

- Atomic component design.
- Uses custom hooks for fetching KPI data.
- Responsive Flexbox layout.
- Lazy-loads dashboard widgets.
- Theme-ready using design tokens.`;

const PRODUCT_LAUNCH_REPLY = `### Launch Strategy

Here’s a lean, four-phase plan you can adapt to your product and market.

1. **Research:** Interview ten target customers to confirm the problem and the language they use for it.
2. **Positioning:** Write a one-line value proposition and test it on your landing page before launch.
3. **Launch week:** Announce on your strongest channel first, then follow with partners and communities.
4. **Post-launch:** Review feedback daily for two weeks and ship the top three fixes quickly.

### Key Metrics

- **Activation rate:** share of sign-ups that reach the first moment of value.
- **Week-1 retention:** share of new users who come back within seven days.
- **CAC payback:** months until a customer’s margin covers what it cost to acquire them.`;

const ITINERARY_REPLY = `### 5-Day Itinerary

- **Day 1:** Arrive, check in near your meetings, and keep the evening free to recover from travel.
- **Day 2:** Schedule the most important meetings while you are fresh, with a team dinner after.
- **Day 3:** Hold workshops in the morning and explore the old town in the afternoon.
- **Day 4:** Visit a partner site, then take a guided food tour in the evening.
- **Day 5:** Wrap up with a short debrief, pack, and leave buffer time for the airport.

### Tips

- Book refundable fares in case meetings move.
- Keep a shared calendar with addresses and travel times.
- Carry a power bank and a universal adapter.`;

/** One bullet of the "compare deepseek" answer: model name and its catalog description. */
function catalogLine(modelId: string) {
  const model = modelCatalogFixture.find((item) => item.id === modelId);
  return model ? `- **${model.name}:** ${model.description}` : "";
}

const compareModelsReply = () =>
  [
    "### DeepSeek vs Llama vs Gemma",
    "",
    catalogLine("deepseek-v3.1"),
    catalogLine("llama-3.3-70b"),
    catalogLine("gemma-4-31b"),
    "",
    "Open **Compare Models** to run the same prompt on two models side by side.",
  ].join("\n");

/** "128_000" → "128K tokens" (the catalog formatter appends "tok"). */
const tokenLabel = (tokens: number) => `${formatTokenCount(tokens).replace(/ tok$/, "")} tokens`;

function capabilitiesReply(model: CatalogModel, systemPrompt: string) {
  const intro = `I’m ${model.name}, served on SambaNova Cloud for fast, low-latency responses.`;
  const role = systemPrompt.trim()
    ? " Following your system prompt, I’ll answer from that perspective."
    : "";
  return [
    `### ${model.name} at a glance`,
    "",
    `${intro}${role}`,
    "",
    `- **Context window:** ${tokenLabel(model.features.contextWindow)}`,
    `- **Max output:** ${tokenLabel(model.features.maxOutput)}`,
    `- **Best for:** ${model.description}`,
  ].join("\n");
}

const PROMPT_QUOTE_LIMIT = 120;

function fallbackReply(prompt: string, model: CatalogModel) {
  const oneLine = prompt.trim().replace(/\s+/g, " ");
  const quoted =
    oneLine.length > PROMPT_QUOTE_LIMIT
      ? `${oneLine.slice(0, PROMPT_QUOTE_LIMIT - 1).trimEnd()}…`
      : oneLine;
  return `### Response

Here’s a structured answer to “${quoted}”.

1. **Clarify the goal:** Pin down the outcome you want and how you will know it worked.
2. **Break it down:** Split the work into small steps that can each be checked on their own.
3. **Deliver and review:** Ship the first version, then compare the result with the goal.

\`\`\`text
[ ] Goal written in one sentence
[ ] Steps listed in order
[ ] Review date set
\`\`\`

This answer was generated by ${model.name} on SambaNova Cloud. Ask a follow-up to go deeper on any step.`;
}

/** Input of {@link cannedReply}: the last user prompt, the model that answers and the system prompt. */
export interface CannedReplyInput {
  prompt: string;
  model: CatalogModel;
  systemPrompt: string;
}

/** The mock model's answer (markdown). First matching rule wins; matching ignores case. */
export function cannedReply({ prompt, model, systemPrompt }: CannedReplyInput): string {
  if (/remove duplicate/i.test(prompt)) return REMOVE_DUPLICATES_REPLY;
  if (/react dashboard/i.test(prompt)) {
    return model.brand === "deepseek" ? KPI_DASHBOARD_REPLY_A : KPI_DASHBOARD_REPLY_B;
  }
  if (/product launch/i.test(prompt)) return PRODUCT_LAUNCH_REPLY;
  if (/business trip|itinerary|trip to/i.test(prompt)) return ITINERARY_REPLY;
  if (/compare deepseek/i.test(prompt)) return compareModelsReply();
  if (/capabilit/i.test(prompt)) return capabilitiesReply(model, systemPrompt);
  return fallbackReply(prompt, model);
}

/* ---- History seeds (Figma History `1398:118993`: Today ×4, Last 7 days ×4) ---- */

/** Figma sample footer numbers; only seeded replies carry them. */
const SEED_METRICS: ReplyMetrics = {
  tokensPerSecond: 202.23,
  totalSeconds: 8.79,
  firstTokenSeconds: 0.82,
  completionTokens: 412,
};

interface SeedSpec {
  title: string;
  prompt: string;
  models: Partial<Record<CompareSlot, string>>;
}

const KPI_DASHBOARD_PROMPT =
  "Build a responsive React dashboard with a collapsible sidebar and reusable KPI card components using TypeScript. Explain your architecture decisions and optimize for scalability.";
const CASH_FLOW_PROMPT =
  "What is our cash flow projection for Q3 and how does it compare to last year?";

const SEED_SPECS: SeedSpec[] = [
  {
    title: "Chat Bot Enhancement",
    prompt: "Suggest enhancements for our customer-support chat bot.",
    models: { a: "deepseek-v3.1" },
  },
  { title: CASH_FLOW_PROMPT, prompt: CASH_FLOW_PROMPT, models: { a: "gpt-oss-120b" } },
  {
    title: "Plan 5 day trip to Bali",
    prompt: "Plan 5 day trip to Bali",
    models: { a: "minimax-m2.7" },
  },
  {
    title: KPI_DASHBOARD_PROMPT,
    prompt: KPI_DASHBOARD_PROMPT,
    models: { a: "deepseek-v3.1", b: "minimax-m2.7" },
  },
];

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const TODAY_OFFSETS = [2 * MINUTE, 4 * MINUTE, 6 * MINUTE, 8 * MINUTE];
const LAST_WEEK_OFFSETS = [2 * DAY, 3 * DAY, 4 * DAY, 6 * DAY];

/** Mock id: prefix + 8 hex characters (`cnv_1a2b3c4d`). */
export const mockId = (prefix: string) => `${prefix}${crypto.randomUUID().slice(0, 8)}`;

function seedReply(modelId: string, prompt: string): AssistantReply | undefined {
  const model = modelCatalogFixture.find((item) => item.id === modelId);
  if (!model) return undefined;
  return {
    modelId,
    status: "done",
    content: cannedReply({ prompt, model, systemPrompt: "" }),
    metrics: SEED_METRICS,
    finishReason: "stop",
  };
}

function seedConversation(spec: SeedSpec, updatedAt: string): Conversation {
  const replies: Partial<Record<CompareSlot, AssistantReply>> = {};
  for (const slot of ["a", "b"] as const) {
    const modelId = spec.models[slot];
    const reply = modelId ? seedReply(modelId, spec.prompt) : undefined;
    if (reply) replies[slot] = reply;
  }
  return {
    id: mockId("cnv_"),
    title: spec.title,
    mode: spec.models.b ? "compare" : "single",
    models: spec.models,
    systemPrompt: "",
    turns: [{ id: mockId("trn_"), prompt: spec.prompt, createdAt: updatedAt, replies }],
    createdAt: updatedAt,
    updatedAt,
  };
}

/** The eight Figma History items (four today, the same four titles earlier this week). */
export function seedConversations(now: Date): Conversation[] {
  const at = (offset: number) => new Date(now.getTime() - offset).toISOString();
  return [
    ...SEED_SPECS.map((spec, index) => seedConversation(spec, at(TODAY_OFFSETS[index]))),
    ...SEED_SPECS.map((spec, index) => seedConversation(spec, at(LAST_WEEK_OFFSETS[index]))),
  ];
}
