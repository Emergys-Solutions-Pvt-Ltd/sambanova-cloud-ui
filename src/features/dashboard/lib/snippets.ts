import { type CodeLine } from "@/components/ui/code-block";

export type SnippetLanguage = "curl" | "python" | "gradio";
export type EndpointType = "chat";

export const API_BASE_URL = "https://api.sambanova.ai/v1";

/** Request shown in a snippet. The optional fields are left out of the code when omitted. */
export interface SnippetOptions {
  /** Value for the request's `model` field. */
  model: string;
  endpoint: EndpointType;
  /** System message content; omitted → "You are a helpful assistant". */
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant";

const plain = (text: string) => ({ text });
const str = (text: string) => ({ text, kind: "string" as const });
const val = (text: string) => ({ text, kind: "value" as const });

/** Sampling / length parameters that were set, in request order, with their JSON names. */
function extraParams({ temperature, topP, maxTokens }: SnippetOptions) {
  return (
    [
      ["temperature", temperature],
      ["top_p", topP],
      ["max_tokens", maxTokens],
    ] as const
  ).flatMap(([name, value]) => (value === undefined ? [] : [{ name, value: String(value) }]));
}

/** A JSON string literal that can sit inside the single-quoted shell argument of `-d '…'`. */
const shellJsonString = (text: string) => JSON.stringify(text).replaceAll("'", "'\\''");

/** Mirrors the Figma Quickstart curl sample (indentation included). */
function curl(options: SnippetOptions): CodeLine[] {
  const { model, systemPrompt = DEFAULT_SYSTEM_PROMPT } = options;
  return [
    [plain("curl -H "), str('"Authorization: Bearer $API_KEY"'), plain(" \\")],
    [plain('    -H "Content-Type: application/json" \\')],
    [plain("    -d '{")],
    [plain('"stream": true,')],
    [plain('"model": '), val(`"${model}",`)],
    ...extraParams(options).map(({ name, value }) => [plain(`"${name}": `), val(`${value},`)]),
    [plain('"messages": [')],
    [plain("{")],
    [plain(' "role": '), val('"system",')],
    [plain(' "content": '), val(shellJsonString(systemPrompt))],
    [plain("},")],
    [plain("{")],
    [plain(' "role": "user",')],
    [plain(' "content": "Hello!"')],
    [plain("}")],
    [plain("]")],
    [plain("}' \\")],
    [str(`    -X POST ${API_BASE_URL}/chat/completions`)],
  ];
}

/** The OpenAI-compatible Python client pointed at SambaNova. */
function python(options: SnippetOptions): CodeLine[] {
  const { model, systemPrompt = DEFAULT_SYSTEM_PROMPT } = options;
  return [
    [plain("from openai import OpenAI")],
    [plain("")],
    [plain("client = OpenAI(")],
    [plain("    base_url="), str(`"${API_BASE_URL}"`), plain(",")],
    [plain("    api_key="), str('"<YOUR_API_KEY>"'), plain(",")],
    [plain(")")],
    [plain("")],
    [plain("response = client.chat.completions.create(")],
    [plain("    model="), val(`"${model}"`), plain(",")],
    ...extraParams(options).map(({ name, value }) => [
      plain(`    ${name}=`),
      val(value),
      plain(","),
    ]),
    [plain("    messages=[")],
    [
      plain('        {"role": "system", "content": '),
      val(JSON.stringify(systemPrompt)),
      plain("},"),
    ],
    [plain('        {"role": "user", "content": "Hello!"},')],
    [plain("    ],")],
    [plain("    stream=True,")],
    [plain(")")],
    [plain("")],
    [plain("for chunk in response:")],
    [
      plain("    print(chunk.choices[0].delta.content or "),
      str('""'),
      plain(", end="),
      str('""'),
      plain(")"),
    ],
  ];
}

function gradio({ model }: SnippetOptions): CodeLine[] {
  return [
    [plain("import gradio as gr")],
    [plain("import sambanova_gradio")],
    [plain("")],
    [plain("gr.load(")],
    [plain("    name="), val(`"${model}"`), plain(",")],
    [plain("    src=sambanova_gradio.registry,")],
    [plain(").launch()")],
  ];
}

const generators: Record<SnippetLanguage, (options: SnippetOptions) => CodeLine[]> = {
  curl,
  python,
  gradio,
};

/** Code lines for one language; with only `model` and `endpoint` this is the Figma Quickstart sample. */
export function buildSnippet(language: SnippetLanguage, options: SnippetOptions): CodeLine[] {
  return generators[language](options);
}
