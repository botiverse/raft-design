import { ArrowDownToLine } from "lucide-react";
import {
  MessageAttachmentAction,
  MessageAttachmentContent,
  MessageAttachmentDiffAddition,
  MessageAttachmentDiffDeletion,
  MessageAttachmentDiffSummary,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaDetail,
  MessageAttachmentMetaLabel,
  MessageAttachmentTitle,
} from "raft-ui/wip";
import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageAttachmentDiffUsageComposition() {
  return (
    <MessageAttachmentGroup>
      <MessageAttachmentContent>
        <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
        <MessageAttachmentDiffSummary>
          <MessageAttachmentDiffAddition>+42</MessageAttachmentDiffAddition>
          <MessageAttachmentDiffDeletion>-7</MessageAttachmentDiffDeletion>
        </MessageAttachmentDiffSummary>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaLabel>18 KB</MessageAttachmentMetaLabel>
          <MessageAttachmentMetaDetail>
            <MessageAttachmentAction
              aria-label="Download migration.diff"
              onClick={() => downloadMessageFixture("migration.diff")}
              title="Download migration.diff"
            >
              <ArrowDownToLine />
            </MessageAttachmentAction>
          </MessageAttachmentMetaDetail>
        </MessageAttachmentMeta>
      </MessageAttachmentContent>
    </MessageAttachmentGroup>
  );
}
