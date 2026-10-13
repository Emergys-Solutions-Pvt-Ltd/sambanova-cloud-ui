/**
 * Runtime switches for the mock API, persisted in localStorage so they survive reloads.
 *
 * From the browser console (development only):
 *   __mocks.set({ scenario: "error" })                  // every request fails with a 500
 *   __mocks.set({ scenario: "insufficient-credits" })   // chat completions answer 402
 *   __mocks.set({ scenario: "stream-error" })           // chat streams break off with an error frame
 *   __mocks.set({ latencyMs: 2000 })                    // slow network (time to first byte for streams)
 *   __mocks.set({ tokenDelayMs: 60 })                   // slower streaming (ms between chat tokens)
 *   __mocks.reset()
 */
export type MockScenario = "default" | "error" | "insufficient-credits" | "stream-error";

export interface MockConfig {
  scenario: MockScenario;
  latencyMs: number;
  /** Base pause between streamed chat pieces, scaled by the model's speed rating. */
  tokenDelayMs: number;
}

const STORAGE_KEY = "sn:mocks";

/** Fired on window after every change; the app invalidates its queries. */
export const MOCKS_CHANGED_EVENT = "sn:mocks-changed";
const DEFAULT_CONFIG: MockConfig = { scenario: "default", latencyMs: 400, tokenDelayMs: 18 };

export function getMockConfig(): MockConfig {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<MockConfig>;
    return { ...DEFAULT_CONFIG, ...stored };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setMockConfig(patch: Partial<MockConfig>) {
  const next = { ...getMockConfig(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(MOCKS_CHANGED_EVENT));
  return next;
}

export function resetMockConfig() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(MOCKS_CHANGED_EVENT));
  return DEFAULT_CONFIG;
}
