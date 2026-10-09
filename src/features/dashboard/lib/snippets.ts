import { type CodeLine } from "@/components/ui/code-block";

export type SnippetLanguage = "curl" | "python" | "gradio";
export type EndpointType = "chat";

export const API_BASE_URL = "https://api.sambanova.ai/v1";

interface SnippetOptions {
  /** Value for the request's `model` field. */
  model: string;
  endpoint: EndpointType;
}

const plain = (text: string) => ({ text });
const str = (text: string) => ({ text, kind: "string" as const });
const val = (text: string) => ({ text, kind: "value" as const });

/** Mirrors the Figma Quickstart curl sample (indentation included). */
function curl({ model }: SnippetOptions): CodeLine[] {
  return [
    [plain("curl -H "), str('"Authorization: Bearer $API_KEY"'), plain(" \\")],
    [plain('    -H "Content-Type: application/json" \\')],
    [plain("    -d '{")],
    [plain('"stream": true,')],
    [plain('"model": '), val(`"${model}",`)],
    [plain('"messages": [')],
    [plain("{")],
    [plain(' "role": '), val('"system",')],
    [plain(' "content": '), val('"You are a helpful assistant"')],
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
function python({ model }: SnippetOptions): CodeLine[] {
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
    [plain("    messages=[")],
    [
      plain('        {"role": "system", "content": '),
      val('"You are a helpful assistant"'),
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

export function buildSnippet(language: SnippetLanguage, options: SnippetOptions): CodeLine[] {
  return generators[language](options);
}
