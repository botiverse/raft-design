import { ArrowDownToLine } from "lucide-react";
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
} from "raft-ui/wip";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageAttachmentDiffUsageComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageAttachmentCard>
        <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
        <MessageAttachmentSummary render={<MessageAttachmentDiffSummary />}>
          <MessageAttachmentDiffAddition>+42</MessageAttachmentDiffAddition>
          <MessageAttachmentDiffDeletion>-7</MessageAttachmentDiffDeletion>
        </MessageAttachmentSummary>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>18 KB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <MessageAttachmentAction
              aria-label="Download migration.diff"
              onClick={() => downloadMessageFixture("migration.diff")}
              title="Download migration.diff"
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>
    </MessageAttachmentGroup>
  );
}
