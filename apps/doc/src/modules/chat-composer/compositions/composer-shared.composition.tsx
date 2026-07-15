import { X } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFailedOverlay,
  ComposerAttachmentFile,
  ComposerAttachmentImage,
  ComposerAttachmentMeta,
  ComposerAttachmentProgress,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerAttachmentTitle,
  ComposerAttachmentUploadingOverlay,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";

export function ComposerAttachmentsComposition({
  image = true,
  file = true,
  fileCount,
  failed = true,
  onRemove,
  onRetry,
}: {
  image?: boolean;
  file?: boolean;
  fileCount?: number;
  failed?: boolean;
  onRemove?: (name: string) => void;
  onRetry?: (name: string) => void;
} = {}) {
  const maxFileCount = 10 - Number(image) - Number(failed);
  const files = Array.from(
    { length: Math.min(fileCount ?? Number(file), maxFileCount) },
    (_, index) => ({
      name: index === 0 ? "release-notes.pdf" : `attachment-${index + 1}.pdf`,
      size: index === 0 ? "18 KB" : `${12 + index * 7} KB`,
    }),
  );

  return (
    <ComposerAttachments>
      {image ? (
        <ComposerAttachment>
          <ComposerAttachmentImage alt="" src={COMPOSER_IMAGE_SRC} />
          <ComposerAttachmentUploadingOverlay>
            <Spinner size="sm" />
            64%
          </ComposerAttachmentUploadingOverlay>
          <ComposerAttachmentProgress aria-label="Upload progress for screenshot.png" value={64} />
          <ComposerAttachmentRemove
            aria-label="Remove screenshot.png"
            disabled={!onRemove}
            onClick={() => onRemove?.("screenshot.png")}
          >
            <X />
          </ComposerAttachmentRemove>
        </ComposerAttachment>
      ) : null}
      {files.map((item) => (
        <ComposerAttachment key={item.name}>
          <ComposerAttachmentFile>
            <FilePreview>
              <FilePreviewDocument className="rounded-none rounded-tr-[15%]">
                <FilePreviewBadge>PDF</FilePreviewBadge>
              </FilePreviewDocument>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>{item.name}</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>{item.size}</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          <ComposerAttachmentRemove
            aria-label={`Remove ${item.name}`}
            disabled={!onRemove}
            onClick={() => onRemove?.(item.name)}
          >
            <X />
          </ComposerAttachmentRemove>
        </ComposerAttachment>
      ))}
      {failed ? (
        <ComposerAttachment>
          <ComposerAttachmentFile>
            <FilePreview>
              <FilePreviewDocument className="rounded-none rounded-tr-[15%]">
                <FilePreviewBadge>KEY</FilePreviewBadge>
              </FilePreviewDocument>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>deck.key</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>1.2 MB</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          <ComposerAttachmentFailedOverlay
            render={<button type="button" disabled={!onRetry} />}
            onClick={() => onRetry?.("deck.key")}
          >
            Upload failed
            <span className="underline">Tap to retry</span>
          </ComposerAttachmentFailedOverlay>
        </ComposerAttachment>
      ) : null}
    </ComposerAttachments>
  );
}
