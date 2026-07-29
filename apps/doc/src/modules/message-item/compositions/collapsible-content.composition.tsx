import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Hash, MessageSquare } from "lucide-react";
import { MessageReferenceChip, MessageReferenceLabel } from "raft-ui";
import {
  MESSAGE_ITEM_CONTENT_COLLAPSE_HEIGHT,
  MessageAttachmentCard,
  MessageAttachmentMeta,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
  MessageItem,
  MessageItemAttachments,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemContentCollapse,
  MessageItemContentCollapsePanel,
  MessageItemContentCollapseTrigger,
  MessageItemFooter,
  MessageItemNotice,
} from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

function getRenderedHeight(entry: ResizeObserverEntry) {
  const borderBoxSize = entry.borderBoxSize as
    | ResizeObserverSize
    | readonly ResizeObserverSize[]
    | undefined;
  const firstBoxSize = Array.isArray(borderBoxSize) ? borderBoxSize[0] : borderBoxSize;
  return firstBoxSize?.blockSize ?? entry.contentRect.height;
}

function MeasuredMessageContent({ children }: { children: ReactNode }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [renderedHeight, setRenderedHeight] = useState(0);

  useLayoutEffect(() => {
    const element = measureRef.current;
    if (!element) return;
    if (typeof ResizeObserver === "undefined") {
      setRenderedHeight(element.scrollHeight);
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRenderedHeight(getRenderedHeight(entry));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <MessageItemContentCollapse
      collapsible={renderedHeight > MESSAGE_ITEM_CONTENT_COLLAPSE_HEIGHT}
      expanded={expanded}
      onExpandedChange={setExpanded}
    >
      <MessageItemContentCollapsePanel>
        <div ref={measureRef} className="min-w-0">
          {children}
        </div>
      </MessageItemContentCollapsePanel>
      <MessageItemContentCollapseTrigger>
        {({ expanded: isExpanded }) => (isExpanded ? "Collapse" : "Show more")}
      </MessageItemContentCollapseTrigger>
    </MessageItemContentCollapse>
  );
}

export function MessageCollapsibleContentComposition() {
  return (
    <MessageItem>
      <MessageItemContent>
        <MeasuredMessageContent>
          <MessageItemBody>
            <div className="space-y-3">
              <p>
                Postmortem for yesterday&apos;s 18:40 UTC outage — writing it up here so nobody has
                to dig through the incident channel.
              </p>
              <p>
                Trigger: the 17:55 deploy shipped a migration that added a non-null column to
                conversation_members without a default.
              </p>
              <p>
                The migration succeeded, but the previous app revision was still serving traffic
                during the rollout and kept writing the old schema.
              </p>
              <p>
                Impact: channel joins and invite acceptance returned 500s for 11 minutes. Message
                send and read paths were unaffected.
              </p>
              <p>
                Mitigation: we rolled the migration forward with a backfill default rather than
                reverting and risking newer writes.
              </p>
              <p>
                Follow-up: every schema rollout now requires a compatibility window and a canary
                check for affected endpoints.
              </p>
              <p>
                I&apos;ll open the alerting and rollout-policy tickets this afternoon and link them
                back to the incident.
              </p>
              <p>
                The full rollout notes are in{" "}
                <MessageReferenceChip
                  variant="accent"
                  render={
                    <a
                      href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel}
                      aria-label="Open release-notes channel"
                    />
                  }
                >
                  <Hash />
                  <MessageReferenceLabel>release-notes</MessageReferenceLabel>
                </MessageReferenceChip>
                .
              </p>
            </div>
          </MessageItemBody>
          <MessageItemNotice>
            Compatibility review is required before the next schema migration.
          </MessageItemNotice>
          <MessageItemAttachments>
            <MessageAttachmentCard>
              <MessageAttachmentTitle>conversation-members-migration.diff</MessageAttachmentTitle>
              <MessageAttachmentSummary>2 files · 5 hunks</MessageAttachmentSummary>
              <MessageAttachmentMeta>
                <MessageAttachmentMetaStart>18 KB</MessageAttachmentMetaStart>
              </MessageAttachmentMeta>
            </MessageAttachmentCard>
          </MessageItemAttachments>
        </MeasuredMessageContent>
        <MessageItemFooter>
          <MessageItemBadge status="unread">
            <MessageSquare />4 replies
          </MessageItemBadge>
        </MessageItemFooter>
      </MessageItemContent>
    </MessageItem>
  );
}
