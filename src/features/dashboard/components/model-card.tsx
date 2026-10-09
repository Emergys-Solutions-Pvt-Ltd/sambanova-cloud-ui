import Link from "next/link";

import { ModelLogo } from "@/components/brand/model-logo";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon/icon";
import { Meter } from "@/components/ui/meter";
import { routes } from "@/config/routes";
import { type RecommendedModel } from "@/types/domain";

/** One recommended model: logo, blurb, ratings, context, price and a Playground shortcut. */
export function ModelCard({ model }: { model: RecommendedModel }) {
  return (
    <Card as="article" radius="xl" className="relative flex h-full flex-col gap-5 overflow-hidden">
      {/* Corner glow in the brand's color; blurred and mostly off-card, as in Figma. */}
      <span
        aria-hidden="true"
        style={{
          background: `var(--sn-model-glow-${model.glow})`,
          filter: "blur(var(--sn-blur-glow))",
        }}
        className="pointer-events-none absolute -top-21 left-[calc(100%+calc(var(--spacing)*21))] h-45 w-50.75"
      />

      <div className="relative flex flex-col gap-4">
        <ModelLogo brand={model.brand} name={model.name} size={44} />
        <div className="flex flex-col gap-4">
          <h3 className="text-heading-xs">{model.name}</h3>
          <p className="min-h-13.75 text-body-sm text-muted">{model.description}</p>
        </div>
      </div>

      <dl className="relative flex flex-col gap-0.5 border-t border-strong pt-4 text-overline text-muted uppercase">
        <div className="flex items-center justify-between gap-4">
          <dt>Reasoning</dt>
          <dd>
            <Meter label="Reasoning" value={model.reasoning} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Speed</dt>
          <dd>
            <Meter label="Speed" value={model.speed} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Context</dt>
          <dd className="font-semibold">{model.contextWindow}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Pricing</dt>
          <dd className="font-semibold">{model.priceLabel}</dd>
        </div>
      </dl>

      <Link
        href={`${routes.playground}?model=${encodeURIComponent(model.modelId)}`}
        className="relative mt-auto flex h-10 items-center justify-between rounded-md border border-button-outline px-3 text-body-sm font-medium text-button-outline-fg hover:bg-hover"
      >
        Explore in Playground
        <Icon name="arrow-narrow-right" size="md" />
      </Link>
    </Card>
  );
}
