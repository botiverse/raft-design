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
  failed = true,
  onRemove,
  onRetry,
}: {
  image?: boolean;
  file?: boolean;
  failed?: boolean;
  onRemove?: (name: string) => void;
  onRetry?: (name: string) => void;
} = {}) {
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
      {file ? (
        <ComposerAttachment>
          <ComposerAttachmentFile>
            <FilePreview>
              <FilePreviewDocument>
                <FilePreviewBadge>PDF</FilePreviewBadge>
              </FilePreviewDocument>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>release-notes.pdf</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>18 KB</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          <ComposerAttachmentRemove
            aria-label="Remove release-notes.pdf"
            disabled={!onRemove}
            onClick={() => onRemove?.("release-notes.pdf")}
          >
            <X />
          </ComposerAttachmentRemove>
        </ComposerAttachment>
      ) : null}
      {failed ? (
        <ComposerAttachment>
          <ComposerAttachmentFile>
            <FilePreview>
              <FilePreviewDocument>
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
