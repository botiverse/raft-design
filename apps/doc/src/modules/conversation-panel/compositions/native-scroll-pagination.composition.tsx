import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageList,
  MessageListNotice,
} from "raft-ui/wip";

type DemoMessage = {
  id: string;
  sender: string;
  time: string;
  body: string;
};

type ScrollAnchor = {
  messageId: string;
  offset: number;
};

const PAGE_SIZE = 6;
const INITIAL_START_INDEX = 18;

const MESSAGES: readonly DemoMessage[] = Array.from({ length: 24 }, (_, index) => ({
  id: `message-${index + 1}`,
  sender: index % 2 === 0 ? "Cindy" : "Atlas",
  time: `10:${String(index + 20).padStart(2, "0")}`,
  body:
    index % 2 === 0
      ? "Scroll toward the beginning to load an older page without losing the message you were reading."
      : "The top sentinel requests another page when it enters the scroll viewport.",
}));

export function NativeScrollPaginationComposition() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const pendingAnchorRef = useRef<ScrollAnchor | null>(null);
  const didInitialScrollRef = useRef(false);
  const [startIndex, setStartIndex] = useState(INITIAL_START_INDEX);
  const messages = useMemo(() => MESSAGES.slice(startIndex), [startIndex]);
  const hasOlder = startIndex > 0;

  const loadOlder = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !hasOlder) return;

    pendingAnchorRef.current = captureAnchor(viewport);
    setStartIndex((current) => Math.max(0, current - PAGE_SIZE));
  }, [hasOlder]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const anchor = pendingAnchorRef.current;
    if (anchor) {
      restoreAnchor(viewport, anchor);
      pendingAnchorRef.current = null;
      return;
    }

    if (!didInitialScrollRef.current) {
      viewport.scrollTop = viewport.scrollHeight;
      didInitialScrollRef.current = true;
    }
  }, [messages]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const sentinel = topSentinelRef.current;
    if (!viewport || !sentinel || !hasOlder) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadOlder();
      },
      { root: viewport, rootMargin: "160px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasOlder, loadOlder]);

  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-theme=elegant]_&]:bg-layer-page">
      <MessageList ref={viewportRef}>
        <div ref={topSentinelRef} aria-hidden className="h-px" />
        <div className="px-3 py-3">
          <MessageListNotice>
            {hasOlder ? "Scroll up to load earlier messages" : "Beginning of messages"}
          </MessageListNotice>
        </div>
        {messages.map((message) => (
          <div key={message.id} data-message-id={message.id}>
            <MessageItem>
              <MessageItemAvatarSlot>
                <Avatar size="md" type={message.sender === "Cindy" ? "human" : "agent"} />
              </MessageItemAvatarSlot>
              <MessageItemContent>
                <MessageItemHeader>
                  <MessageItemSender>{message.sender}</MessageItemSender>
                  <MessageItemTime>{message.time}</MessageItemTime>
                </MessageItemHeader>
                <MessageItemBody>{message.body}</MessageItemBody>
              </MessageItemContent>
            </MessageItem>
          </div>
        ))}
        <div className="h-3" aria-hidden />
      </MessageList>
    </div>
  );
}

function captureAnchor(viewport: HTMLElement): ScrollAnchor | null {
  const viewportTop = viewport.getBoundingClientRect().top;
  const rows = viewport.querySelectorAll<HTMLElement>("[data-message-id]");

  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    if (rect.bottom <= viewportTop) continue;
    const messageId = row.dataset.messageId;
    if (messageId) return { messageId, offset: rect.top - viewportTop };
  }

  return null;
}

function restoreAnchor(viewport: HTMLElement, anchor: ScrollAnchor) {
  const row = viewport.querySelector<HTMLElement>(
    `[data-message-id="${CSS.escape(anchor.messageId)}"]`,
  );
  if (!row) return;

  const nextOffset = row.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
  viewport.scrollTop += nextOffset - anchor.offset;
}
