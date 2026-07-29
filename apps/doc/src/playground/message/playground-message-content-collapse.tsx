import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  MESSAGE_ITEM_CONTENT_COLLAPSE_HEIGHT,
  MessageItemContentCollapse,
  MessageItemContentCollapsePanel,
  MessageItemContentCollapseTrigger,
} from "raft-ui/wip";

const observedContentCallbacks = new Map<Element, (height: number) => void>();
let sharedResizeObserver: ResizeObserver | null = null;

function getRenderedHeight(entry: ResizeObserverEntry) {
  const borderBoxSize = entry.borderBoxSize as
    | ResizeObserverSize
    | readonly ResizeObserverSize[]
    | undefined;
  const firstBoxSize = Array.isArray(borderBoxSize) ? borderBoxSize[0] : borderBoxSize;
  return firstBoxSize?.blockSize ?? entry.contentRect.height;
}

function observeContentHeight(element: HTMLElement, onMeasure: (height: number) => void) {
  if (typeof ResizeObserver === "undefined") {
    onMeasure(element.scrollHeight);
    return () => {};
  }

  if (!sharedResizeObserver) {
    sharedResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        observedContentCallbacks.get(entry.target)?.(getRenderedHeight(entry));
      }
    });
  }

  observedContentCallbacks.set(element, onMeasure);
  sharedResizeObserver.observe(element);

  return () => {
    sharedResizeObserver?.unobserve(element);
    observedContentCallbacks.delete(element);
    if (observedContentCallbacks.size === 0) {
      sharedResizeObserver?.disconnect();
      sharedResizeObserver = null;
    }
  };
}

export function PlaygroundMessageContentCollapse({
  children,
  enabled,
  expanded,
  onExpandedChange,
}: {
  children: ReactNode;
  enabled: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [renderedHeight, setRenderedHeight] = useState(0);

  useLayoutEffect(() => {
    if (!enabled) return;
    const element = measureRef.current;
    if (!element) return;
    return observeContentHeight(element, setRenderedHeight);
  }, [enabled]);

  return (
    <MessageItemContentCollapse
      collapsible={enabled && renderedHeight > MESSAGE_ITEM_CONTENT_COLLAPSE_HEIGHT}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      <MessageItemContentCollapsePanel>
        <div ref={measureRef} className="min-w-0">
          {children}
        </div>
      </MessageItemContentCollapsePanel>
      <MessageItemContentCollapseTrigger>
        {({ expanded: isExpanded }) => (isExpanded ? "Show less" : "Show more")}
      </MessageItemContentCollapseTrigger>
    </MessageItemContentCollapse>
  );
}
