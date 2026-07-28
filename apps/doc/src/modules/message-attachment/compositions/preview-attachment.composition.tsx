import { useState } from "react";
import { Eye } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  MessageAttachmentAction,
  MessageAttachmentContent,
  MessageAttachmentGroup,
  MessageAttachmentMeta,
  MessageAttachmentMetaDetail,
  MessageAttachmentMetaLabel,
  MessageAttachmentTitle,
} from "raft-ui/wip";

export function MessageAttachmentPreviewUsageComposition() {
  const [opening, setOpening] = useState(false);

  return (
    <MessageAttachmentGroup>
      <MessageAttachmentContent aria-busy={opening || undefined}>
        <MessageAttachmentTitle>screening.html</MessageAttachmentTitle>
        <MessageAttachmentMeta>
          <MessageAttachmentMetaLabel>44 KB</MessageAttachmentMetaLabel>
          <MessageAttachmentMetaDetail>
            <MessageAttachmentAction
              aria-label="Preview screening.html"
              onClick={opening ? undefined : () => setOpening(true)}
              render={opening ? <span aria-hidden /> : undefined}
              title="Preview screening.html"
            >
              {opening ? <Spinner size="xs" /> : <Eye />}
            </MessageAttachmentAction>
          </MessageAttachmentMetaDetail>
        </MessageAttachmentMeta>
      </MessageAttachmentContent>
    </MessageAttachmentGroup>
  );
}
