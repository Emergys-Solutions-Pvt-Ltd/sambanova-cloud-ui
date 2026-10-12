"use client";

import { type ReactNode, useState } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { Drawer, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Icon } from "@/components/ui/icon/icon";
import { IconButton } from "@/components/ui/icon-button";
import { formatRequestTime, formatResponseTime } from "@/lib/format";
import { type ApiKeyRequestLog } from "@/types/domain";

import { RequestStatusBadge, tokenCount } from "./api-key-requests-table";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-body-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-strong">{children}</dd>
    </div>
  );
}

function Section({
  title,
  children,
  tight,
}: {
  title: string;
  children: ReactNode;
  /** 8px under the title instead of 12px, for the boxed sections. */
  tight?: boolean;
}) {
  return (
    <section className={tight ? "flex flex-col gap-2" : "flex flex-col gap-3"}>
      <h3 className="text-heading-2xs text-strong">{title}</h3>
      {children}
    </section>
  );
}

/** Text in a bordered box with a copy button (Figma: request-container / response-container). */
function CopyBox({ text, label }: { text: string; label: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-detail-box bg-detail-box p-4">
      <p className="min-w-0 flex-1 text-body-sm leading-normal font-normal [overflow-wrap:anywhere] text-muted">
        {text}
      </p>
      <CopyButton value={text} label={label} size="xs" variant="contrast" className="-m-0.75" />
    </div>
  );
}

const Divider = () => <hr className="border-t border-default" />;

interface RequestDetailsDrawerProps {
  /** The request to show; the drawer is open while this is set. */
  log: ApiKeyRequestLog | null;
  onClose: () => void;
}

/**
 * Slide-in "Request Details" panel for one logged request (Figma: Success Drawer and Error Drawer):
 * id, request information, token usage, the prompt, then the response preview or the error.
 */
export function RequestDetailsDrawer({ log, onClose }: RequestDetailsDrawerProps) {
  // Keep showing the last request while the drawer slides out after `onClose`.
  const [shown, setShown] = useState(log);
  if (log && log !== shown) setShown(log);

  const entry = shown;
  const totalTokens =
    entry && entry.inputTokens !== null && entry.outputTokens !== null
      ? entry.inputTokens + entry.outputTokens
      : null;

  return (
    <Drawer side="right" open={log !== null} onOpenChange={(open) => !open && onClose()}>
      <div className="flex min-h-0 flex-1 flex-col gap-5 p-6">
        <header className="flex items-center justify-between gap-4">
          <DrawerTitle className="text-heading-md font-bold text-strong">
            Request Details
          </DrawerTitle>
          <DrawerClose asChild>
            <IconButton icon="close-thin" aria-label="Close request details" variant="muted" />
          </DrawerClose>
        </header>

        {entry && (
          <div className="-mr-3 flex min-h-0 flex-1 scrollbar-thin flex-col gap-5 overflow-y-auto pr-3">
            <div className="flex items-center justify-between gap-4 py-1 text-body-sm">
              <span className="text-muted">Request ID</span>
              <span className="flex min-w-0 items-center gap-2 text-strong">
                <span className="[overflow-wrap:anywhere]">{entry.id}</span>
                <CopyButton
                  value={entry.id}
                  label="Copy request ID"
                  size="2xs"
                  variant="contrast"
                />
              </span>
            </div>

            <Divider />

            <Section title="Request Information">
              <dl className="flex flex-col gap-3">
                <DetailRow label="Request Time">
                  {formatRequestTime(entry.requestedAt, true)}
                </DetailRow>
                <DetailRow label="Model">{entry.model}</DetailRow>
                <DetailRow label="Response Time">
                  {formatResponseTime(entry.responseTimeMs)}
                </DetailRow>
                <DetailRow label="Status">
                  <RequestStatusBadge status={entry.status} shape="capsule" />
                </DetailRow>
              </dl>
            </Section>

            <Divider />

            <Section title="Token Usage">
              <dl className="flex flex-col gap-3">
                <DetailRow label="Input Tokens">{tokenCount(entry.inputTokens)}</DetailRow>
                <DetailRow label="Output Tokens">{tokenCount(entry.outputTokens)}</DetailRow>
                <DetailRow label="Cached Tokens">{tokenCount(entry.cachedTokens)}</DetailRow>
                <DetailRow label="Total Tokens">{tokenCount(totalTokens)}</DetailRow>
              </dl>
            </Section>

            <Divider />

            <Section title="Request" tight>
              <CopyBox text={entry.request} label="Copy request" />
            </Section>

            {entry.error ? (
              <Section title="Error Details" tight>
                <div className="flex flex-col gap-3 rounded-md border border-error-box bg-error-box p-4 leading-normal">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-body-sm text-muted">Error Code</p>
                    <p className="text-body font-bold text-error-strong">
                      {entry.error.code} - {entry.error.title}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-body-sm text-muted">Error Message</p>
                    <p className="text-body-sm text-primary">{entry.error.message}</p>
                  </div>
                </div>
              </Section>
            ) : (
              entry.responsePreview && (
                <Section title="Response Preview" tight>
                  <CopyBox text={entry.responsePreview} label="Copy response preview" />
                </Section>
              )
            )}

            {/* No destination in Figma yet: the control is shown but does nothing. */}
            <button
              type="button"
              className="flex items-center gap-1 self-start text-body-sm font-semibold text-link"
            >
              View full response
              <Icon name="external-link" size={18} />
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
