import { useCallback, useRef, useState } from "react";
import { ArrowDown, X } from "lucide-react";
import {
  MessageListJumpControls,
  MessageListJumpPill,
  MessageListJumpPillDismiss,
  MessageListJumpPillGroup,
} from "@botiverse/raft-ui/wip";
import { JumpConversation } from "../message-list-jump.fixtures.tsx";
import { scrollToEnd } from "../scroll-to-end.ts";

export function PhoneContent() {
  const listRef = useRef<HTMLDivElement>(null);
  const [unread, setUnread] = useState(3);
  const [dismissed, setDismissed] = useState(false);
  const handleBottom = useCallback(() => scrollToEnd(listRef.current), []);
  const handleNextThread = useCallback(() => setUnread((count) => count - 1), []);
  const handleDismiss = useCallback(() => setDismissed(true), []);

  return (
    <JumpConversation listRef={listRef} className="max-w-[375px]">
      <MessageListJumpControls>
        <MessageListJumpPill onClick={handleBottom}>
          <ArrowDown />
          Back to Bottom
        </MessageListJumpPill>
        {unread > 0 && !dismissed ? (
          <MessageListJumpPillGroup>
            <MessageListJumpPill onClick={handleNextThread}>
              <ArrowDown />
              Next Unread Thread ({unread})
            </MessageListJumpPill>
            <MessageListJumpPillDismiss aria-label="Dismiss Unread Threads" onClick={handleDismiss}>
              <X />
            </MessageListJumpPillDismiss>
          </MessageListJumpPillGroup>
        ) : null}
      </MessageListJumpControls>
    </JumpConversation>
  );
}
