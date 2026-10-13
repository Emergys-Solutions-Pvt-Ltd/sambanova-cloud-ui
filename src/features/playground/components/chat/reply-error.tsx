"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon/icon";
import { cn } from "@/lib/cn";
import { type ReplyError as ReplyErrorData } from "@/types/domain";

import { type ChatVariant } from "./markdown-content";

const cardClasses =
  "flex w-full flex-col gap-2.5 self-start rounded-lg rounded-bl-none bg-error-bg p-4";

const widthClasses = (variant: ChatVariant) =>
  variant === "single" ? "max-w-184.5" : "max-w-[93.3%]";

function CardTitle({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon name="alert-triangle" size={24} className="text-error" />
      <p className="text-heading-xs text-error">{children}</p>
    </div>
  );
}

/**
 * Insufficient-balance card in the reply slot (Figma: Insufficient Credits `1398:122448`).
 * "[Add Credits]" hands its own element to `onAddCredits` so the caller can restore focus.
 */
export function InsufficientCreditsCard({
  variant,
  onAddCredits,
}: {
  variant: ChatVariant;
  onAddCredits?: (opener: HTMLElement) => void;
}) {
  return (
    <div role="alert" className={cn(cardClasses, widthClasses(variant))}>
      <CardTitle>Insufficient Credits</CardTitle>
      <p className="text-body text-muted">
        You don&apos;t have enough credits to complete this request.{" "}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={(event) => onAddCredits?.(event.currentTarget)}
          className="rounded-xs font-bold text-link hover:text-link-hover"
        >
          [Add Credits]
        </button>{" "}
        to continue using this model.
      </p>
    </div>
  );
}

/**
 * Failed reply (Figma: error card `1398:122448`; generic errors reuse its shape). A 402
 * renders the Insufficient Credits card; anything else shows the message and "Try again".
 */
export function ReplyError({
  error,
  variant,
  retryDisabled,
  onRetry,
  onAddCredits,
}: {
  error: ReplyErrorData | undefined;
  variant: ChatVariant;
  retryDisabled?: boolean;
  onRetry?: () => void;
  onAddCredits?: (opener: HTMLElement) => void;
}) {
  if (error?.status === 402 || error?.code === "INSUFFICIENT_CREDITS") {
    return <InsufficientCreditsCard variant={variant} onAddCredits={onAddCredits} />;
  }

  return (
    <div role="alert" className={cn(cardClasses, widthClasses(variant))}>
      <CardTitle>Couldn’t generate a response</CardTitle>
      <p className="text-body text-muted">
        {error?.message || "Something went wrong while generating this response."}
      </p>
      {onRetry && (
        <div>
          <Button variant="secondary" size="sm" disabled={retryDisabled} onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
