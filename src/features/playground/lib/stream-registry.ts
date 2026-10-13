import { type CompareSlot } from "@/types/domain";

/** One in-flight completion stream. */
export interface StreamRun {
  controller: AbortController;
  turnId: string;
  slot: CompareSlot;
}

/** In-flight streams keyed by runId (unique per stream), shared by Stop, thread changes and session-sync. */
const runs = new Map<string, StreamRun>();

/** Tracks a stream so Stop and thread-changing actions can abort it. */
export function registerRun(runId: string, run: StreamRun) {
  runs.set(runId, run);
}

/** Forgets a stream, but only if the entry still belongs to `controller`. */
export function releaseRun(runId: string, controller: AbortController) {
  if (runs.get(runId)?.controller === controller) runs.delete(runId);
}

/** Aborts every in-flight stream and clears the registry. */
export function abortAllStreams() {
  const active = [...runs.values()];
  runs.clear();
  for (const run of active) run.controller.abort();
}
