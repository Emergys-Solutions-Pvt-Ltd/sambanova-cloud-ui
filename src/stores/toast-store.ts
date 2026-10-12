import { create } from "zustand";

export type ToastVariant = "success" | "info" | "warning" | "danger";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  /** Milliseconds on screen before it slides away. */
  duration: number;
}

export interface ToastOptions {
  variant?: ToastVariant;
  message: string;
  duration?: number;
}

/** The Figma prototype closes the toast after 1.5 seconds. */
export const DEFAULT_TOAST_DURATION_MS = 1500;

interface ToastState {
  toasts: ToastItem[];
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

/** Queue behind `<ToastViewport />`. Prefer the `toast` helpers below over reading the store. */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: ({ variant = "success", message, duration = DEFAULT_TOAST_DURATION_MS }) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, variant, message, duration }] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

/** Show a toast from anywhere (event handlers, mutation callbacks). */
export const toast = {
  show: (options: ToastOptions) => useToastStore.getState().show(options),
  success: (message: string, duration?: number) =>
    useToastStore.getState().show({ variant: "success", message, duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().show({ variant: "info", message, duration }),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().show({ variant: "warning", message, duration }),
  danger: (message: string, duration?: number) =>
    useToastStore.getState().show({ variant: "danger", message, duration }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
