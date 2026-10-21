import { useCallback, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { MessageListJumpControls, MessageListJumpPill } from "@botiverse/raft-ui/wip";
import { JumpConversation } from "../message-list-jump.fixtures.tsx";
import { scrollToEnd } from "../scroll-to-end.ts";

export function BackToBottomContent() {
  const listRef = useRef<HTMLDivElement>(null);
  const handleBottom = useCallback(() => scrollToEnd(listRef.current), []);

  return (
    <JumpConversation listRef={listRef}>
      <MessageListJumpControls>
        <MessageListJumpPill onClick={handleBottom}>
          <ArrowDown />
          Back to Bottom
        </MessageListJumpPill>
      </MessageListJumpControls>
    </JumpConversation>
  );
}
