import { ArrowDownToLine, MessageSquare } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentCommentSummary,
  MessageAttachmentContent,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaDetail,
  MessageAttachmentMetaLabel,
  MessageAttachmentTitle,
} from "raft-ui/wip";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageAttachmentStatusesUsageComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageAttachmentContent>
        <MessageAttachmentTitle>release-notes.md</MessageAttachmentTitle>
        <MessageAttachmentCommentSummary>
          <MessageSquare />6
        </MessageAttachmentCommentSummary>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaLabel>1 KB</MessageAttachmentMetaLabel>
          <MessageAttachmentMetaDetail>
            <MessageAttachmentAction
              aria-label="Download release-notes.md"
              onClick={() => downloadMessageFixture("release-notes.md")}
              title="Download release-notes.md"
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaDetail>
        </MessageAttachmentMeta>
      </MessageAttachmentContent>

      <MessageAttachmentContent aria-busy>
        <MessageAttachmentTitle>metrics.csv</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaLabel>1 KB</MessageAttachmentMetaLabel>
          <MessageAttachmentMetaDetail>
            <Spinner size="xs" />
          </MessageAttachmentMetaDetail>
        </MessageAttachmentMeta>
      </MessageAttachmentContent>
    </MessageAttachmentGroup>
  );
}
