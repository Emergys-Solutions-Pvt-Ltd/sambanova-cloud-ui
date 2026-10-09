"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { ModelLogo } from "@/components/brand/model-logo";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Select, type SelectGroup } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
import { formatUsd } from "@/lib/format";
import { type CatalogModel } from "@/types/domain";

import { useModelCatalog } from "../hooks/use-dashboard-data";

const mtok = (amount: number) => `${formatUsd(amount)} / MTok`;

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

function ComparePanel({
  label,
  model,
  groups,
  onChange,
}: {
  label: string;
  model: CatalogModel;
  groups: SelectGroup[];
  onChange: (id: string) => void;
}) {
  const { pricing } = model;

  return (
    <section
      aria-label={label}
      className="flex flex-col gap-4 rounded-lg border border-default bg-surface-raised p-5"
    >
      <Select
        aria-label={`${label} model`}
        value={model.id}
        onValueChange={onChange}
        groups={groups}
        icon={<ModelLogo brand={model.brand} name={model.name} size={20} />}
        contentClassName="min-w-72"
      />
      <p className="min-h-10.5 text-body text-secondary">{model.description}</p>

      <dl className="flex flex-col gap-2 border-t border-strong pt-4">
        <PriceRow emphasis label="Input" value={mtok(pricing.input)} />
        <PriceRow emphasis label="Output" value={mtok(pricing.output)} />
      </dl>

      <div className="flex flex-col gap-2 border-t border-strong pt-4">
        <h4 className="text-body-lg text-muted">Prompt Caching</h4>
        <dl className="flex flex-col gap-1">
          <PriceRow label="Write" value={mtok(pricing.promptCaching.write)} />
          <PriceRow label="Read" value={mtok(pricing.promptCaching.read)} />
        </dl>
      </div>

      <div className="flex flex-col gap-2 border-t border-strong pt-4">
        <h4 className="text-body-lg text-muted">Fast Mode</h4>
        <dl className="flex flex-col gap-1">
          <PriceRow label="Input" value={mtok(pricing.fastMode.input)} />
          <PriceRow label="Output" value={mtok(pricing.fastMode.output)} />
        </dl>
      </div>

      {pricing.badge && (
        <Badge variant="info" size="md" className="w-fit">
          {pricing.badge}
        </Badge>
      )}
    </section>
  );
}

function CostComparison() {
  const { data: models, error, refetch } = useModelCatalog();
  const [ids, setIds] = useState<[string, string]>(["deepseek-v3.1", "minimax-m2.7"]);

  const groups = useMemo<SelectGroup[]>(
    () => [
      {
        options: (models ?? []).map((model) => ({
          value: model.id,
          label: model.name,
          leading: <ModelLogo brand={model.brand} name={model.name} size={20} />,
        })),
      },
    ],
    [models],
  );

  if (error) {
    return <ErrorState message="Couldn’t load model pricing." onRetry={() => void refetch()} />;
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
        label="First model"
        model={left}
        groups={groups}
        onChange={(id) => setIds([id, ids[1]])}
      />
      <ComparePanel
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

/** Side-by-side model comparison. Cost tab is complete; Feature tab is a placeholder (not in Figma). */
export function CompareModelsDialog({ open, onOpenChange }: CompareModelsDialogProps) {
  const tabsId = useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Compare Models" size="lg">
        <Tabs defaultValue="cost" className="flex flex-col gap-5" id={tabsId}>
          <TabsList aria-label="Comparison type" className="w-fit">
            <TabsTrigger value="cost">Cost</TabsTrigger>
            <TabsTrigger value="feature">Feature</TabsTrigger>
          </TabsList>

          <TabsContent value="cost" className="flex flex-col gap-4">
            <CostComparison />
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
          </TabsContent>

          <TabsContent value="feature">
            <p className="rounded-lg border border-dashed border-default p-8 text-center text-body text-muted">
              Feature comparison is coming soon.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
