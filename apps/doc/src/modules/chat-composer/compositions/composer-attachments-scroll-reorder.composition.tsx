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
  SortableComposerAttachmentsScroll,
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

import {
  ReorderAttachmentTile,
  SCROLL_REORDER_ATTACHMENTS,
  reorderAttachmentsByIds,
} from "./composer-attachments-reorder-shared.tsx";
import type { ReorderAttachment } from "./composer-attachments-reorder-shared.tsx";

export function ComposerAttachmentsScrollReorderComposition() {
  const [attachments, setAttachments] = useState<ReorderAttachment[]>([
    ...SCROLL_REORDER_ATTACHMENTS,
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
        <SortableComposerAttachmentsScroll items={ids} onReorder={handleReorder}>
          {attachments.map((attachment) => (
            <SortableComposerAttachment
              key={attachment.id}
              id={attachment.id}
              label={attachment.name}
            >
              <ReorderAttachmentTile attachment={attachment} onRemove={handleRemove} />
            </SortableComposerAttachment>
          ))}
        </SortableComposerAttachmentsScroll>
      </ComposerAttachments>
      <Composer>
        <ComposerInput aria-label="Message #design" placeholder="Message #design" readOnly />
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
