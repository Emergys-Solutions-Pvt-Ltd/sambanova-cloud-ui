"use client";

import { Icon } from "@/components/ui/icon/icon";
import { OptionMenu } from "@/components/ui/option-menu";
import { selectModels, usePlaygroundChatStore } from "@/stores/playground-chat-store";

import { useChatActions } from "../hooks/use-chat-actions";
import { usePlaygroundModels } from "../hooks/use-playground-models";

export interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Composer model menu for single chat (Figma: trigger `620:12439` / `1004:54861`, menu
 * `1398:119665`): opens above the trigger, right-aligned, 3px gap; selecting sets model A.
 */
export function ModelPicker({ open, onOpenChange }: ModelPickerProps) {
  const modelId = usePlaygroundChatStore(selectModels).a;
  const { groups, resolve } = usePlaygroundModels();
  const { selectModel } = useChatActions();
  const model = resolve(modelId);
  const label = model ? `Model: ${model.name}` : "Select model";

  return (
    <OptionMenu
      value={model ? modelId : null}
      onValueChange={(id) => selectModel("a", id)}
      groups={groups}
      aria-label={label}
      surface="flat"
      side="top"
      align="end"
      sideOffset={3}
      contentClassName="w-65.5"
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <button
          type="button"
          aria-label={label}
          className="group inline-flex h-8 min-w-0 shrink-0 items-center gap-2 rounded-md py-1.5 pr-2 pl-3 text-body-lg leading-[normal] text-composer-model transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover-strong data-[state=open]:bg-hover-strong motion-reduce:transition-none"
        >
          <span className="truncate whitespace-nowrap max-sm:max-w-36">
            {model?.name ?? "Select Model"}
          </span>
          <Icon
            name="chevron-down"
            size={20}
            className="shrink-0 transition-transform duration-(--sn-duration-fast) ease-standard group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </button>
      }
    />
  );
}
