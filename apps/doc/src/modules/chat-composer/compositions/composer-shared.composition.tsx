import { X } from "lucide-react";
import { Spinner } from "raft-ui";
import {
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
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
  FilePreviewMedia,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";

type AttachmentState = "uploaded" | "uploading" | "failed";

export function ComposerAttachmentsComposition({
  imageStates = ["uploading"],
  fileStates = ["uploaded", "failed"],
  onRemove,
  onRetry,
}: {
  imageStates?: readonly AttachmentState[];
  fileStates?: readonly AttachmentState[];
  onRemove?: (name: string) => void;
  onRetry?: (name: string) => void;
} = {}) {
  const imageNames = {
    uploaded: "screenshot.png",
    uploading: "uploading-screenshot.png",
    failed: "failed-screenshot.png",
  } as const;
  const fileNames = {
    uploading: "uploading-notes.pdf",
    failed: "failed-upload.pdf",
  } as const;
  const uploadedFileNames = [
    "release-notes.pdf",
    "design-spec.pdf",
    "research-notes.pdf",
    "api-contract.pdf",
  ];
  const files = fileStates.map((state, index) => {
    const uploadedIndex = fileStates
      .slice(0, index)
      .filter((candidate) => candidate === "uploaded").length;

    return {
      state,
      name:
        state === "uploaded"
          ? (uploadedFileNames[uploadedIndex] ?? `attachment-${uploadedIndex + 1}.pdf`)
          : fileNames[state],
    };
  });

  return (
    <ComposerAttachments>
      {imageStates.map((state) => {
        const name = imageNames[state];

        return (
          <ComposerAttachment key={name}>
            <ComposerAttachmentImage>
              <FilePreview>
                <FilePreviewMedia className="!shadow-none !ring-0">
                  <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
                </FilePreviewMedia>
              </FilePreview>
            </ComposerAttachmentImage>
            {state === "uploading" ? (
              <>
                <ComposerAttachmentUploadingOverlay>
                  <Spinner size="sm" className="mb-1" />
                  64%
                </ComposerAttachmentUploadingOverlay>
                <ComposerAttachmentUploadProgressBar value={64} />
              </>
            ) : null}
            {state === "failed" ? (
              <ComposerAttachmentFailedOverlay
                render={<button type="button" disabled={!onRetry} />}
                onClick={() => onRetry?.(name)}
              >
                <span>Upload failed</span>
                <span className="underline underline-offset-2">Retry</span>
              </ComposerAttachmentFailedOverlay>
            ) : null}
            <ComposerAttachmentRemove
              aria-label={`Remove ${name}`}
              disabled={!onRemove}
              onClick={() => onRemove?.(name)}
            >
              <X />
            </ComposerAttachmentRemove>
          </ComposerAttachment>
        );
      })}
      {files.map(({ name, state }) => {
        return (
          <ComposerAttachment key={name}>
            <ComposerAttachmentFile>
              <FilePreview className="h-[46px]">
                <FilePreviewDocument
                  className={state === "uploading" ? "h-[46px] !shadow-none !ring-0" : "h-[46px]"}
                />
                <FilePreviewBadge className={state === "uploading" ? "!shadow-none" : undefined}>
                  PDF
                </FilePreviewBadge>
              </FilePreview>
              <ComposerAttachmentBody>
                <ComposerAttachmentTitle>{name}</ComposerAttachmentTitle>
                <ComposerAttachmentMeta>18 KB</ComposerAttachmentMeta>
              </ComposerAttachmentBody>
              {state === "uploading" ? (
                <>
                  <ComposerAttachmentUploadingOverlay>
                    <Spinner size="sm" className="mb-1" />
                    64%
                  </ComposerAttachmentUploadingOverlay>
                  <ComposerAttachmentUploadProgressBar value={64} />
                </>
              ) : null}
            </ComposerAttachmentFile>
            {state === "failed" ? (
              <ComposerAttachmentFailedOverlay
                render={<button type="button" disabled={!onRetry} />}
                onClick={() => onRetry?.(name)}
              >
                <span>Upload failed</span>
                <span className="underline underline-offset-2">Retry</span>
              </ComposerAttachmentFailedOverlay>
            ) : null}
            <ComposerAttachmentRemove
              aria-label={`Remove ${name}`}
              disabled={!onRemove}
              onClick={() => onRemove?.(name)}
            >
              <X />
            </ComposerAttachmentRemove>
          </ComposerAttachment>
        );
      })}
    </ComposerAttachments>
  );
}
