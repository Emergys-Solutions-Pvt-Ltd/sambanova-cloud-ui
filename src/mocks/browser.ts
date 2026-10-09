import { setupWorker } from "msw/browser";

import { getMockConfig, resetMockConfig, setMockConfig } from "./config";
import { handlers } from "./handlers";

let started: Promise<void> | undefined;

declare global {
  interface Window {
    __mocks?: {
      get: typeof getMockConfig;
      set: typeof setMockConfig;
      reset: typeof resetMockConfig;
    };
  }
}

/** Starts the MSW service worker once; every caller awaits the same promise. */
export function startMocking() {
  started ??= setupWorker(...handlers)
    .start({
      onUnhandledFrame: "bypass",
      quiet: true,
    })
    .then(() => {
      window.__mocks = { get: getMockConfig, set: setMockConfig, reset: resetMockConfig };
      console.warn("[mocks] MSW is serving API requests. Use window.__mocks to change scenario.");
    });
  return started;
}
