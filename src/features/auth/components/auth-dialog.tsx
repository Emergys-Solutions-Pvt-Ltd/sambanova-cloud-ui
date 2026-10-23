"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { Wordmark } from "@/components/layout/wordmark";
import { Dialog, DialogClose, DialogPanel, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { brand } from "@/config/assets";
import { RETURN_TO_PARAM } from "@/config/auth";
import { routes } from "@/config/routes";
import { safeReturnTo } from "@/lib/safe-redirect";
import { type AuthMode, useAuthDialogStore } from "@/stores/auth-dialog-store";
import { selectSessionStatus, useSessionStore } from "@/stores/session-store";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { SocialButtons } from "./social-buttons";

const copy = {
  login: {
    title: "Login to SambaNova to continue to SambaNova Cloud",
    prompt: "Don’t have an account?",
    switchLabel: "Sign Up",
  },
  signup: {
    title: "Sign up to continue to SambaNova Cloud",
    prompt: "Already have an account?",
    switchLabel: "Login",
  },
} as const;

interface AuthDialogProps {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

/** Login / sign-up modal (Figma: Dashboard › login). The form below the title depends on the mode. */
function AuthDialog({ open, mode, onClose, onModeChange }: AuthDialogProps) {
  const text = copy[mode];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPanel size="sm" className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex h-11 items-center gap-3.5">
              <Image src={brand.mark.src} alt="" width={46} height={42} className="shrink-0" />
              <Wordmark aria-hidden="true" role={undefined} className="h-6 w-auto text-primary" />
            </div>
            <DialogClose asChild>
              <IconButton icon="close" size="md" aria-label="Close" />
            </DialogClose>
          </div>
          <DialogTitle className="text-body-lg font-normal">{text.title}</DialogTitle>
        </div>

        {/* Remounting per mode gives each form its own fresh state. */}
        {mode === "login" ? <LoginForm key="login" /> : <SignupForm key="signup" />}

        <div className="flex items-center gap-7 text-body-lg text-secondary" role="presentation">
          <span aria-hidden="true" className="bg-strong h-px flex-1" />
          or
          <span aria-hidden="true" className="bg-strong h-px flex-1" />
        </div>

        <div className="flex flex-col gap-6">
          <SocialButtons />
          <p className="text-center text-label text-secondary">
            {text.prompt}{" "}
            <button
              type="button"
              // Pressing here would blur the focused field, whose validation message pushes this link down
              // before the button is released, so the click is lost (SCRUM-96). Keep the focus where it is.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onModeChange(mode === "login" ? "signup" : "login")}
              className="rounded-xs font-medium text-accent hover:underline"
            >
              {text.switchLabel}
            </button>
          </p>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

function Host() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useSessionStore(selectSessionStatus);
  const storeOpen = useAuthDialogStore((state) => state.open);
  const storeMode = useAuthDialogStore((state) => state.mode);
  const setStoreMode = useAuthDialogStore((state) => state.setMode);
  const closeStore = useAuthDialogStore((state) => state.close);

  // /login and /signup show the dashboard with the dialog already open.
  const routeMode: AuthMode | null =
    pathname === routes.login ? "login" : pathname === routes.signup ? "signup" : null;
  const authenticated = status === "authenticated";
  const open = !authenticated && (storeOpen || (routeMode !== null && status === "guest"));
  const mode = routeMode ?? storeMode;

  // Signing in (from either form) finishes the flow: continue to where the user was going.
  useEffect(() => {
    if (!authenticated) return;

    if (routeMode) {
      router.replace(safeReturnTo(searchParams.get(RETURN_TO_PARAM)) ?? routes.dashboard);
      return;
    }

    const { open: wasOpen, returnTo, onSuccess, close } = useAuthDialogStore.getState();
    if (!wasOpen) return;
    close();
    if (returnTo) router.push(returnTo);
    onSuccess?.();
  }, [authenticated, routeMode, router, searchParams]);

  const close = () => {
    if (routeMode) router.replace(routes.dashboard);
    else closeStore();
  };

  const switchMode = (next: AuthMode) => {
    if (!routeMode) {
      setStoreMode(next);
      return;
    }
    const query = searchParams.toString();
    router.replace(`${next === "login" ? routes.login : routes.signup}${query ? `?${query}` : ""}`);
  };

  return <AuthDialog open={open} mode={mode} onClose={close} onModeChange={switchMode} />;
}

/** Mount once in the app shell. `useSearchParams` needs a Suspense boundary. */
export function AuthDialogHost() {
  return (
    <Suspense fallback={null}>
      <Host />
    </Suspense>
  );
}
