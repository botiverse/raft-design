import { useState } from "react";
import { Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
  MessageReferenceChip,
} from "raft-ui/wip";

import {
  MessageMentionReferenceComposition,
  MessageTargetReferenceComposition,
} from "./reference-adapters.composition.tsx";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceComparisonComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="w-full max-w-xl">
      <MessageItemInteractionBoundary ref={setPortalContainer}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Atlas</MessageItemSender>
              <MessageItemMeta>owner</MessageItemMeta>
              <MessageItemTime>2:20 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              <MessageMarkdown>
                <p>
                  Ask{" "}
                  <MessageMentionReferenceComposition
                    portalContainer={portalContainer}
                    preview={<p>Atlas · owner</p>}
                  >
                    @Atlas
                  </MessageMentionReferenceComposition>{" "}
                  to check the{" "}
                  <MessageTargetReferenceComposition href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage}>
                    #all
                  </MessageTargetReferenceComposition>{" "}
                  rollout in{" "}
                  <MessageReferenceChip
                    tone="accent"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel} />}
                  >
                    <Hash size={12} />
                    release-notes
                  </MessageReferenceChip>
                  .
                </p>
              </MessageMarkdown>
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </MessageItemInteractionBoundary>
    </div>
  );
}
