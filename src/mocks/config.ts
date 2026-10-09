/**
 * Runtime switches for the mock API, persisted in localStorage so they survive reloads.
 *
 * From the browser console (development only):
 *   __mocks.set({ scenario: "error" })   // every request fails with a 500
 *   __mocks.set({ scenario: "guest" })   // GET /me returns 401 (signed-out state)
 *   __mocks.set({ latencyMs: 2000 })     // slow network
 *   __mocks.reset()
 */
export type MockScenario = "default" | "error" | "guest";

export interface MockConfig {
  scenario: MockScenario;
  latencyMs: number;
}

const STORAGE_KEY = "sn:mocks";
const DEFAULT_CONFIG: MockConfig = { scenario: "default", latencyMs: 400 };

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
  return next;
}

export function resetMockConfig() {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_CONFIG;
}
