"use client";

import { useEffect, useId, useRef, useState } from "react";

import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { ChartCard, ChartLegend } from "@/components/ui/chart-card";
import { CopyButton } from "@/components/ui/copy-button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Icon } from "@/components/ui/icon/icon";
import { iconNames } from "@/components/ui/icon/icon-data.generated";
import { LineChart } from "@/components/ui/line-chart";
import { Combobox } from "@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { NumberInput } from "@/components/ui/number-input";
import { OptionMenu } from "@/components/ui/option-menu";
import { Select, type SelectGroup } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea, TextareaField } from "@/components/ui/textarea";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { type DateRangeSelection, startOfDay } from "@/lib/date-range";
import { formatCompactNumber } from "@/lib/format";
import {
  selectSetTheme,
  selectTheme,
  type ThemePreference,
  useThemeStore,
} from "@/stores/theme-store";

const OPTIONS: { value: ThemePreference; label: string; icon: "monitor" | "sun" | "moon" }[] = [
  { value: "system", label: "System", icon: "monitor" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

/** Switches the whole app theme through useThemeStore (persisted). */
export function ThemeSwitch() {
  const theme = useThemeStore(selectTheme);
  const setTheme = useThemeStore(selectSetTheme);

  return (
    <div
      role="radiogroup"
      aria-label="App theme"
      className="inline-flex items-center gap-1 rounded-full border border-switcher-border bg-switcher p-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-caption",
            theme === option.value
              ? "bg-switcher-active text-primary"
              : "text-muted hover:text-primary",
          )}
        >
          <Icon name={option.icon} size="xs" />
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Resolved value of a CSS custom property on this element, read after mount. */
export function CssValue({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const read = () => {
      if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(name).trim());
    };
    read();
    // Re-read when the app theme changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [name]);

  return (
    <span ref={ref} className={cn("font-mono text-tiny break-all text-muted", className)}>
      {value || "…"}
    </span>
  );
}

/** Color swatch that copies its CSS variable on click. */
export function Swatch({
  variable,
  label,
  guessed,
}: {
  variable: string;
  label: string;
  guessed?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(`var(${variable})`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="group flex min-w-0 items-center gap-3 rounded-md p-1.5 text-left hover:bg-hover"
      title={`Copy var(${variable})`}
    >
      <span
        className="size-9 shrink-0 rounded-sm border border-default"
        style={{ background: `var(${variable})` }}
      />
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 text-caption text-primary">
          {label}
          {guessed && (
            <span className="rounded-xs bg-warning-bg px-1 text-micro text-warning">GUESS</span>
          )}
          {copied && <span className="text-micro text-success">copied</span>}
        </span>
        <CssValue name={variable} />
      </span>
    </button>
  );
}

export function IconGallery() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
      {iconNames.map((name) => (
        <li
          key={name}
          className="flex flex-col items-center gap-2 rounded-md border border-subtle p-3 text-center"
        >
          <Icon name={name} size="lg" className="text-secondary" />
          <span className="text-tiny break-all text-muted">{name}</span>
        </li>
      ))}
    </ul>
  );
}

/** Uncontrolled-looking Select demo (the real Select is controlled, so it keeps its own state here). */
export function SelectDemo() {
  const [value, setValue] = useState("a");
  return (
    <div className="w-53.25">
      <Select
        aria-label="Example model"
        value={value}
        onValueChange={setValue}
        groups={[
          {
            label: "Reasoning",
            options: [
              { value: "a", label: "DeepSeek-V3.1" },
              { value: "b", label: "gpt-oss-120b" },
            ],
          },
        ]}
      />
    </div>
  );
}

/** Combobox demo: grouped, searchable, keyboard-driven. */
export function ComboboxDemo() {
  const [value, setValue] = useState("a");
  return (
    <div className="w-72">
      <Combobox
        aria-label="Example model picker"
        value={value}
        onValueChange={setValue}
        groups={[
          {
            label: "Popular Models",
            options: [
              { value: "a", label: "DeepSeek V4 Pro" },
              { value: "b", label: "GPT-OSS-120B" },
            ],
          },
          { label: "All Models", options: [{ value: "c", label: "Meta-Llama-3.3-70B-Instruct" }] },
        ]}
      />
    </div>
  );
}

/** Switch demo: labelled by visible text, toggles with Space / Enter. */
export function SwitchDemo() {
  const [checked, setChecked] = useState(false);
  const labelId = useId();
  return (
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} aria-labelledby={labelId} />
      <span id={labelId} className="text-body text-content">
        Sampling {checked ? "on" : "off"}
      </span>
      <Switch defaultChecked disabled aria-label="Disabled example" />
    </div>
  );
}

const MAX_TOKENS = 8192;

