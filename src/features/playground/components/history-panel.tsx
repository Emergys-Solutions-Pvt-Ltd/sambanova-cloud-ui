"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGate } from "@/features/auth";
import { useActiveProject } from "@/features/projects";
import { selectConversationId, usePlaygroundChatStore } from "@/stores/playground-chat-store";
import { usePlaygroundUIStore } from "@/stores/playground-ui-store";
import { type ConversationSummary } from "@/types/domain";

import { useChatActions } from "../hooks/use-chat-actions";
import { useConversations } from "../hooks/use-conversations";
import { filterByTitle, groupByDate } from "../lib/conversation";
import { DeleteConversationDialog } from "./delete-conversation-dialog";
import { HistoryItem } from "./history-item";

export interface HistoryPanelProps {
  onClose: () => void;
  /** Id for the "History" heading; the aside and the drawer each pass their own `useId()`. */
  headingId: string;
}

const messageClasses = "text-body-sm text-muted";

/** True when the element is rendered and can take focus (not `display: none`, not inside `inert`). */
const canFocus = (el: HTMLElement) => el.getClientRects().length > 0 && !el.closest("[inert]");

/**
 * History panel content: header, search and date-grouped saved chats (Figma: History `1398:119056`).
 * Shared by the in-flow aside (≥ lg) and the right drawer (< lg).
 */
export function HistoryPanel({ onClose, headingId }: HistoryPanelProps) {
  const { authenticated, guardAction } = useAuthGate();
  const projectId = useActiveProject().project?.id ?? null;
  const activeId = usePlaygroundChatStore(selectConversationId);
  const { openConversation, newThread } = useChatActions();
  const { data, isPending, isError, refetch, dataUpdatedAt } = useConversations();

  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ConversationSummary | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  // Set when the chat behind the delete dialog is gone, so focus lands on search instead of <body>.
  const deletedRef = useRef(false);

  // Focus search only when the user asked for History (View History), never on rehydration.
  // Checked a frame later so the panel is visible and no longer `inert`; a hidden instance leaves the flag.
  useEffect(() => {
    let frame = 0;
    const run = (state: ReturnType<typeof usePlaygroundUIStore.getState>) => {
      if (!state.historyFocusPending) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = searchRef.current;
        const current = usePlaygroundUIStore.getState();
        if (!el || !current.historyFocusPending || !canFocus(el)) return;
        el.focus();
        current.consumeHistoryFocus();
      });
    };
    run(usePlaygroundUIStore.getState());
    const unsubscribe = usePlaygroundUIStore.subscribe(run);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  const items = data ?? [];
  const filtered = filterByTitle(items, query);
  // Buckets are relative to when the list was fetched (no clock reads during render).
  const groups = groupByDate(filtered, new Date(dataUpdatedAt));
  const search = query.trim();

  const requestDelete = (item: ConversationSummary) => {
    deletedRef.current = false;
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const onDeleted = (id: string) => {
    deletedRef.current = true;
    if (usePlaygroundChatStore.getState().conversationId === id) newThread();
  };

  const renderBody = () => {
    if (!authenticated) {
      return (
        <div className="flex flex-col items-start gap-3">
          <p className={messageClasses}>Sign in to see your chat history.</p>
          <Button size="sm" variant="secondary" onClick={guardAction(() => {})}>
            Log in
          </Button>
        </div>
      );
    }
    if (isError) {
      return <ErrorState message="Couldn’t load history." onRetry={() => void refetch()} />;
    }
    if (isPending) {
      return (
        <ul aria-busy="true" aria-label="Loading history" className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((index) => (
            <li key={index}>
              <Skeleton radius="md" className="h-10.5" />
            </li>
          ))}
        </ul>
      );
    }
    if (items.length === 0) {
      return <p className={messageClasses}>No chats yet. Your conversations will appear here.</p>;
    }
    if (groups.length === 0) {
      return <p className={messageClasses}>No chats match “{search}”.</p>;
    }
    return (
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-2">
            <h3 className="flex h-5.5 items-center">
              <span className="truncate text-caption leading-5.5 text-menu-label">
                {group.label}
              </span>
            </h3>
            <ul className="flex flex-col gap-3">
              {group.items.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  active={item.id === activeId}
                  onOpen={(id) => void openConversation(id)}
                  onRequestDelete={requestDelete}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-8.75 py-5">
      <div className="flex h-10 items-center justify-between gap-3 px-5">
        <h2 id={headingId} className="text-heading-xs text-primary">
          History
        </h2>
        <IconButton
          icon="sidebar-collapse"
          size="chat-lg"
          variant="subtle"
          aria-label="Close history"
          onClick={onClose}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="mx-5 flex h-8.5 items-center gap-2.5 rounded-md border border-strong bg-menu px-4 focus-within:border-focus">
          <Icon name="search" size={18} className="shrink-0 text-secondary" />
          <input
            ref={searchRef}
            type="search"
            aria-label="Search history"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted"
          />
        </div>
        <nav
          aria-label="Conversation history"
          className="min-h-0 flex-1 scrollbar-thin overflow-y-auto px-5"
        >
          {renderBody()}
        </nav>
      </div>
      <DeleteConversationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        conversation={deleteTarget}
        projectId={projectId}
        onDeleted={onDeleted}
        onCloseAutoFocus={(event) => {
          if (!deletedRef.current) return;
          deletedRef.current = false;
          event.preventDefault();
          searchRef.current?.focus();
        }}
      />
    </div>
  );
}
