import { type ApiKeyRequestError } from "@/types/domain";

/**
 * Building blocks for the mock request log of an API key: the models, what each one costs, the
 * prompts and answers, and the errors a request can end with. The prompts and models are the ones
 * shown in the Figma "API Request Logs" table; prices and the rest are made up for the mock.
 */
export interface UsageModel {
  name: string;
  /** USD per one million tokens. */
  inputPerMillion: number;
  outputPerMillion: number;
  /** How often the model is picked relative to the others. */
  weight: number;
}

export const USAGE_MODELS: readonly UsageModel[] = [
  { name: "DeepSeek-V3.1", inputPerMillion: 3, outputPerMillion: 4.5, weight: 3 },
  { name: "gpt-oss-120b", inputPerMillion: 0.22, outputPerMillion: 0.59, weight: 3 },
  { name: "Minimax-M2.7", inputPerMillion: 0.3, outputPerMillion: 1.2, weight: 2 },
  { name: "Meta-Llama-3.3-70B-Instruct", inputPerMillion: 0.6, outputPerMillion: 1.2, weight: 2 },
  { name: "gemma-4-31B-it", inputPerMillion: 0.15, outputPerMillion: 0.4, weight: 2 },
];

export const USAGE_PROMPTS: readonly { request: string; response: string }[] = [
  {
    request:
      "Write a JavaScript function to remove duplicate values from an array and explain the approach.",
    response:
      "This solution removes duplicate values by using JavaScript's built-in Set object. It provides an efficient and readable approach with minimal code.",
  },
  {
    request: "How can I integrate Deepseek V3.1 into my existing projects?",
    response:
      "You can call Deepseek V3.1 through the Sambanova API with any OpenAI-compatible client. Point the base URL at the Sambanova endpoint, pass your API key and set the model name.",
  },
  {
    request: "What coding languages are compatible with Deepseek V3.1?",
    response:
      "Deepseek V3.1 works with most popular languages, including Python, JavaScript, TypeScript, Java, Go, Rust and C++, and it follows each language's common idioms.",
  },
  {
    request: "Can you provide examples of projects that successfully use Deepseek V3.1?",
    response:
      "Teams use it for code review assistants, internal documentation search, customer-support copilots and data-pipeline helpers that explain or generate SQL.",
  },
  {
    request: "What are the best practices for using Deepseek V3.1 in software development?",
    response:
      "Keep prompts specific, include the relevant code and constraints, ask for tests alongside the implementation and always review generated changes before merging.",
  },
  {
    request: "How does Deepseek V3.1 improve coding efficiency for developers?",
    response:
      "It drafts boilerplate, explains unfamiliar code and suggests fixes quickly, so developers spend less time on routine work and more on design decisions.",
  },
  {
    request: "What troubleshooting tips can you share for Deepseek V3.1?",
    response:
      "Check that the model name and API key are correct, reduce the prompt size if you hit context limits and retry with backoff when the service reports a rate limit.",
  },
  {
    request: "Summarize the key differences between REST and GraphQL in three bullet points.",
    response:
      "REST exposes many fixed endpoints, GraphQL exposes one flexible endpoint, and GraphQL lets clients ask for exactly the fields they need.",
  },
  {
    request: "Generate unit tests for a function that validates email addresses.",
    response:
      "The tests cover valid addresses, missing @ signs, empty strings, extra whitespace and unusual but legal characters such as plus signs in the local part.",
  },
  {
    request: "Explain how rotary position embeddings work in transformer models.",
    response:
      "Rotary embeddings encode position by rotating the query and key vectors by an angle that depends on the token's index, so attention scores reflect relative distance.",
  },
];

export interface UsageErrorKind extends ApiKeyRequestError {
  /** How long the failed request took before the error came back. */
  responseTimeMs: number;
}

export const USAGE_ERRORS: readonly UsageErrorKind[] = [
  {
    code: 503,
    title: "Service Unavailable",
    message: "The model service is temporarily unavailable. Please try again later.",
    responseTimeMs: 60_000,
  },
  {
    code: 429,
    title: "Too Many Requests",
    message: "Rate limit exceeded for this model. Retry after a short delay.",
    responseTimeMs: 320,
  },
  {
    code: 500,
    title: "Internal Server Error",
    message: "Something went wrong while generating the response. Please try again.",
    responseTimeMs: 1_850,
  },
];
