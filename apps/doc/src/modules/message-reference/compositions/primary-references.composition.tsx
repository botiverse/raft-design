import { useState } from "react";
import { Hash } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MarkdownParagraph,
  MessageReferenceBadge,
  MessageReferenceChip,
  MessageReferenceIndicator,
  MessageReferenceLabel,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
  Status,
} from "raft-ui";

import {
  MessageMentionReferenceComposition,
  MessagePermalinkReferenceComposition,
} from "./reference-adapters.composition.tsx";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";

export function MessagePrimaryReferencesComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="w-full">
      <div ref={setPortalContainer}>
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
              <MarkdownParagraph>
                Ask{" "}
                <MessageMentionReferenceComposition
                  portalContainer={portalContainer}
                  preview={<p>Atlas · owner</p>}
                >
                  @Atlas
                  <MessageReferenceIndicator>
                    <Status aria-label="Read" size="sm" variant="success" />
                  </MessageReferenceIndicator>
                </MessageMentionReferenceComposition>{" "}
                or{" "}
                <MessageMentionReferenceComposition
                  portalContainer={portalContainer}
                  preview={<p>Ada · current workspace member</p>}
                  variant="primary"
                >
                  Ada
                </MessageMentionReferenceComposition>{" "}
                to review the linked message in{" "}
                <MessagePermalinkReferenceComposition href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage}>
                  #raft-ui-migration
                </MessagePermalinkReferenceComposition>{" "}
                before posting the rollout in{" "}
                <MessageReferenceChip
                  variant="accent"
                  render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel} />}
                >
                  <MessageReferenceBadge>channel</MessageReferenceBadge>
                  <Hash />
                  <MessageReferenceLabel>release-notes</MessageReferenceLabel>
                </MessageReferenceChip>
                .
              </MarkdownParagraph>
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </div>
    </div>
  );
}
