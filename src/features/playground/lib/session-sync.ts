import { usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { usePlaygroundPrefsStore } from "@/stores/playground-prefs-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";
import { useProjectStore } from "@/stores/project-store";
import { useSessionStore } from "@/stores/session-store";

import { abortAllStreams } from "./stream-registry";

let installed = false;

function resetThread() {
  abortAllStreams();
  usePlaygroundChatStore.getState().reset();
  usePlaygroundUIStore.getState().reset();
}

/** Puts the preferred model on an empty single-chat thread once prefs are loaded. */
function syncPreferredModel() {
  const chat = usePlaygroundChatStore.getState();
  const { modelId } = usePlaygroundPrefsStore.getState();
  if (chat.turns.length > 0 || chat.mode !== "single" || chat.models.a !== null || !modelId) return;
  chat.setSlotModel("a", modelId);
}

/**
 * Keeps the Playground thread in step with the session outside React (a hidden
 * `<Activity>` route runs no effects). Idempotent; browser only.
 * - logout / user switch → abort streams, reset thread and UI (null → user does not reset);
 * - project switch away from the thread's project → same reset;
 * - prefs hydration → preferred model on an empty thread.
 */
export function installPlaygroundSessionSync() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  useSessionStore.subscribe((state, previous) => {
    const previousId = previous.user?.id ?? null;
    if (previousId !== null && previousId !== (state.user?.id ?? null)) resetThread();
  });

  useProjectStore.subscribe((state, previous) => {
    const projectId = state.activeProjectId;
    if (projectId === null || projectId === previous.activeProjectId) return;
    const threadProjectId = usePlaygroundChatStore.getState().projectId;
    if (threadProjectId !== null && threadProjectId !== projectId) resetThread();
  });

  if (usePlaygroundPrefsStore.persist.hasHydrated()) syncPreferredModel();
  else usePlaygroundPrefsStore.persist.onFinishHydration(syncPreferredModel);
}
