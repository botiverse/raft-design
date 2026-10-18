import { X } from "lucide-react";
import { useCallback } from "react";
import type { PointerEvent } from "react";
import {
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFile,
  ComposerAttachmentImage,
  ComposerAttachmentMeta,
  ComposerAttachmentRemove,
  ComposerAttachmentTitle,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
  FilePreviewMedia,
} from "raft-ui";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";
import type { ReorderAttachment } from "./composer-attachments-reorder.types.ts";

export type { ReorderAttachment };
export {
  SCROLL_REORDER_ATTACHMENTS,
  WRAP_REORDER_ATTACHMENTS,
} from "./composer-attachments-reorder.constants.ts";
export { reorderAttachmentsByIds } from "./reorder-attachments-by-ids.ts";

function stopPointerPropagation(event: PointerEvent) {
  event.stopPropagation();
}

export function ReorderAttachmentTile({
  attachment,
  onRemove,
}: {
  attachment: ReorderAttachment;
  onRemove?: (id: string) => void;
}) {
  const handleRemove = useCallback(() => onRemove?.(attachment.id), [attachment.id, onRemove]);

  return (
    <ComposerAttachment>
      {attachment.kind === "image" ? (
        <ComposerAttachmentImage>
          <FilePreview>
            <FilePreviewMedia>
              <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
            </FilePreviewMedia>
          </FilePreview>
        </ComposerAttachmentImage>
      ) : (
        <ComposerAttachmentFile>
          <FilePreview className="h-[46px]">
            <FilePreviewDocument className="h-[46px]" />
            <FilePreviewBadge>PDF</FilePreviewBadge>
          </FilePreview>
          <ComposerAttachmentBody>
            <ComposerAttachmentTitle>{attachment.name}</ComposerAttachmentTitle>
            <ComposerAttachmentMeta>18 KB</ComposerAttachmentMeta>
          </ComposerAttachmentBody>
        </ComposerAttachmentFile>
      )}
      {onRemove ? (
        <ComposerAttachmentRemove
          aria-label={`Remove ${attachment.name}`}
          onPointerDown={stopPointerPropagation}
          onClick={handleRemove}
        >
          <X />
        </ComposerAttachmentRemove>
      ) : null}
    </ComposerAttachment>
  );
}
