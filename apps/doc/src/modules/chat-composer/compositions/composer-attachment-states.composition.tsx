import { ImagePlus, Paperclip, Send, X } from "lucide-react";
import {
  ComposerActions,
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFailedOverlay,
  ComposerAttachmentFile,
  ComposerAttachmentImage,
  ComposerAttachmentMeta,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerAttachmentTitle,
  ComposerAttachmentUploadingOverlay,
  ComposerAttachmentUploadProgressBar,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
  FilePreviewMedia,
  Spinner,
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";

export function ComposerAttachmentStatesComposition() {
  return (
    <ComposerRoot>
      <ComposerAttachments>
        <ComposerAttachment>
          <ComposerAttachmentImage>
            <FilePreview>
              <FilePreviewMedia>
                <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
              </FilePreviewMedia>
            </FilePreview>
          </ComposerAttachmentImage>
          <ComposerAttachmentUploadingOverlay>
            <Spinner size="sm" className="mb-1" />
            64%
          </ComposerAttachmentUploadingOverlay>
          <ComposerAttachmentUploadProgressBar value={64} />
          <ComposerAttachmentRemove aria-label="Remove uploading-screenshot.png" disabled>
            <X />
          </ComposerAttachmentRemove>
        </ComposerAttachment>

        <ComposerAttachment>
          <ComposerAttachmentFile>
            <FilePreview className="h-[46px]">
              <FilePreviewDocument className="h-[46px]" />
              <FilePreviewBadge>PDF</FilePreviewBadge>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>release-notes.pdf</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>18 KB</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          <ComposerAttachmentRemove aria-label="Remove release-notes.pdf" disabled>
            <X />
          </ComposerAttachmentRemove>
        </ComposerAttachment>

        <ComposerAttachment>
          <ComposerAttachmentFile>
            <FilePreview className="h-[46px]">
              <FilePreviewDocument className="h-[46px]" />
              <FilePreviewBadge>PDF</FilePreviewBadge>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>failed-upload.pdf</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>18 KB</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          <ComposerAttachmentFailedOverlay render={<button type="button" disabled />}>
            <span>Upload failed</span>
            <span className="underline underline-offset-2">Retry</span>
          </ComposerAttachmentFailedOverlay>
          <ComposerAttachmentRemove aria-label="Remove failed-upload.pdf" disabled>
            <X />
          </ComposerAttachmentRemove>
        </ComposerAttachment>
      </ComposerAttachments>
      <Composer>
        <ComposerInput aria-label="Message #design" placeholder="Message #design" readOnly />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton aria-label="Attach image" disabled>
              <ImagePlus />
            </ComposerIconButton>
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
