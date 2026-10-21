import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@botiverse/raft-ui";
import { VirtualList } from "@botiverse/raft-ui";
import type { VirtualListApi, VirtualListItemRenderProps } from "@botiverse/raft-ui";

import { ChannelMessageRow } from "../channel-message-row.tsx";
import { STREAMED_REPLY, createChannelMessages } from "../virtual-list.fixtures.ts";
import type { ChannelMessage } from "../virtual-list.fixtures.ts";

const INITIAL_MESSAGES = createChannelMessages(0, 200);
const getKey = (message: ChannelMessage) => message.id;

function renderMessage({ item, domRef, style }: VirtualListItemRenderProps<ChannelMessage>) {
  return <ChannelMessageRow key={item.id} message={item} domRef={domRef} style={style} />;
}

/** Within this many pixels of the end, the reader is at the bottom and the list follows new rows. */
const BOTTOM_THRESHOLD = 24;

export function VirtualListChatContent() {
  const listRef = useRef<VirtualListApi>(null);
  const atBottomRef = useRef(true);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [streamedWords, setStreamedWords] = useState<number | null>(null);

  const followIfAtBottom = useCallback(() => {
    if (atBottomRef.current) listRef.current?.scrollTo({ position: "bottom" });
  }, []);
  const trackBottom = useCallback(() => {
    const list = listRef.current?.listElRef.current;
    if (list) {
      atBottomRef.current =
        list.scrollHeight - list.scrollTop - list.clientHeight <= BOTTOM_THRESHOLD;
    }
  }, []);

  // Open at the newest message, then follow every new row while the reader is at the bottom. A row
  // that grows (the streamed reply) reaches `onContentResize`, which follows it too.
  useLayoutEffect(() => {
    listRef.current?.scrollTo({ position: "bottom" });
  }, []);
  useLayoutEffect(followIfAtBottom, [messages.length, followIfAtBottom]);

  const streaming = streamedWords !== null;
  useEffect(() => {
    if (streamedWords === null) return;
    const timer = setTimeout(() => {
      const words = streamedWords + 1;
      setMessages((current) => {
        const reply = current[current.length - 1]!;
        const text = STREAMED_REPLY.slice(0, words).join(" ");
        return [...current.slice(0, -1), { ...reply, text }];
      });
      setStreamedWords(words < STREAMED_REPLY.length ? words : null);
    }, 60);
    return () => clearTimeout(timer);
  }, [streamedWords]);

  const send = useCallback(() => {
    setMessages((current) => {
      const message = createChannelMessages(current.length, 1)[0]!;
      return [...current, { ...message, sender: "Martin", type: "human" }];
    });
  }, []);
  const streamReply = useCallback(() => {
    setMessages((current) => {
      const message = createChannelMessages(current.length, 1)[0]!;
      return [...current, { ...message, sender: "Wug", type: "agent", text: "" }];
    });
    setStreamedWords(0);
  }, []);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="h-90 overflow-hidden rounded-container border border-line-hairline">
        <VirtualList
          componentRef={listRef}
          items={messages}
          getKey={getKey}
          itemResizable
          itemEstimatedSize={64}
          itemMinSize={40}
          paddingTop={8}
          paddingBottom={8}
          onScroll={trackBottom}
          onContentResize={followIfAtBottom}
        >
          {renderMessage}
        </VirtualList>
      </div>
      <div className="flex gap-2">
        <Button onClick={send}>Send a Message</Button>
        <Button onClick={streamReply} disabled={streaming}>
          Stream a Reply
        </Button>
      </div>
    </div>
  );
}
