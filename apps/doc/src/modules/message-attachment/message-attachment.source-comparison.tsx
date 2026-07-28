import { ArrowDownToLine } from "lucide-react";
import { Avatar, AvatarFallback } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentCard,
  MessageAttachmentDiffAddition,
  MessageAttachmentDiffDeletion,
  MessageAttachmentDiffSummary,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
  MessageItem,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageAttachmentComparisonComposition() {
  return (
    <div className="w-full max-w-xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>App Planner</MessageItemSender>
            <MessageItemTime>3:04 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Here is the source parity pass.</MessageItemBody>
          <MessageItemAttachments>
            <MessageAttachmentGroup>
              <MessageAttachmentCard>
                <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
                <MessageAttachmentSummary render={<MessageAttachmentDiffSummary />}>
                  <span>2 files · 5 hunks</span>
                  <MessageAttachmentDiffAddition>+42</MessageAttachmentDiffAddition>
                  <MessageAttachmentDiffDeletion>-7</MessageAttachmentDiffDeletion>
                </MessageAttachmentSummary>
                <MessageAttachmentMeta>
                  <MessageAttachmentMetaStart>18 KB</MessageAttachmentMetaStart>
                  <MessageAttachmentMetaEnd>
                    <MessageAttachmentAction
                      aria-label="Download migration.diff"
                      title="Download migration.diff"
                      onClick={() => downloadMessageFixture("migration.diff")}
                    >
                      <ArrowDownToLine />
                    </MessageAttachmentAction>
                  </MessageAttachmentMetaEnd>
                </MessageAttachmentMeta>
              </MessageAttachmentCard>
            </MessageAttachmentGroup>
          </MessageItemAttachments>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
