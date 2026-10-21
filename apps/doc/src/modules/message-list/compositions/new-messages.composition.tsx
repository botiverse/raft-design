import { useCallback, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { MessageListJumpControls, MessageListJumpPill } from "@botiverse/raft-ui/wip";
import { JumpConversation } from "../message-list-jump.fixtures.tsx";
import { scrollToEnd } from "../scroll-to-end.ts";

export function NewMessagesContent() {
  const listRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(3);
  const handleBottom = useCallback(() => {
    scrollToEnd(listRef.current);
    setCount(0);
  }, []);

  return (
    <JumpConversation listRef={listRef}>
      <MessageListJumpControls>
        <MessageListJumpPill onClick={handleBottom}>
          <ArrowDown />
          {count > 0 ? `${count} New Messages` : "Back to Bottom"}
        </MessageListJumpPill>
      </MessageListJumpControls>
    </JumpConversation>
  );
}
