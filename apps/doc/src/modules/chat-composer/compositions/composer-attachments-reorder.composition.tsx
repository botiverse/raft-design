import { useCallback, useMemo, useState } from "react";
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
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

import {
  ReorderAttachmentTile,
  WRAP_REORDER_ATTACHMENTS,
  reorderAttachmentsByIds,
} from "./composer-attachments-reorder-shared.tsx";
import type { ReorderAttachment } from "./composer-attachments-reorder-shared.tsx";

export function ComposerAttachmentsReorderComposition() {
  const [attachments, setAttachments] = useState<ReorderAttachment[]>([
    ...WRAP_REORDER_ATTACHMENTS,
  ]);
  const ids = useMemo(() => attachments.map((attachment) => attachment.id), [attachments]);

  const handleReorder = useCallback((nextIds: string[]) => {
    setAttachments((items) => reorderAttachmentsByIds(items, nextIds));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setAttachments((items) => items.filter((item) => item.id !== id));
  }, []);

  return (
    <ComposerRoot>
      <ComposerAttachments>
        <SortableComposerAttachments items={ids} onReorder={handleReorder}>
          {attachments.map((attachment) => (
            <SortableComposerAttachment
              key={attachment.id}
              id={attachment.id}
              label={attachment.name}
            >
              <ReorderAttachmentTile attachment={attachment} onRemove={handleRemove} />
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
