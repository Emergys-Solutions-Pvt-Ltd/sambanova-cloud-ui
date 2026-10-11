"use client";

import { type ComponentPropsWithRef, type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { type ToastItem, type ToastVariant, useToastStore } from "@/stores/toast-store";

import { Icon, type IconName } from "./icon/icon";
import { IconButton } from "./icon-button";

/** Figma › Toast component: translucent tint of the status color, 1px status border, 8px radius. */
const variants: Record<ToastVariant, { box: string; icon: IconName }> = {
  success: {
    box: "border-toast-success-line bg-success-bg text-toast-success-fg",
    icon: "circle-check",
  },
  info: { box: "border-toast-info-line bg-info-bg text-toast-info-fg", icon: "exclamation-circle" },
  warning: {
    box: "border-toast-warning-line bg-warning-bg text-toast-warning-fg",
    icon: "alert-triangle",
  },
  danger: { box: "border-toast-error-line bg-error-bg text-toast-error-fg", icon: "alert-circle" },
};

export interface ToastProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  variant?: ToastVariant;
  children: ReactNode;
  /** Shows the close (X) button. */
  onClose?: () => void;
}

/** One notification. Use `toast.success(...)` to show one; this is the visual only. */
export function Toast({ variant = "success", children, onClose, className, ...rest }: ToastProps) {
  const { box, icon } = variants[variant];

  return (
    <div
      className={cn(
        "flex w-toast max-w-full items-center gap-3 rounded-md border p-3 backdrop-blur-toast",
        box,
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={18} className="shrink-0" />
      <p className="min-w-0 flex-1 text-label font-medium">{children}</p>
      {onClose && (
        <IconButton
          icon="close"
          size="sm"
          aria-label="Dismiss notification"
          onClick={onClose}
          className="-my-1 -mr-1 size-6 text-current hover:bg-transparent hover:text-current hover:opacity-70"
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
