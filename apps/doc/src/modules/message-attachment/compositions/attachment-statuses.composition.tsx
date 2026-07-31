import { ArrowDownToLine, MessageSquare } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentCommentSummary,
  MessageAttachmentCard,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
} from "raft-ui";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageAttachmentStatusesUsageComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageAttachmentCard>
        <MessageAttachmentTitle>release-notes.md</MessageAttachmentTitle>
        <MessageAttachmentSummary render={<MessageAttachmentCommentSummary />}>
          <MessageSquare />6
        </MessageAttachmentSummary>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>1 KB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <MessageAttachmentAction
              aria-label="Download release-notes.md"
              onClick={() => downloadMessageFixture("release-notes.md")}
              title="Download release-notes.md"
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>

      <MessageAttachmentCard aria-busy>
        <MessageAttachmentTitle>metrics.csv</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>1 KB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <Spinner size="xs" />
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>
    </MessageAttachmentGroup>
  );
}
