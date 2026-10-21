"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { NumberInput } from "@/components/ui/number-input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { selectMode, selectModels, usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { selectTuning, usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";
import { toast } from "@/stores/toast-store";

import { usePlaygroundModels } from "../hooks/use-playground-models";
import { clampMaxTokens, maxTokensLimit } from "../lib/tuning";
import { type PlaygroundDialogBodyProps } from "./system-prompt-dialog";

/**
 * Tuning Parameters dialog (Figma: `1398:119100` pristine, `1398:119215` edited). Sampling on
 * means temperature 0.7 + top_p 0.95; Max Tokens 0 is the model default. The number field and
 * the slider are bound to one value, capped at the active model's max output (the smaller of
 * the two in compare).
 */
export function TuningDialog({ onCloseAutoFocus }: PlaygroundDialogBodyProps) {
  const saved = usePlaygroundPrefsStore(selectTuning);
  const setTuning = usePlaygroundPrefsStore((state) => state.setTuning);
  const closeDialog = usePlaygroundUIStore((state) => state.closeDialog);
  const mode = usePlaygroundChatStore(selectMode);
  const models = usePlaygroundChatStore(selectModels);
  const { resolve } = usePlaygroundModels();

  const limit = maxTokensLimit(
    mode === "compare" ? [resolve(models.a), resolve(models.b)] : [resolve(models.a)],
  );

  const [sampling, setSampling] = useState(saved.sampling);
  const [maxTokens, setMaxTokens] = useState(saved.maxTokens);
  // The catalog can arrive (or the model change) while open, so clamp at render, not in state.
  const value = clampMaxTokens(maxTokens, limit);
  const dirty = sampling !== saved.sampling || value !== saved.maxTokens;

  const switchRef = useRef<HTMLButtonElement>(null);
  const ids = {
    sampling: useId(),
    samplingHint: useId(),
    maxTokens: useId(),
    maxTokensLabel: useId(),
    maxTokensHint: useId(),
  };

  const save = () => {
    setTuning({ sampling, maxTokens: value });
    closeDialog();
    toast.success("Tuning parameters saved");
  };

  const rowClasses = "flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-start";
  const labelClasses = "text-body-lg font-semibold text-primary";
  const hintClasses = "text-body-sm leading-normal text-muted";

  return (
    <DialogContent
      size="lg"
      variant="subtle"
      title="Tuning Parameters"
      description="Adjust model parameters to control the randomness and length of the responses."
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        switchRef.current?.focus();
      }}
      onCloseAutoFocus={onCloseAutoFocus}
      footer={
        <>
          <DialogClose asChild>
            <Button variant="cancel" className="h-9.25 min-w-22.5">
              Cancel
            </Button>
          </DialogClose>
          <Button className="min-w-23" disabled={!dirty} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      {/* Figma body pt 12 below the 24px header gap; the slider's 24px bottom padding and the
          24px gap above the buttons = pb-8 + the 20px footer gap. */}
      <div className="flex flex-col gap-6 pt-3 pb-8">
        <div className="flex flex-col gap-3">
          <div className={rowClasses}>
            <div className="flex max-w-107.75 flex-col gap-1">
              <label htmlFor={ids.sampling} className={labelClasses}>
                Sampling
              </label>
              <p id={ids.samplingHint} className={hintClasses}>
                Controls response randomness. Enable for more creative outputs or disable for more
                predictable responses.
              </p>
            </div>
            <Switch
              ref={switchRef}
              id={ids.sampling}
              checked={sampling}
              onCheckedChange={setSampling}
              aria-describedby={ids.samplingHint}
            />
          </div>
          <hr className="border-subtle" />
          <div className={rowClasses}>
            <div className="flex max-w-107.75 flex-col gap-1">
              <label id={ids.maxTokensLabel} htmlFor={ids.maxTokens} className={labelClasses}>
                Max Tokens
              </label>
              <p id={ids.maxTokensHint} className={hintClasses}>
                Limits the maximum response length. Higher values generate longer responses but use
                more tokens.
              </p>
            </div>
            <NumberInput
              id={ids.maxTokens}
              value={value}
              onValueChange={(next) => setMaxTokens(clampMaxTokens(next, limit))}
              min={0}
              max={limit}
              aria-labelledby={ids.maxTokensLabel}
            />
          </div>
        </div>
        <Slider
          value={value}
          min={0}
          max={limit}
          onValueChange={(next) => setMaxTokens(clampMaxTokens(next, limit))}
          aria-label="Max tokens"
          minLabel="0"
          maxLabel={limit.toLocaleString("en-US")}
        />
      </div>
    </DialogContent>
  );
}
