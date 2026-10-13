import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";

export type IconButtonVariant =
  "ghost" | "outline" | "solid" | "surface" | "subtle" | "composer" | "send" | "header" | "bare";
export type IconButtonSize =
  | "sm"
  | "md"
  | "field"
  | "lg"
  | "carousel"
  | "chat"
  | "chat-lg"
  | "composer"
  | "send"
  | "code"
  | "reply";

/** Each variant owns its disabled colour, so `send` can stay on its fill at 40 % (Figma: empty composer). */
const variants: Record<IconButtonVariant, string> = {
  ghost: "text-secondary hover:bg-hover hover:text-primary disabled:text-disabled",
  outline:
    "border border-button-outline text-secondary hover:bg-button-secondary-hover hover:text-primary disabled:text-disabled",
  solid:
    "bg-button-primary text-button-primary-fg hover:bg-button-primary-hover disabled:text-disabled",
  /** Raised square beside form controls (Figma: copy button next to the Quickstart tabs). */
  surface:
    "border border-default bg-surface-raised text-primary hover:bg-hover disabled:text-disabled",
  /** Muted glyph with an input-coloured hover box (Figma: Playground 37px icon buttons, dialog close). */
  subtle:
    "text-muted hover:bg-input hover:text-content focus-visible:bg-input focus-visible:text-content disabled:text-disabled",
  /** Composer "+" and mic (Figma: Playground composer). */
  composer:
    "text-composer-icon hover:bg-hover-strong aria-disabled:hover:bg-hover-strong disabled:text-disabled",
  /** Composer send / stop: keeps its colours when disabled and fades to 40 %. */
  send: "bg-button-primary text-button-primary-fg hover:bg-button-primary-hover disabled:opacity-40 disabled:hover:bg-button-primary",
  /** Bordered translucent square (Figma: Playground header ⋮). */
  header:
    "border border-button-icon bg-button-icon text-button-ghost-fg hover:bg-button-secondary-hover data-[state=open]:bg-button-secondary-hover disabled:text-disabled",
  /** Glyph only (Figma: code-card and reply copy icons). */
  bare: "text-copy-icon hover:opacity-80",
};

const sizes: Record<IconButtonSize, { box: string; icon: number }> = {
  sm: { box: "size-8 rounded-sm", icon: 16 },
  md: { box: "size-9 rounded-sm", icon: 20 },
  /** Same height as a 38px form field. */
  field: { box: "size-9.5 rounded-sm", icon: 22 },
  lg: { box: "size-11 rounded-sm", icon: 20 },
  /** Carousel arrows (Figma: webinar card): 32px target, 22px arrow. */
  carousel: { box: "size-8 rounded-sm", icon: 22 },
  /** Playground 37px icon buttons (new thread, compare close). */
  chat: { box: "size-9.25 rounded-md", icon: 20 },
  /** Same box with a 24px glyph (History panel close). */
  "chat-lg": { box: "size-9.25 rounded-md", icon: 24 },
  /** Composer "+" and mic. */
  composer: { box: "size-8 rounded-md", icon: 20 },
  /** Composer send / stop: 40px circle. */
  send: { box: "size-10 rounded-full", icon: 22 },
  /** 18px glyph in a 24px box pulled back by 3px so the glyph keeps its Figma position. */
  code: { box: "size-6 rounded-xs -m-0.75", icon: 18 },
  /** 20px glyph with a 32px hit area pulled back by 6px. */
  reply: { box: "size-8 rounded-sm -m-1.5", icon: 20 },
};

export interface IconButtonProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  icon: IconName;
  /** Required: icon-only controls have no visible text. */
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Overrides the icon's stroke width (Figma draws some instances thinner, e.g. header ⋮ 1.5). */
  iconStrokeWidth?: number;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  type = "button",
  iconStrokeWidth,
  className,
  ...rest
}: IconButtonProps) {
  const { box, icon: iconSize } = sizes[size];
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        "transition-colors duration-(--sn-duration-fast) ease-standard disabled:cursor-not-allowed",
        box,
        variants[variant],
        className,
      )}
      {...rest}
    >
      <Icon
        name={icon}
        size={iconSize}
        // Icon spreads its props last, so an explicit `undefined` would erase the icon's own stroke.
        {...(iconStrokeWidth === undefined ? {} : { strokeWidth: iconStrokeWidth })}
      />
    </button>
  );
}
