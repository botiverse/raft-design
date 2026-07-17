import { X } from "lucide-react";
import { Spinner } from "raft-ui";
import {
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFailedOverlay,
  ComposerAttachmentFile,
  ComposerAttachmentMeta,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerAttachmentTitle,
  ComposerAttachmentUploadingOverlay,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
  FilePreviewMedia,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";

export function ComposerAttachmentsComposition({
  image = true,
  file = true,
  fileCount,
  fileUploading = false,
  failed = true,
  onRemove,
  onRetry,
}: {
  image?: boolean;
  file?: boolean;
  fileCount?: number;
  fileUploading?: boolean;
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
          <ComposerAttachmentFile>
            <FilePreview>
              <FilePreviewMedia>
                <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
              </FilePreviewMedia>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>screenshot.png</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>image/png</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          <ComposerAttachmentUploadingOverlay>
            <Spinner size="sm" />
            64%
          </ComposerAttachmentUploadingOverlay>
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
              <FilePreviewDocument className="rounded-none rounded-tr-[15%]" />
              <FilePreviewBadge>PDF</FilePreviewBadge>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>{item.name}</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>{item.size}</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          {fileUploading ? (
            <ComposerAttachmentUploadingOverlay>
              <Spinner size="sm" />
              64%
            </ComposerAttachmentUploadingOverlay>
          ) : null}
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
              <FilePreviewDocument className="rounded-none rounded-tr-[15%]" />
              <FilePreviewBadge>KEY</FilePreviewBadge>
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
