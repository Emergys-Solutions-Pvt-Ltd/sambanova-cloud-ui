"use client";

import { type ComponentPropsWithRef, type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { type ToastItem, type ToastVariant, useToastStore } from "@/stores/toast-store";

import { Icon, type IconName } from "./icon/icon";
import { IconButton } from "./icon-button";

/**
 * Figma › Toast Component: an 8% tint of the status color, a 1px border and text in that same color,
 * 8px radius. Info reuses the Attention glyph turned upside down, like Figma does.
 */
const variants: Record<ToastVariant, { box: string; icon: IconName; iconClass?: string }> = {
  success: {
    box: "border-toast-success-line bg-toast-success-bg text-toast-success-fg",
    icon: "toast-success",
  },
  info: {
    box: "border-toast-info-line bg-toast-info-bg text-toast-info-fg",
    icon: "toast-attention",
    iconClass: "-scale-y-100",
  },
  warning: {
    box: "border-toast-warning-line bg-toast-warning-bg text-toast-warning-fg",
    icon: "toast-attention",
  },
  danger: {
    box: "border-toast-error-line bg-toast-error-bg text-toast-error-fg",
    icon: "toast-error",
  },
};

export interface ToastProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  variant?: ToastVariant;
  children: ReactNode;
  /** Shows the close (X) button. */
  onClose?: () => void;
}

/** One notification. Use `toast.success(...)` to show one; this is the visual only. */
export function Toast({ variant = "success", children, onClose, className, ...rest }: ToastProps) {
  const { box, icon, iconClass } = variants[variant];

  return (
    // Padding is 11px so that with the 1px border the content sits 12px inside the edge, as in Figma.
    <div
      className={cn(
        "flex w-toast max-w-full items-center gap-3 rounded-md border p-2.75 backdrop-blur-toast",
        box,
        className,
      )}
      {...rest}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Icon name={icon} size={18} className={iconClass} />
        <p className="min-w-0 flex-1 text-label leading-normal">{children}</p>
      </div>
      {onClose && (
        <IconButton
          icon="toast-close"
          variant="current"
          size="toast"
          aria-label="Dismiss notification"
          onClick={onClose}
        />
      )}
    </div>
  );
}

/** Shows one queued toast: slides down, waits `duration` (paused while hovered or focused), slides back up. */
function ToastEntry({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const [leaving, setLeaving] = useState(false);
  const paused = useRef(false);
  const remaining = useRef(item.duration);

  useEffect(() => {
    if (leaving) return;
    let last = performance.now();
    const tick = window.setInterval(() => {
      const now = performance.now();
      if (!paused.current) remaining.current -= now - last;
      last = now;
      if (remaining.current <= 0) setLeaving(true);
    }, 100);
    return () => window.clearInterval(tick);
  }, [leaving]);

  return (
    <div
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      onAnimationEnd={() => leaving && dismiss(item.id)}
      className={cn(
        "pointer-events-auto max-w-full",
        leaving ? "animate-toast-out" : "animate-toast-in motion-reduce:animate-none",
      )}
    >
      <Toast
        variant={item.variant}
        role={item.variant === "danger" ? "alert" : "status"}
        onClose={() => setLeaving(true)}
      >
        {item.message}
      </Toast>
    </div>
  );
}

/** Mount once near the root. Toasts stack at the top centre, 14px from the top edge (Figma). */
export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 top-(--sn-toast-offset-top) z-toast flex flex-col items-center gap-2"
    >
      {toasts.map((item) => (
        <ToastEntry key={item.id} item={item} />
      ))}
    </div>
  );
}
