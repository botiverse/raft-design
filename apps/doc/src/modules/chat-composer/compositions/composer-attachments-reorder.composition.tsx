import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import {
  ComposerActions,
  ComposerAttachments,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  SortableComposerAttachment,
  SortableComposerAttachments,
} from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

import {
  ReorderAttachmentTile,
  WRAP_REORDER_ATTACHMENTS,
  reorderAttachmentsByIds,
  type ReorderAttachment,
} from "./composer-attachments-reorder-shared.tsx";

export function ComposerAttachmentsReorderComposition() {
  const [attachments, setAttachments] = useState<ReorderAttachment[]>([
    ...WRAP_REORDER_ATTACHMENTS,
  ]);
  const ids = attachments.map((attachment) => attachment.id);

  return (
    <ComposerRoot>
      <ComposerAttachments>
        <SortableComposerAttachments
          items={ids}
          onReorder={(nextIds) =>
            setAttachments((items) => reorderAttachmentsByIds(items, nextIds))
          }
        >
          {attachments.map((attachment) => (
            <SortableComposerAttachment
              key={attachment.id}
              id={attachment.id}
              label={attachment.name}
            >
              <ReorderAttachmentTile
                attachment={attachment}
                onRemove={(id) => setAttachments((items) => items.filter((item) => item.id !== id))}
              />
            </SortableComposerAttachment>
          ))}
        </SortableComposerAttachments>
      </ComposerAttachments>
      <Composer>
        <ComposerInput aria-label="Message #proj-uiux" placeholder="Message #proj-uiux" readOnly />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton aria-label="Attach file" disabled>
              <Paperclip />
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            <ComposerSubmit aria-label="Send" disabled>
              <Send />
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
    </ComposerRoot>
  );
}