/** Max Tokens pair: NumberInput and Slider bound to one value, as in the Tuning dialog. */
export function NumberInputSliderDemo() {
  const [value, setValue] = useState(0);
  const labelId = useId();
  return (
    // gap-6 as in the Tuning dialog: the slider's value bubble overhangs its top edge.
    <div className="flex w-full max-w-120 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <span id={labelId} className="text-body-lg font-semibold text-primary">
          Max Tokens
        </span>
        <NumberInput
          value={value}
          onValueChange={setValue}
          min={0}
          max={MAX_TOKENS}
          aria-labelledby={labelId}
        />
      </div>
      <Slider
        value={value}
        onValueChange={setValue}
        max={MAX_TOKENS}
        aria-label="Max tokens"
        minLabel="0"
        maxLabel={MAX_TOKENS.toLocaleString("en-US")}
      />
    </div>
  );
}

/** Bare auto-growing textarea on a composer-like surface, and the bordered field. */
export function TextareaDemo() {
  return (
    <div className="flex w-full max-w-120 flex-col gap-3">
      <div className="rounded-composer border border-composer bg-composer p-4 focus-within:border-pill">
        <Textarea
          aria-label="Message"
          placeholder="Ask Anything...."
          rows={2}
          className="max-h-36 min-h-10.5 text-body leading-5"
        />
      </div>
      <TextareaField
        aria-label="System prompt"
        bordered="input"
        className="h-26 px-4 py-2"
        placeholder="Enter the system prompt or select a quick option to auto-fill"
      />
    </div>
  );
}

const demoModelGroups: SelectGroup[] = [
  {
    label: "Reasoning",
    options: [
      { value: "deepseek-v3.1", label: "DeepSeek-V3.1" },
      { value: "gpt-oss-120b", label: "gpt-oss-120b" },
    ],
  },
  { label: "Text", options: [{ value: "minimax-m2.7", label: "MiniMax-M2.7" }] },
];

const demoNames: Record<string, string> = {
  "deepseek-v3.1": "DeepSeek V3.1",
  "gpt-oss-120b": "gpt-oss-120b",
  "minimax-m2.7": "MiniMax M2.7",
};

/** OptionMenu on both surfaces: composer model menu (flat) and compare column select (bordered). */
export function OptionMenuDemo() {
  const [flat, setFlat] = useState<string | null>(null);
  const [bordered, setBordered] = useState<string | null>("minimax-m2.7");
  return (
    <div className="flex flex-wrap items-center gap-4">
      <OptionMenu
        aria-label="Model"
        surface="flat"
        value={flat}
        onValueChange={setFlat}
        groups={demoModelGroups}
        contentClassName="w-65.5"
        trigger={
          <button
            type="button"
            aria-label={flat ? `Model: ${demoNames[flat]}` : "Select model"}
            className="group inline-flex h-8 shrink-0 items-center gap-2 rounded-md py-1.5 pr-2 pl-3 text-body-lg leading-[normal] text-composer-model transition-colors duration-(--sn-duration-fast) hover:bg-hover-strong data-[state=open]:bg-hover-strong"
          >
            {flat ? demoNames[flat] : "Select Model"}
            <Icon
              name="chevron-down"
              size={20}
              className="transition-transform duration-(--sn-duration-fast) group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            />
          </button>
        }
      />
      <OptionMenu
        aria-label="Model B"
        surface="bordered"
        value={bordered}
        onValueChange={setBordered}
        groups={demoModelGroups}
        sideOffset={5}
        matchTriggerWidth
        trigger={
          <button
            type="button"
            className="flex h-9.25 w-65.5 max-w-full min-w-0 items-center gap-2.5 rounded-md border border-hairline bg-input px-4 text-left"
          >
            <span className="flex-1 truncate text-body text-primary">
              {bordered ? demoNames[bordered] : "Select model"}
            </span>
            <Icon name="chevron-down" size={16} strokeWidth={1.5} className="text-primary" />
          </button>
        }
      />
    </div>
  );
}

