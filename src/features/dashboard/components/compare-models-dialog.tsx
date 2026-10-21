"use client";

import Link from "next/link";
import { type ReactNode, useId, useMemo, useState } from "react";

import { ModelLogo } from "@/components/brand/model-logo";
import { Badge } from "@/components/ui/badge";
import { Combobox, type ComboboxGroup } from "@/components/ui/combobox";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon/icon";
import { RatingIcons } from "@/components/ui/rating-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
import { formatMonthYear, formatTokenCount, formatUsd } from "@/lib/format";
import { type CatalogModel } from "@/types/domain";

import { useModelCatalog } from "../hooks/use-dashboard-data";

const mtok = (amount: number) => `${formatUsd(amount)} / MTok`;

const logo = (model: CatalogModel, size: number) => (
  <ModelLogo brand={model.brand} name={model.name} size={size} variant="plain" />
);

function PriceRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={emphasis ? "text-body-lg" : "text-body"}>{label}</dt>
      <dd className={emphasis ? "text-body-lg font-semibold" : "text-body font-semibold"}>
        {value}
      </dd>
    </div>
  );
}

function FeatureRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12.5 items-center justify-between gap-4 border-b border-panel-line last:border-b-0">
      <dt className="text-body-lg">{label}</dt>
      <dd className="flex items-center text-body-lg font-semibold">{children}</dd>
    </div>
  );
}

function Supported({ value, label }: { value: boolean; label: string }) {
  return value ? (
    <>
      <Icon name="check" size="md" className="text-success" aria-hidden="true" />
      <span className="sr-only">{label}: yes</span>
    </>
  ) : (
    <>
      <span aria-hidden="true" className="text-secondary">
        —
      </span>
      <span className="sr-only">{label}: no</span>
    </>
  );
}

type ComparePanelKind = "cost" | "feature";

function ComparePanel({
  kind,
  label,
  model,
  groups,
  onChange,
}: {
  kind: ComparePanelKind;
  label: string;
  model: CatalogModel;
  groups: ComboboxGroup[];
  onChange: (id: string) => void;
}) {
  const { pricing, features } = model;

  return (
    <section
      aria-label={label}
      className="flex flex-col gap-4 rounded-lg border border-panel bg-input p-5"
    >
      <Combobox
        aria-label={`${label} selection`}
        value={model.id}
        onValueChange={onChange}
        groups={groups}
      />
      <p className="min-h-10.5 text-body text-secondary">{model.description}</p>

      {kind === "cost" ? (
        <>
          <dl className="flex flex-col gap-2 border-t border-panel-line pt-4">
            <PriceRow emphasis label="Input" value={mtok(pricing.input)} />
            <PriceRow emphasis label="Output" value={mtok(pricing.output)} />
          </dl>

          <div className="flex flex-col gap-2 border-t border-panel-line pt-4">
            <h4 className="text-body-lg text-muted">Prompt Caching</h4>
            <dl className="flex flex-col gap-1">
              <PriceRow label="Write" value={mtok(pricing.promptCaching.write)} />
              <PriceRow label="Read" value={mtok(pricing.promptCaching.read)} />
            </dl>
          </div>

          <div className="flex flex-col gap-2 border-t border-panel-line pt-4">
            <h4 className="text-body-lg text-muted">Fast Mode</h4>
            <dl className="flex flex-col gap-1">
              <PriceRow label="Input" value={mtok(pricing.fastMode.input)} />
              <PriceRow label="Output" value={mtok(pricing.fastMode.output)} />
            </dl>
          </div>

          {pricing.badge && (
            <Badge variant="info" shape="capsule" size="lg" className="w-fit">
              {pricing.badge}
            </Badge>
          )}
        </>
      ) : (
        <dl className="flex flex-col border-t border-panel-line">
          <FeatureRow label="Context Window">{formatTokenCount(features.contextWindow)}</FeatureRow>
          <FeatureRow label="Max Output">{formatTokenCount(features.maxOutput)}</FeatureRow>
          <FeatureRow label="Reasoning">
            <RatingIcons kind="bulb" value={features.reasoning} label="Reasoning" />
          </FeatureRow>
          <FeatureRow label="Speed">
            <RatingIcons kind="bolt" value={features.speed} label="Speed" />
          </FeatureRow>
          <FeatureRow label="Fast Mode">
            <Supported value={features.fastMode} label="Fast Mode" />
          </FeatureRow>
          <FeatureRow label="Adaptive Thinking">
            <Supported value={features.adaptiveThinking} label="Adaptive Thinking" />
          </FeatureRow>
          <FeatureRow label="Knowledge cutoff">
            {formatMonthYear(features.knowledgeCutoff)}
          </FeatureRow>
        </dl>
      )}
    </section>
  );
}

type ModelPair = [string, string];

function Comparison({
  kind,
  ids,
  setIds,
}: {
  kind: ComparePanelKind;
  ids: ModelPair;
  setIds: (ids: ModelPair) => void;
}) {
  const { data: models, error, refetch } = useModelCatalog();

  const groups = useMemo<ComboboxGroup[]>(() => {
    const options = (list: CatalogModel[]) =>
      list.map((model) => ({
        value: model.id,
        label: model.name,
        leading: logo(model, 20),
        triggerLeading: logo(model, 24),
      }));
    const all = models ?? [];
    return [
      { label: "Popular Models", options: options(all.filter((model) => model.popular)) },
      { label: "All Models", options: options(all.filter((model) => !model.popular)) },
    ].filter((group) => group.options.length > 0);
  }, [models]);

  if (error) {
    return <ErrorState message="Couldn’t load models." onRetry={() => void refetch()} />;
  }
  if (!models) {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const pick = (id: string) => models.find((model) => model.id === id) ?? models[0]!;
  const [left, right] = [pick(ids[0]), pick(ids[1])];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ComparePanel
        kind={kind}
        label="First model"
        model={left}
        groups={groups}
        onChange={(id) => setIds([id, ids[1]])}
      />
      <ComparePanel
        kind={kind}
        label="Second model"
        model={right}
        groups={groups}
        onChange={(id) => setIds([ids[0], id])}
      />
    </div>
  );
}

interface CompareModelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Side-by-side model comparison: Cost and Feature tabs share the same searchable model pickers. */
export function CompareModelsDialog({ open, onOpenChange }: CompareModelsDialogProps) {
  const tabsId = useId();
  // Shared so both tabs keep the same two models when switching.
  const [ids, setIds] = useState<ModelPair>(["deepseek-v3.1", "minimax-m2.7"]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Compare Models" size="lg" tightBody>
        <Tabs defaultValue="cost" className="flex flex-col gap-5" id={tabsId}>
          <TabsList aria-label="Comparison type" className="w-fit">
            <TabsTrigger value="cost">Cost</TabsTrigger>
            <TabsTrigger value="feature">Feature</TabsTrigger>
          </TabsList>

          <TabsContent value="cost" className="flex flex-col gap-4">
            <Comparison kind="cost" ids={ids} setIds={setIds} />
            <Footnote />
          </TabsContent>

          <TabsContent value="feature" className="flex flex-col gap-4">
            <Comparison kind="feature" ids={ids} setIds={setIds} />
            <Footnote />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Footnote() {
  return (
    <p className="text-body-sm text-secondary">
      Standard list prices.{" "}
      <DialogClose asChild>
        <Link
          href={routes.pricing}
          className="font-medium text-primary underline underline-offset-2"
        >
          View full pricing.
        </Link>
      </DialogClose>
    </p>
  );
}
