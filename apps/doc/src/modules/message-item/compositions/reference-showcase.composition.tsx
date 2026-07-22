import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import { MessageSquare } from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
  MessageReference,
} from "raft-ui/wip";
import {
  MessageMentionReferenceComposition,
  MessagePermalinkReferenceComposition,
  MessageReferenceLoadingComposition,
  MessageSelfMentionReferenceComposition,
  MessageUnavailableReferencesComposition,
} from "./content.compositions.tsx";

export function MessageReferenceShowcaseComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
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
              <MessageItemTime>2:20 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              <MessageMarkdown>
                <p>
                  Ask{" "}
                  <MessageMentionReferenceComposition
                    href="/playground/s/raft/channel/all"
                    portalContainer={portalContainer}
                    preview={<p>Atlas · Design-system agent</p>}
                  >
                    @Atlas
                  </MessageMentionReferenceComposition>{" "}
                  to check the{" "}
                  <MessagePermalinkReferenceComposition href="/playground/s/raft/channel/all">
                    message #222
                  </MessagePermalinkReferenceComposition>{" "}
                  rollout, with an external{" "}
                  <MessagePermalinkReferenceComposition
                    external
                    href="https://other.example/messages/333"
                  >
                    message #333
                  </MessagePermalinkReferenceComposition>
                  .
                </p>
                <p>
                  <MessageSelfMentionReferenceComposition
                    href="/playground/s/raft/channel/all"
                    portalContainer={portalContainer}
                    preview={<p>You · Current workspace member</p>}
                  >
                    @you
                  </MessageSelfMentionReferenceComposition>{" "}
                  assigned{" "}
                  <MessageReference variant="muted" render={<a href="https://raft.build" />}>
                    #141
                  </MessageReference>{" "}
                  in{" "}
                  <MessageReference variant="accent" render={<a href="https://raft.build" />}>
                    #release-notes
                  </MessageReference>{" "}
                  and linked{" "}
                  <MessageReference variant="info" render={<a href="https://raft.build" />}>
                    #release-notes:final
                  </MessageReference>
                  . DM parents reuse the same chip chrome —{" "}
                  <MessageReference variant="accent" render={<a href="https://raft.build" />}>
                    dm:@kai
                  </MessageReference>{" "}
                  (accent) and{" "}
                  <MessageReference variant="info" render={<a href="https://raft.build" />}>
                    dm:@kai:a1b2c3d4
                  </MessageReference>{" "}
                  (info).
                </p>
                <p>
                  <MessageReferenceLoadingComposition>
                    Resolving channel link
                  </MessageReferenceLoadingComposition>
                </p>
                <MessageUnavailableReferencesComposition />
              </MessageMarkdown>
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </MessageItemInteractionBoundary>
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
            <MessageItemTime>2:21 PM</MessageItemTime>
          </MessageItemHeader>
          <div className="mb-0.5">
            <MessageReference
              variant="subtle"
              render={
                <a
                  href="https://raft.build"
                  title="Jump to the message with architecture.pdf · L12"
                />
              }
            >
              <MessageSquare size={12} />
              <span>re: architecture.pdf · L12</span>
            </MessageReference>
          </div>
          <MessageMarkdown>
            <blockquote>
              This paragraph needs the deployment-owner decision before the document can be
              approved.
            </blockquote>
          </MessageMarkdown>
          <MessageItemBody>Added the owner note to the review thread.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
