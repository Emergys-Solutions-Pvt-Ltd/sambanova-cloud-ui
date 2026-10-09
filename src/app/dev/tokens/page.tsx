import type { Metadata } from "next";
import Image from "next/image";
import { type ReactNode } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { IconButton } from "@/components/ui/icon-button";
import { RatingIcons } from "@/components/ui/rating-icons";
import { Meter } from "@/components/ui/meter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emptyStates, illustrations } from "@/config/assets";

import {
  breakpoints,
  fontWeights,
  gradients,
  guessedTokens,
  motion,
  primitiveScales,
  radii,
  semanticGroups,
  shadows,
  spacingSteps,
  typeScale,
  zLayers,
} from "./token-catalog";
import {
  ComboboxDemo,
  CssValue,
  IconGallery,
  SelectDemo,
  Swatch,
  ThemeSwitch,
} from "./token-preview-client";

export const metadata: Metadata = { title: "Design tokens" };

const buttonVariants: ButtonVariant[] = [
  "primary",
  "secondary",
  "tertiary",
  "link",
  "cancel",
  "destructive",
  "control",
];
const badgeVariants: BadgeVariant[] = ["success", "error", "warning", "info", "neutral", "brand"];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 border-t border-default pt-8">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-heading-sm">
          {title}
        </h2>
        {description && <p className="max-w-3xl text-body-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Renders the same content in a dark and a light panel, side by side. */
function ThemePair({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {(["dark", "light"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          className="flex min-w-0 flex-col gap-4 rounded-lg border border-default bg-canvas p-4 text-primary"
        >
          <p className="text-overline text-muted uppercase">{theme}</p>
          {children}
        </div>
      ))}
    </div>
  );
}

export default function TokensPage() {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-overline text-muted uppercase">Development only</p>
          <h1 className="text-heading-lg">Design tokens</h1>
          <p className="max-w-3xl text-body-sm text-muted">
            Every token from <code>src/styles/tokens.css</code>, resolved live. Panels below render
            both themes side by side; the switch changes the app theme (persisted, no flash on
            reload). Click a swatch to copy its variable.
          </p>
        </div>
        <ThemeSwitch />
      </header>

      <Section
        id="semantic"
        title="Semantic colors"
        description="What components use. Tailwind exposes these as bg-*, text-*, border-* and shared color utilities. GUESS marks values not present in Figma for at least one theme."
      >
        <ThemePair>
          {Object.entries(semanticGroups).map(([group, tokens]) => (
            <div key={group} className="flex flex-col gap-1">
              <h3 className="text-label text-secondary">{group}</h3>
              <div className="grid gap-1 sm:grid-cols-2">
                {tokens.map((token) => (
                  <Swatch
                    key={token}
                    variable={`--sn-${token}`}
                    label={token}
                    guessed={guessedTokens.has(token)}
                  />
                ))}
              </div>
            </div>
          ))}
        </ThemePair>
      </Section>

      <Section
        id="primitives"
        title="Primitive palette"
        description="Raw values. Never used directly by components; semantic tokens point at these. Purple and amber come from the Figma variable collection."
      >
        <div className="flex flex-col gap-4">
          {Object.entries(primitiveScales).map(([scale, steps]) => (
            <div key={scale} className="flex flex-col gap-1">
              <h3 className="text-label text-secondary capitalize">{scale}</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-1">
                {steps.map((step) => (
                  <Swatch
                    key={step}
                    variable={`--sn-${scale}-${step}`}
                    label={`${scale}-${step}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="gradients"
        title="Gradients"
        description="Hero banner, promo card, badge and Playground background."
      >
        <ThemePair>
          <div className="grid gap-3 sm:grid-cols-2">
            {gradients.map((name) => (
              <div key={name} className="flex flex-col gap-1">
                <div
                  className="h-20 rounded-md border border-default"
                  style={{ background: `var(--sn-gradient-${name})` }}
                />
                <span className="text-caption">gradient-{name}</span>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <p
                className="text-heading-xl font-semibold tracking-wide"
                style={{
                  backgroundImage: "var(--sn-gradient-hero-accent)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Sambanova.
              </p>
              <span className="text-caption">hero-accent as text</span>
            </div>
          </div>
        </ThemePair>
      </Section>

      <Section
        id="typography"
        title="Typography"
        description="Lato 2.0 (self-hosted: Regular 400, Medium 500, Semibold 600, Bold 700). Each text-* utility sets size, line height, default weight and tracking."
      >
        <div className="flex flex-col divide-y divide-subtle rounded-lg border border-default">
          {typeScale.map(({ token, className, sample }) => (
            <div key={token} className="grid gap-2 p-4 md:grid-cols-[12rem_1fr] md:items-baseline">
              <code className="text-caption text-muted">text-{token}</code>
              <p className={`${className} min-w-0 break-words`}>{sample}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6">
          {fontWeights.map((weight) => (
            <p key={weight.name} className={`text-heading-sm ${weight.className}`}>
              {weight.name}
            </p>
          ))}
        </div>
      </Section>

      <Section
        id="spacing"
        title="Spacing"
        description="4px grid (--spacing: 0.25rem). Utilities: p-4 = 16px, gap-2.5 = 10px, and so on."
      >
        <div className="flex flex-col gap-2">
          {spacingSteps.map((step) => (
            <div key={step} className="flex items-center gap-4">
              <code className="w-16 text-caption text-muted">{step}</code>
              <div
                className="h-3 rounded-xs bg-brand"
                style={{ width: `calc(var(--spacing) * ${step})` }}
              />
              <span className="text-caption text-muted">{step * 4}px</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="shape" title="Radius, borders and elevation">
        <ThemePair>
          <div className="flex flex-wrap gap-4">
            {radii.map((radius) => (
              <div key={radius.name} className="flex flex-col items-center gap-1">
                <div
                  className={`size-16 border border-strong bg-surface-raised ${radius.className}`}
                />
                <span className="text-caption">{radius.className}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6">
            {shadows.map((shadow) => (
              <div key={shadow.name} className="flex flex-col items-center gap-2">
                <div
                  className={`size-20 rounded-lg border border-subtle bg-surface ${shadow.className}`}
                />
                <span className="text-caption">{shadow.className}</span>
              </div>
            ))}
          </div>
        </ThemePair>
      </Section>

      <Section
        id="icons"
        title="Icons"
        description="58 icons exported from Figma, optimised with SVGO (npm run icons). <Icon name size color /> inherits currentColor."
      >
        <ThemePair>
          <IconGallery />
        </ThemePair>
      </Section>

      <Section
        id="illustrations"
        title="Illustrations"
        description="WebP at 2x in public/illustrations, mapped in src/config/assets.ts."
      >
        <ThemePair>
          <ThemedIllustrations />
        </ThemePair>
        <div className="flex flex-wrap gap-6">
          {Object.entries(emptyStates).map(([name, image]) => (
            <figure key={name} className="flex flex-col gap-2">
              <Image src={image.src} alt="" width={image.width} height={image.height} />
              <figcaption className="text-caption text-muted">{name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section
        id="primitives-ui"
        title="UI primitives"
        description="Components built for the app shell and dashboard. Button variants and states follow Figma › Components › Buttons (default, hover, disabled); hover them to see the hover state."
      >
        <ThemePair>
          <div className="flex flex-col gap-4">
            {buttonVariants.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-3">
                <span className="w-24 text-caption text-muted">{variant}</span>
                <Button variant={variant}>Button</Button>
                <Button variant={variant} leftIcon="plus">
                  With icon
                </Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
                <Button variant={variant} loading>
                  Loading
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-caption text-muted">icon buttons</span>
              <IconButton icon="refresh" aria-label="Refresh" />
              <IconButton icon="edit" aria-label="Edit" variant="outline" />
              <IconButton icon="plus" aria-label="Add" variant="solid" />
              <IconButton icon="close" aria-label="Close" disabled />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-caption text-muted">badges</span>
              {badgeVariants.map((variant) => (
                <Badge key={variant} variant={variant} size="md">
                  {variant}
                </Badge>
              ))}
              <Badge variant="success" size="sm">
                $20
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-caption text-muted">avatars</span>
              <Avatar name="John Michaels" size="xs" />
              <Avatar name="John Michaels" size="sm" />
              <Avatar name="John Michaels" size="md" />
              <Avatar name="John Michaels" size="lg" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-caption text-muted">tabs</span>
              <Tabs defaultValue="curl">
                <TabsList aria-label="Example tabs">
                  <TabsTrigger value="curl">Curl</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="gradio">Gradio</TabsTrigger>
                </TabsList>
              </Tabs>
              <CopyButton
                value="curl example"
                label="Copy example"
                variant="surface"
                size="field"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-caption text-muted">select</span>
              <SelectDemo />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-caption text-muted">combobox</span>
              <ComboboxDemo />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <span className="w-24 text-caption text-muted">rating</span>
              <RatingIcons kind="bulb" value={4} label="Reasoning" />
              <RatingIcons kind="bolt" value={3} label="Speed" />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <span className="w-24 text-caption text-muted">meter</span>
              {[1, 3, 5].map((value) => (
                <Meter key={value} label={`Rating ${value}`} value={value} />
              ))}
            </div>
            <CodeBlock
              label="Code sample"
              lines={[
                [
                  { text: "curl -H " },
                  { text: '"Authorization: Bearer $API_KEY"', kind: "string" },
                ],
                [{ text: '"model": ' }, { text: '"DeepSeek-V3.1",', kind: "value" }],
              ]}
            />
          </div>
        </ThemePair>
      </Section>

      <Section
        id="system"
        title="Layers, motion and breakpoints"
        description="Not specified in Figma; conventional values, used by the shell in Work Area D."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-caption">
            {zLayers.map((layer) => (
              <div key={layer} className="contents">
                <dt className="text-secondary">z-{layer}</dt>
                <dd>
                  <CssValue name={`--sn-z-${layer}`} />
                </dd>
              </div>
            ))}
          </dl>
          <dl className="grid grid-cols-[1fr_auto] content-start gap-x-4 gap-y-1 text-caption">
            {motion.map((token) => (
              <div key={token} className="contents">
                <dt className="text-secondary">{token}</dt>
                <dd>
                  <CssValue name={`--sn-${token}`} />
                </dd>
              </div>
            ))}
            <div className="contents">
              <dt className="text-secondary">ease-standard</dt>
              <dd>
                <CssValue name="--sn-ease-standard" />
              </dd>
            </div>
          </dl>
          <ul className="flex flex-col gap-2 text-caption">
            {breakpoints.map((bp) => (
              <li key={bp.name} className="flex flex-col">
                <span className="text-secondary">
                  {bp.name} <span className="text-muted">{bp.range}</span>
                </span>
                <span className="text-muted">{bp.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}

function ThemedIllustrations() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {Object.entries(illustrations).map(([name, image]) => (
        <figure key={name} className="flex flex-col gap-2">
          {/* Each panel shows its own theme's variant via the show-in-* helpers. */}
          <Image
            src={image.dark}
            alt=""
            width={image.width}
            height={image.height}
            className="show-in-dark"
          />
          <Image
            src={image.light}
            alt=""
            width={image.width}
            height={image.height}
            className="show-in-light"
          />
          <figcaption className="text-caption text-muted">{name}</figcaption>
        </figure>
      ))}
    </div>
  );
}
