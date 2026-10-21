import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MessageListNotice } from "@botiverse/raft-ui";
import { VirtualList } from "@botiverse/raft-ui";
import type { VirtualListApi, VirtualListItemRenderProps } from "@botiverse/raft-ui";

import { ChannelMessageRow } from "../channel-message-row.tsx";
import { createChannelMessages } from "../virtual-list.fixtures.ts";
import type { ChannelMessage } from "../virtual-list.fixtures.ts";

const HISTORY_LENGTH = 1_000;
const PAGE_SIZE = 50;
const NEWEST_PAGE = createChannelMessages(HISTORY_LENGTH - PAGE_SIZE, PAGE_SIZE);
const getKey = (message: ChannelMessage) => message.id;

function renderMessage({ item, domRef, style }: VirtualListItemRenderProps<ChannelMessage>) {
  return <ChannelMessageRow key={item.id} message={item} domRef={domRef} style={style} />;
}

/** Older messages start loading when the reader comes this close to the top. */
const LOAD_THRESHOLD = 200;

export function VirtualListLoadOlderContent() {
  const listRef = useRef<VirtualListApi>(null);
  const [messages, setMessages] = useState(NEWEST_PAGE);
  const [loading, setLoading] = useState(false);
  const oldest = messages[0]!.n;
  const reachedStart = oldest === 0;

  useLayoutEffect(() => {
    listRef.current?.scrollTo({ position: "bottom" });
  }, []);

  const loadOlderNearTop = useCallback(() => {
    const list = listRef.current?.listElRef.current;
    if (list && list.scrollTop < LOAD_THRESHOLD && !reachedStart) setLoading(true);
  }, [reachedStart]);

  // A stand-in for the request: the older page arrives after 400ms and goes above the rows in view,
  // which keepAnchorOnItemsChange keeps where they are.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setMessages((current) => {
        const from = Math.max(0, current[0]!.n - PAGE_SIZE);
        return [...createChannelMessages(from, current[0]!.n - from), ...current];
      });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="h-90 w-full max-w-xl overflow-hidden rounded-container border border-line-hairline">
      <VirtualList
        componentRef={listRef}
        items={messages}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={64}
        itemMinSize={40}
        paddingBottom={8}
        keepAnchorOnItemsChange
        onScroll={loadOlderNearTop}
        header={
          <MessageListNotice className="pt-3">
            {reachedStart ? "Beginning of messages" : "Loading older messages…"}
          </MessageListNotice>
        }
      >
        {renderMessage}
      </VirtualList>
    </div>
  );
}
