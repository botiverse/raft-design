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
            {opening ? (
              <Spinner size="xs" />
            ) : (
              <MessageAttachmentAction
                aria-label="Preview screening.html"
                onClick={() => setOpening(true)}
                title="Preview screening.html"
              >
                <Eye />
              </MessageAttachmentAction>
            )}
          </MessageAttachmentMetaEnd>
        </MessageAttachmentMeta>
      </MessageAttachmentCard>
    </MessageAttachmentGroup>
  );
}
