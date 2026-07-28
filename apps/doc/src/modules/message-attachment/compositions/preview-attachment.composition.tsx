import { useState } from "react";
import { Eye } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentCard,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentTitle,
} from "raft-ui/wip";

export function MessageAttachmentPreviewUsageComposition() {
  const [opening, setOpening] = useState(false);

  return (
    <MessageAttachmentGroup>
      <MessageAttachmentCard aria-busy={opening || undefined}>
        <MessageAttachmentTitle>screening.html</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaStart>44 KB</MessageAttachmentMetaStart>
          <MessageAttachmentMetaEnd>
            <MessageAttachmentAction
              aria-label="Preview screening.html"
              onClick={opening ? undefined : () => setOpening(true)}
              render={opening ? <span aria-hidden /> : undefined}
              title="Preview screening.html"
            >
              {opening ? <Spinner size="xs" /> : <Eye />}
            </MessageAttachmentAction>
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>
    </MessageAttachmentGroup>
  );
}
