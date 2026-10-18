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
} from "@botiverse/raft-ui";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

function downloadMigrationDiff() {
  downloadMessageFixture("migration.diff");
}

export function MessageAttachmentDiffUsageComposition() {
  return (
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
              onClick={downloadMigrationDiff}
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
