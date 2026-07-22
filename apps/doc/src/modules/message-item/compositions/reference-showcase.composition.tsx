import { useState } from "react";
import { MessageItemExampleAvatar } from "../message-item-example-avatar.tsx";
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
  MessageReferenceChannel,
  MessageReferenceComment,
  MessageReferenceTask,
  MessageReferenceThread,
} from "raft-ui/wip";
import {
  MessageMentionReferenceComposition,
  MessagePermalinkReferenceComposition,
  MessageReferenceLoadingComposition,
  MessageSelfMentionReferenceComposition,
  MessageUnavailableReferencesComposition,
} from "./content.compositions.tsx";

function AttachmentCommentReferenceRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <MessageItemExampleAvatar />
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemTime>2:21 PM</MessageItemTime>
        </MessageItemHeader>
        <div className="mb-0.5">
          <MessageReferenceComment
            href="#attachment-comment"
            onClick={(event) => {
              event.preventDefault();
            }}
            title="Jump to the message with architecture.pdf · L12"
          >
            <MessageSquare size={12} />
            <span>re: architecture.pdf · L12</span>
          </MessageReferenceComment>
        </div>
        <MessageMarkdown>
          <blockquote>
            This paragraph needs the deployment-owner decision before the document can be approved.
          </blockquote>
        </MessageMarkdown>
        <MessageItemBody>Added the owner note to the review thread.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function MessageReferenceShowcaseComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageItemInteractionBoundary ref={setPortalContainer}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <MessageItemExampleAvatar />
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
                  <MessageReferenceTask
                    href="#task-141"
                    onClick={(event) => event.preventDefault()}
                  >
                    #141
                  </MessageReferenceTask>{" "}
                  in{" "}
                  <MessageReferenceChannel
                    href="#release-notes"
                    onClick={(event) => event.preventDefault()}
                  >
                    #release-notes
                  </MessageReferenceChannel>{" "}
                  and linked{" "}
                  <MessageReferenceThread
                    href="#release-notes-final"
                    onClick={(event) => event.preventDefault()}
                  >
                    #release-notes:final
                  </MessageReferenceThread>
                  . DM parents reuse the same chip chrome —{" "}
                  <MessageReferenceChannel
                    href="#dm-kai"
                    onClick={(event) => event.preventDefault()}
                  >
                    dm:@kai
                  </MessageReferenceChannel>{" "}
                  (pink) and{" "}
                  <MessageReferenceThread
                    href="#dm-kai-a1b2c3d4"
                    onClick={(event) => event.preventDefault()}
                  >
                    dm:@kai:a1b2c3d4
                  </MessageReferenceThread>{" "}
                  (cyan).
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
      <AttachmentCommentReferenceRow />
    </div>
  );
}
