import Link from "next/link";
import { type ComponentPropsWithRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon/icon";
import { MarqueeArrow } from "./marquee-arrow";

/**
 * Variants follow Figma › Components › Buttons (Active / Hover / Disable):
 *   primary      white on dark, brand purple on light
 *   secondary    outlined, subtle fill
 *   tertiary     text only ("Refresh")
 *   link         underlined text
 *   cancel       outlined in muted text
 *   destructive  red fill
 *   control      form-control look used by the project selector and "Sign Up for Free"
 *   glass        translucent pill used on the hero banner
 *   outline      strong outline (white on dark, purple on light), e.g. "Compare Models"
 *   brand        brand-purple fill; form submit in the auth dialog (40% opacity when disabled)
 *   ghost        text button with a hover fill (Figma: Playground header "Compare Models")
 *   cta          high-contrast fill (Figma: Playground header "Code")
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "link"
  | "cancel"
  | "destructive"
  | "control"
  | "glass"
  | "outline"
  | "brand"
  | "ghost"
  | "cta";
export type ButtonSize = "md" | "sm";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none " +
  "transition-colors duration-(--sn-duration-fast) ease-standard " +
  "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "rounded-sm bg-button-primary font-semibold text-button-primary-fg hover:bg-button-primary-hover " +
    "disabled:bg-button-primary-disabled disabled:text-button-primary-disabled-fg " +
    "aria-disabled:bg-button-primary-disabled aria-disabled:text-button-primary-disabled-fg",
  secondary:
    "rounded-sm border border-button-secondary-border bg-button-secondary font-medium text-button-secondary-fg " +
    "hover:bg-button-secondary-hover " +
    "disabled:border-disabled disabled:bg-transparent disabled:text-button-disabled-fg " +
    "aria-disabled:border-disabled aria-disabled:bg-transparent aria-disabled:text-button-disabled-fg",
  tertiary:
    "rounded-xs font-medium text-button-tertiary-fg hover:text-primary disabled:text-button-disabled-fg aria-disabled:text-button-disabled-fg",
  link:
    "rounded-xs text-body-sm font-bold text-link underline underline-offset-4 hover:text-button-link-hover " +
    "disabled:text-button-link-disabled-fg aria-disabled:text-button-link-disabled-fg",
  cancel:
    "rounded-sm border border-current font-semibold text-muted hover:bg-hover " +
    "disabled:border-disabled disabled:text-button-cancel-disabled-fg aria-disabled:border-disabled aria-disabled:text-button-cancel-disabled-fg",
  destructive:
    "rounded-sm bg-button-destructive font-medium text-button-destructive-fg hover:bg-button-destructive-hover " +
    "disabled:bg-button-destructive-disabled disabled:text-button-destructive-disabled-fg " +
    "aria-disabled:bg-button-destructive-disabled aria-disabled:text-button-destructive-disabled-fg",
  glass:
    "h-9 rounded-full border border-brand-subtle-border bg-brand-subtle px-3 text-caption font-semibold " +
    "text-button-glass-fg hover:bg-hover",
  outline:
    "rounded-sm border border-button-outline-strong font-semibold text-button-outline-fg hover:bg-hover " +
    "disabled:border-disabled disabled:text-disabled aria-disabled:border-disabled aria-disabled:text-disabled",
  brand:
    "rounded-sm bg-brand font-semibold text-on-brand hover:bg-brand-hover " +
    "disabled:opacity-40 aria-disabled:opacity-40",
  control:
    "rounded-sm border border-control bg-button-secondary font-medium text-primary " +
    "hover:bg-button-secondary-hover disabled:text-disabled aria-disabled:text-disabled",
  /** Padding lives here (8 / 8 / 12 left), so `sizeClasses` adds only the text size. */
  ghost:
    "rounded-xs py-2 pr-2 pl-3 font-medium text-button-ghost-fg hover:bg-hover aria-pressed:bg-transparent",
  cta: "rounded-sm bg-button-cta font-semibold text-button-cta-fg hover:bg-button-cta-hover",
};

/** Heights: md = 37px (Figma buttons), sm = 34px (project selector, sign-up card). */
const sizes: Record<ButtonSize, string> = {
  md: "px-3 py-2 text-body",
  sm: "h-8.5 px-3 text-caption",
};

const bareSizes = "px-2 py-2 text-body";

/**
 * Figma draws the 1px border of these variants inside the padding (Secondary and Cancel are 37px high
 * with padding 12 / 8), so the md padding is 1px smaller here to keep the border from adding 2px.
 */
const borderedVariants: ReadonlySet<ButtonVariant> = new Set([
  "secondary",
  "cancel",
  "outline",
  "control",
]);
const borderedMdSize = "px-2.75 py-1.75 text-body";

/** Link and glass carry their own sizing; ghost only its text size; tertiary is compact; the rest follow `size`. */
function sizeClasses(variant: ButtonVariant, size: ButtonSize) {
  if (variant === "link" || variant === "glass") return "";
  if (variant === "ghost") return "text-body";
  if (variant === "tertiary") return bareSizes;
  if (size === "md" && borderedVariants.has(variant)) return borderedMdSize;
  return sizes[size];
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  /**
   * "marquee" (Figma: hero banner buttons) slides `rightIcon` through a clipped 20px box when the
   * button is hovered. The box overhangs by 2px on each side, so the button keeps its size.
   */
  rightIconMotion?: "marquee";
  /** Pixel size of `leftIcon` / `rightIcon`. Default 16. */
  iconSize?: number;
  fullWidth?: boolean;
  /** Corner radius: "sm" = 6px (default), "md" = 8px (some Figma buttons, e.g. View Documentation). */
  radius?: "sm" | "md";
  /** Shows a spinner, keeps the width and blocks clicks. */
  loading?: boolean;
  children?: ReactNode;
}

type NativeButtonProps = CommonProps &
  Omit<ComponentPropsWithRef<"button">, keyof CommonProps> & { href?: undefined };

type LinkButtonProps = CommonProps &
  Omit<ComponentPropsWithRef<"a">, keyof CommonProps | "href"> & {
    href: string;
    /** Opens in a new tab with rel="noopener noreferrer" and shows no router prefetch. */
    external?: boolean;
    disabled?: boolean;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    rightIconMotion,
    iconSize = 16,
    fullWidth,
    radius = "sm",
    loading,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    base,
    radius === "md" ? variants[variant].replace("rounded-sm", "rounded-md") : variants[variant],
    sizeClasses(variant, size),
    fullWidth && "w-full",
    rightIconMotion === "marquee" && "group/button",
    className,
  );

  const content = (
    <>
      {loading ? <Spinner /> : leftIcon && <Icon name={leftIcon} size={iconSize} />}
      {children}
      {!loading &&
        rightIcon &&
        (rightIconMotion === "marquee" ? (
          <MarqueeArrow trigger="button" icon={rightIcon} className="-m-0.5" />
        ) : (
          <Icon name={rightIcon} size={iconSize} />
        ))}
    </>
  );

  if (typeof (rest as LinkButtonProps).href === "string") {
    const { href, external, disabled, ...anchor } = rest as LinkButtonProps;
    const blocked = disabled || loading;
    const common = {
      ...anchor,
      className: classes,
      "aria-disabled": blocked || undefined,
      tabIndex: blocked ? -1 : anchor.tabIndex,
    };
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...common}>
        {content}
      </a>
    ) : (
      <Link href={href} {...common}>
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, ...button } = rest as NativeButtonProps;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...button}
    >
      {content}
    </button>
  );
}
