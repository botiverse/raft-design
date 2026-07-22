import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemNotice,
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
  const [jumped, setJumped] = useState(false);

  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
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
              setJumped(true);
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
        {jumped ? <MessageItemNotice>Jumped to the annotated attachment.</MessageItemNotice> : null}
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
            <Avatar size="sm" type="agent">
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
                  .
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