/** Surface tooltips (Playground icon buttons). This route sits outside AppShell, so it brings its own provider. */
export function TooltipSurfaceDemo() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-3">
        <Tooltip
          content="Start a new thread"
          side="bottom"
          align="end"
          sideOffset={12}
          variant="surface"
        >
          <IconButton icon="edit" size="chat" variant="subtle" aria-label="Start a new thread" />
        </Tooltip>
        <Tooltip content="Close compare view" side="bottom" sideOffset={6} variant="surface">
          <IconButton
            icon="close"
            size="chat"
            variant="subtle"
            iconStrokeWidth={1.25}
            aria-label="Close compare view"
          />
        </Tooltip>
        <Tooltip content="Inverse (app default)" side="bottom">
          <IconButton icon="refresh" aria-label="Inverse tooltip example" />
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/** DropdownMenu flat (header ⋮, 209px, no border) and compact (History item ⋮) surfaces. */
export function DropdownMenuSurfacesDemo() {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            icon="dots-vertical"
            size="md"
            variant="header"
            iconStrokeWidth={1.5}
            aria-label="More options"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent surface="flat" align="end" sideOffset={4} className="w-52.25">
          <DropdownMenuItem variant="flat">
            <Icon name="adjustments-horizontal" size={18} />
            Tuning Parameters
          </DropdownMenuItem>
          <DropdownMenuItem variant="flat">
            <Icon name="edit" size={18} />
            System Prompt
          </DropdownMenuItem>
          <DropdownMenuItem variant="flat">
            <Icon name="history" size={18} />
            View History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton icon="more-vertical" size="sm" variant="subtle" aria-label="More actions" />
        </DropdownMenuTrigger>
        <DropdownMenuContent surface="compact" align="end" sideOffset={4}>
          <DropdownMenuItem variant="compact">
            <Icon name="pencil" size={16} />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="compact">
            <Icon name="trash" size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Static sample for the chart demo: 12 days of tokens (millions) for two series. */
const sampleDays = [
  "Jun 25",
  "Jun 26",
  "Jun 27",
  "Jun 28",
  "Jun 29",
  "Jun 30",
  "Jul 1",
  "Jul 2",
  "Jul 3",
  "Jul 4",
  "Jul 5",
  "Jul 6",
];
const sampleInput = [2.3, 2.7, 3.1, 3.3, 2.9, 2.0, 1.2, 0.8, 0.5, 0.5, 1.0, 2.2];
const sampleOutput = [3.4, 4.4, 4.9, 5.4, 5.1, 4.2, 3.3, 2.3, 1.6, 1.4, 2.5, 5.0];
const sampleCategories = sampleDays.map((label) => ({ label, title: `${label}, 2026` }));
const formatSampleTokens = (value: number) => formatCompactNumber(value, 2);

/** The API key usage screens' own pieces: date range picker, back button, chips, icon buttons, rich tooltip and a line chart. */
export function UsageComponentsDemo() {
  const [today] = useState(() => startOfDay(new Date()));
  const [selection, setSelection] = useState<DateRangeSelection>({
    kind: "preset",
    preset: "last-30-days",
  });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton href="/dev/tokens" label="Back to the token catalog" />
          <DateRangePicker
            aria-label="Date range"
            today={today}
            selection={selection}
            onSelectionChange={setSelection}
            className="w-60.75"
          />
          <Badge variant="success" shape="capsule">
            Success
          </Badge>
          <Badge variant="error" shape="capsule">
            Error
          </Badge>
          <IconButton icon="eye" size="xs" variant="contrast" aria-label="View details" />
          <IconButton icon="close-thin" variant="subtle" aria-label="Close" />
          <CopyButton value="req_01J8H7K2QJ8XSZ9V3Y1T7E6R4" size="2xs" variant="contrast" />
          <CopyButton value="Copied text" size="code" variant="contrast" label="Copy text" />
          <Tooltip
            variant="rich"
            side="top"
            content="You will be able to use both the old and new key during this time."
          >
            <button type="button" className="text-secondary" aria-label="About the grace period">
              <Icon name="info-circle" size={18} />
            </button>
          </Tooltip>
        </div>
        <ChartCard
          title="Input & Output Tokens"
          legend={
            <ChartLegend
              items={[
                { label: "Input Tokens", tone: "input" },
                { label: "Output Tokens", tone: "output" },
              ]}
            />
          }
        >
          <LineChart
            label="Sample input and output tokens"
            variant="wide"
            insetStart={50}
            insetEnd={18}
            categories={sampleCategories}
            series={[
              {
                id: "input",
                label: "Input Tokens",
                tone: "input",
                values: sampleInput.map((v) => v * 1e6),
              },
              {
                id: "output",
                label: "Output Tokens",
                tone: "output",
                values: sampleOutput.map((v) => v * 1e6),
              },
            ]}
            formatTick={formatSampleTokens}
            formatValue={formatSampleTokens}
          />
        </ChartCard>
        <div className="grid gap-4">
          <ChartCard
            compact
            title="Cached Tokens"
            legend={
              <ChartLegend
                items={[{ label: "Last 30 days", tone: "cached" }]}
                labelTone="primary"
              />
            }
          >
            <LineChart
              label="Sample cached tokens"
              variant="compact"
              categories={sampleCategories}
              series={[
                {
                  id: "cached",
                  label: "Cached Tokens",
                  tone: "cached",
                  values: sampleInput.map((v) => v * 0.4e6),
                },
              ]}
              formatTick={formatSampleTokens}
              formatValue={formatSampleTokens}
            />
          </ChartCard>
          <ChartCard
            compact
            title="Prompt Input Tokens"
            legend={
              <ChartLegend
                items={[{ label: "Last 30 days", tone: "prompt" }]}
                labelTone="primary"
              />
            }
          >
            <LineChart
              label="Sample prompt input tokens"
              variant="compact"
              categories={sampleCategories}
              series={[
                {
                  id: "prompt",
                  label: "Prompt Input Tokens",
                  tone: "prompt",
                  values: sampleOutput.map((v) => v * 0.3e6),
                },
              ]}
              formatTick={formatSampleTokens}
              formatValue={formatSampleTokens}
            />
          </ChartCard>
        </div>
      </div>
    </TooltipProvider>
  );
}
