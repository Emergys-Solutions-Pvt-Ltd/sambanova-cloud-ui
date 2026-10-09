"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { CodeBlock, codeToString } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icon/icon";
import { Select, type SelectGroup } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type CatalogModel, type ModelCategory } from "@/types/domain";

import { useModelCatalog } from "../hooks/use-dashboard-data";
import { buildSnippet, type EndpointType, type SnippetLanguage } from "../lib/snippets";

const DEFAULT_MODEL_ID = "deepseek-v3.1";
const DEFAULT_MODEL_API_ID = "DeepSeek-V3.1";

const languages: { value: SnippetLanguage; label: string }[] = [
  { value: "curl", label: "Curl" },
  { value: "python", label: "Python" },
  { value: "gradio", label: "Gradio" },
];

const categoryLabels: Record<ModelCategory, string> = {
  reasoning: "Reasoning",
  text: "Text",
  "image-text": "Image / text",
};

const endpointGroups: SelectGroup[] = [{ options: [{ value: "chat", label: "Chat" }] }];

function groupModels(models: CatalogModel[]): SelectGroup[] {
  return (Object.keys(categoryLabels) as ModelCategory[])
    .map((category) => ({
      label: categoryLabels[category],
      options: models
        .filter((model) => model.category === category)
        .map((model) => ({ value: model.id, label: model.apiId })),
    }))
    .filter((group) => group.options.length > 0);
}

/** Copy-paste request examples for the selected model. Collapsible. */
export function DeveloperQuickstart() {
  const { data: models } = useModelCatalog();
  const [open, setOpen] = useState(true);
  const [language, setLanguage] = useState<SnippetLanguage>("curl");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [endpoint, setEndpoint] = useState<EndpointType>("chat");

  // Until the catalog arrives the selector offers just the default so the snippet renders at once.
  const modelGroups = useMemo<SelectGroup[]>(
    () =>
      models
        ? groupModels(models)
        : [{ options: [{ value: DEFAULT_MODEL_ID, label: DEFAULT_MODEL_API_ID }] }],
    [models],
  );
  const apiId = models?.find((model) => model.id === modelId)?.apiId ?? DEFAULT_MODEL_API_ID;

  const snippets = useMemo(
    () =>
      Object.fromEntries(
        languages.map(({ value }) => [value, buildSnippet(value, { model: apiId, endpoint })]),
      ) as Record<SnippetLanguage, ReturnType<typeof buildSnippet>>,
    [apiId, endpoint],
  );

  return (
    <Card
      as="section"
      aria-labelledby="quickstart-title"
      radius="md"
      className="flex flex-col gap-5"
    >
      <header className="flex items-center justify-between gap-4">
        <h2 id="quickstart-title" className="text-heading-sm">
          Developer Quickstart
        </h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="quickstart-body"
          onClick={() => setOpen((current) => !current)}
          className="flex items-center gap-2 rounded-xs text-body-lg font-semibold"
        >
          {open ? "View Less" : "View More"}
          <Icon name={open ? "chevron-up" : "chevron-down"} size="md" />
        </button>
      </header>

      <div id="quickstart-body" hidden={!open}>
        <Tabs value={language} onValueChange={(value) => setLanguage(value as SnippetLanguage)}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <TabsList aria-label="Language">
                {languages.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <CopyButton
                value={codeToString(snippets[language])}
                label={`Copy ${language} example`}
                variant="surface"
                size="field"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="w-full sm:w-53.25">
                <Select
                  aria-label="Model"
                  value={modelId}
                  onValueChange={setModelId}
                  groups={modelGroups}
                  disabled={!models}
                />
              </div>
              <div className="w-full sm:w-33.75">
                <Select
                  aria-label="Endpoint"
                  value={endpoint}
                  onValueChange={(value) => setEndpoint(value as EndpointType)}
                  groups={endpointGroups}
                  icon={<Icon name="chat" size="sm" />}
                />
              </div>
            </div>
          </div>

          {languages.map(({ value, label }) => (
            <TabsContent key={value} value={value} className="mt-4">
              <CodeBlock lines={snippets[value]} label={`${label} example`} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
}
