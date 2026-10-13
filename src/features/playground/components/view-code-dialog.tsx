"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock, type CodeLine, codeToString } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon/icon";
import { Select, type SelectGroup } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildSnippet, type EndpointType, type SnippetLanguage } from "@/features/dashboard";
import { selectModels, usePlaygroundChatStore } from "@/stores/playground-chat-store";
import {
  selectSystemPrompt,
  selectTuning,
  usePlaygroundPrefsStore,
} from "@/stores/playground-prefs-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";
import { toast } from "@/stores/toast-store";

import { usePlaygroundModels } from "../hooks/use-playground-models";
import { DEFAULT_VIEW_CODE_MODEL } from "../lib/models";
import { toSnippetOptions } from "../lib/snippet-options";
import { type PlaygroundDialogBodyProps } from "./system-prompt-dialog";

/** API id of the default model, so the snippet renders before the catalog arrives. */
const DEFAULT_VIEW_CODE_API_ID = "DeepSeek-V3.1";

const LANGUAGES: { value: SnippetLanguage; label: string }[] = [
  { value: "curl", label: "Curl" },
  { value: "python", label: "Python" },
  { value: "gradio", label: "Gradio" },
];

const ENDPOINT_GROUPS: SelectGroup[] = [{ options: [{ value: "chat", label: "Chat" }] }];

/**
 * View Code dialog (Figma: `1398:119330`). The Quickstart toolbar and code panel, with the
 * snippet built from the Playground model, system prompt and tuning. The model select changes
 * only the snippet, never the Playground model.
 */
export function ViewCodeDialog({ onCloseAutoFocus }: PlaygroundDialogBodyProps) {
  const activeModels = usePlaygroundChatStore(selectModels);
  const systemPrompt = usePlaygroundPrefsStore(selectSystemPrompt);
  const tuning = usePlaygroundPrefsStore(selectTuning);
  const closeDialog = usePlaygroundUIStore((state) => state.closeDialog);
  const { groups, resolve } = usePlaygroundModels();

  const [language, setLanguage] = useState<SnippetLanguage>("curl");
  const [modelId, setModelId] = useState(activeModels.a ?? DEFAULT_VIEW_CODE_MODEL);
  const [endpoint, setEndpoint] = useState<EndpointType>("chat");
  const tabsRef = useRef<HTMLDivElement>(null);

  const model = resolve(modelId);
  const apiId =
    model?.apiId ?? (modelId === DEFAULT_VIEW_CODE_MODEL ? DEFAULT_VIEW_CODE_API_ID : modelId);
  // Until the catalog arrives the select offers just the current model.
  const modelGroups: SelectGroup[] =
    groups.length > 0 ? groups : [{ options: [{ value: modelId, label: apiId }] }];

  const options = toSnippetOptions({ apiId, model, endpoint, systemPrompt, tuning });
  const snippets = Object.fromEntries(
    LANGUAGES.map(({ value }) => [value, buildSnippet(value, options)]),
  ) as Record<SnippetLanguage, CodeLine[]>;
  const code = codeToString(snippets[language]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      toast.danger("Couldn't copy the code. Select it and copy it manually.");
      return;
    }
    toast.success("Code copied to clipboard");
    closeDialog();
  };

  return (
    <DialogContent
      size="lg"
      variant="subtle"
      title="View Code"
      description="Copy and paste the code provided below into your terminal"
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        tabsRef.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')?.focus();
      }}
      onCloseAutoFocus={onCloseAutoFocus}
      footer={
        <>
          <DialogClose asChild>
            <Button variant="cancel" className="h-9.25 min-w-22.5">
              Cancel
            </Button>
          </DialogClose>
          <Button className="min-w-23" onClick={() => void copyCode()}>
            Copy Code
          </Button>
        </>
      }
    >
      <Card radius="md">
        <Tabs value={language} onValueChange={(value) => setLanguage(value as SnippetLanguage)}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div ref={tabsRef} className="flex items-center gap-3">
              <TabsList aria-label="Language">
                {LANGUAGES.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <CopyButton value={code} label="Copy code" variant="surface" size="field" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="w-full sm:w-53.25">
                <Select
                  aria-label="Model"
                  value={modelId}
                  onValueChange={setModelId}
                  groups={modelGroups}
                  disabled={groups.length === 0}
                />
              </div>
              <div className="w-full sm:w-33.75">
                <Select
                  aria-label="Endpoint"
                  value={endpoint}
                  onValueChange={(value) => setEndpoint(value as EndpointType)}
                  groups={ENDPOINT_GROUPS}
                  icon={<Icon name="chat" size="sm" />}
                />
              </div>
            </div>
          </div>
          {LANGUAGES.map(({ value, label }) => (
            <TabsContent key={value} value={value} className="mt-4">
              <CodeBlock lines={snippets[value]} label={`${label} example`} />
              {value === "gradio" && (
                <p className="mt-3 text-body-sm text-muted">
                  Gradio uses the model’s default system prompt and parameters.
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </DialogContent>
  );
}
