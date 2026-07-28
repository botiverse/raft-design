import { Download } from "lucide-react";
import {
  MessageAttachmentAction,
  MessageAttachmentActions,
  MessageAttachmentBody,
  MessageAttachmentCard,
  MessageAttachmentMeta,
  MessageAttachmentMetaLabel,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
} from "raft-ui/wip";

import { downloadMessageFixture } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageFileAttachmentComposition() {
  return (
    <MessageAttachmentCard
      aria-label="Download migration.diff"
      render={<button type="button" />}
      onClick={() => downloadMessageFixture("migration.diff")}
    >
      <MessageAttachmentBody>
        <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
        <MessageAttachmentSummary>+42 -7</MessageAttachmentSummary>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaLabel>Diff · 18 KB</MessageAttachmentMetaLabel>
        </MessageAttachmentMeta>
      </MessageAttachmentBody>
      <MessageAttachmentActions>
        <MessageAttachmentAction render={<span />}>
          <Download />
        </MessageAttachmentAction>
      </MessageAttachmentActions>
    </MessageAttachmentCard>
  );
}
