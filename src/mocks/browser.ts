import { setupWorker, type SetupWorker } from "msw/browser";

import { getMockConfig, resetMockConfig, setMockConfig } from "./config";
import { handlers } from "./handlers";

const START_OPTIONS = { onUnhandledFrame: "bypass", quiet: true } as const;

let worker: SetupWorker | undefined;
let started: Promise<void> | undefined;
let restarting: Promise<void> | undefined;

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
  started ??= (async () => {
    worker = setupWorker(...handlers);
    await worker.start(START_OPTIONS);
    window.__mocks = { get: getMockConfig, set: setMockConfig, reset: resetMockConfig };
    console.warn("[mocks] MSW is serving API requests. Use window.__mocks to change scenario.");
  })();
  return started;
}

/**
 * The service worker remembers the pages it mocks for in memory only. When the browser stops
 * an idle worker (a tab left open for a few minutes is enough), the restarted worker has
 * forgotten this page and passes every request on to Next.js, which answers with its HTML 404.
 * Stopping and starting again repeats the handshake that registers the page. Concurrent
 * callers share one restart, and requests prepared meanwhile wait for it.
 */
export function restartMocking() {
  restarting ??= (async () => {
    await startMocking();
    await worker!.stop();
    await worker!.start(START_OPTIONS);
    console.warn("[mocks] The MSW worker had been stopped by the browser; mocking restarted.");
  })().finally(() => {
    restarting = undefined;
  });
  started = restarting;
  return restarting;
}
