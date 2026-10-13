"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icon/icon";
import { type AssistantReply } from "@/types/domain";

import { formatMetrics } from "../../lib/metrics";

function Dot() {
  return <span className="size-1.25 shrink-0 rounded-full bg-brand-secondary" />;
}

/** Spoken form of the metrics row, e.g. "202.23 tokens per second, 8.79 seconds total, …". */
function metricsLabel(stopped: boolean, metrics: ReturnType<typeof formatMetrics> | null) {
  const parts: string[] = [];
  if (stopped) parts.push("Stopped");
  if (metrics) {
    parts.push(
      `${metrics.tps} tokens per second`,
      `${metrics.total.slice(0, -1)} seconds total`,
      `${metrics.ttft.slice(0, -1)} seconds to first token`,
    );
  }
  return parts.join(", ");
}

/**
 * Footer under a settled reply (Figma: "AI action buttons/on" `1398:122206`): copy the
 * answer on the left, speed metrics on the right (they wrap under the copy icon when narrow).
 */
export function ReplyFooter({ reply }: { reply: AssistantReply }) {
  const stopped = reply.status === "stopped";
  const metrics = reply.metrics ? formatMetrics(reply.metrics) : null;
  const hasMeta = stopped || metrics !== null;

  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-x-4 gap-y-1">
      {reply.content ? (
        <CopyButton
          value={reply.content}
          icon="layers-subtract"
          size="reply"
          variant="bare"
          label="Copy response"
        />
      ) : (
        <span />
      )}
      {hasMeta && (
        <p
          role="group"
          aria-label={metricsLabel(stopped, metrics)}
          className="flex flex-wrap items-center gap-2.75 text-caption leading-5.25 font-normal"
        >
          {stopped && (
            <span aria-hidden="true" className="text-muted">
              Stopped
            </span>
          )}
          {stopped && metrics && <Dot />}
          {metrics && (
            <>
              <span aria-hidden="true" className="flex items-center gap-1.5">
                <Icon name="rocket" size={18} className="text-brand" />
                <span>
                  <span className="text-content">{metrics.tps}</span>{" "}
                  <span className="text-muted">t/s</span>
                </span>
              </span>
              <Dot />
              <span aria-hidden="true">
                <span className="text-content">{metrics.total} </span>
                <span className="text-muted">total duration</span>
              </span>
              <Dot />
              <span aria-hidden="true">
                <span className="text-content">{metrics.ttft} </span>
                <span className="text-muted">to first token</span>
              </span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
