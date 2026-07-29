import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  MESSAGE_ITEM_CONTENT_COLLAPSE_HEIGHT,
  MessageItem,
  MessageItemBody,
  MessageItemContentCollapse,
  MessageItemContentCollapsePanel,
  MessageItemContentCollapseTrigger,
  MessageItemContent,
} from "raft-ui/wip";

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

const PARAGRAPHS = [
  "Postmortem for yesterday's 18:40 UTC outage — writing it up here so nobody has to dig through the incident channel.",
  "Trigger: the 17:55 deploy shipped a migration that added a non-null column to conversation_members without a default.",
  "The migration itself succeeded, but the previous app revision was still serving traffic for about four minutes during the rollout.",
  "Those pods kept inserting rows without the new column, so every write to conversation_members started failing with a constraint violation.",
  "Impact: channel joins and invite acceptance returned 500s for 11 minutes. Message send and read paths were unaffected.",
  "Detection took six of those minutes because our alert watches error rate on the API gateway, which was still mostly healthy.",
  "Mitigation: we rolled the migration forward with a backfill default rather than reverting, since the revert would have dropped data written after 17:55.",
  "Action items: add a rule that non-null columns ship with a default, and alert on per-endpoint error rate instead of the gateway aggregate.",
  "Follow-up: the rollout playbook now requires a compatibility window whenever old and new application revisions can write to the same schema.",
  "We are also adding a canary check that exercises channel joins and invite acceptance before a migration reaches the remaining pods.",
  "I'll open both tickets this afternoon. Shout if you saw anything else odd around that window — I'd rather over-collect now.",
] as const;

export function MessageCollapsibleContentComposition() {
  return (
    <MessageItem>
      <MessageItemContent>
        <MeasuredMessageContent>
          <MessageItemBody>
            <div className="space-y-3">
              {PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </MessageItemBody>
        </MeasuredMessageContent>
      </MessageItemContent>
    </MessageItem>
  );
}
