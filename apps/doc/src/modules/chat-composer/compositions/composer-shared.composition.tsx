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
  SortableComposerAttachment,
  SortableComposerAttachmentsScroll,
} from "raft-ui/wip";
import { useEffect, useMemo, useState } from "react";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";

type AttachmentState = "uploaded" | "uploading" | "failed";

type AttachmentDescriptor = {
  id: string;
  name: string;
  kind: "image" | "file";
  state: AttachmentState;
};

function buildDescriptors(
  imageStates: readonly AttachmentState[],
  fileStates: readonly AttachmentState[],
): AttachmentDescriptor[] {
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

  const images: AttachmentDescriptor[] = imageStates.map((state) => ({
    id: `image:${imageNames[state]}`,
    name: imageNames[state],
    kind: "image",
    state,
  }));

  const files: AttachmentDescriptor[] = fileStates.map((state, index) => {
    const uploadedIndex = fileStates
      .slice(0, index)
      .filter((candidate) => candidate === "uploaded").length;
    const name =
      state === "uploaded"
        ? (uploadedFileNames[uploadedIndex] ?? `attachment-${uploadedIndex + 1}.pdf`)
        : fileNames[state];

    return {
      id: `file:${name}:${index}`,
      name,
      kind: "file",
      state,
    };
  });

  return [...images, ...files];
}

export function ComposerAttachmentsComposition({
  imageStates = ["uploading"],
  fileStates = ["uploaded", "failed"],
  onRemove,
  onRetry,
  layout = "wrap",
}: {
  imageStates?: readonly AttachmentState[];
  fileStates?: readonly AttachmentState[];
  onRemove?: (name: string) => void;
  onRetry?: (name: string) => void;
  /**
   * `wrap` — plain flex strip (states / limit demos).
   * `scroll` — sortable single-row strip with arrows.
   * `items` — bare tiles for a parent that owns the shell.
   */
  layout?: "wrap" | "scroll" | "items";
} = {}) {
  const descriptors = useMemo(
    () => buildDescriptors(imageStates, fileStates),
    [fileStates, imageStates],
  );

  // Plain wrap: no DnD — attachment-state demos must not pay sortable layout cost.
  if (layout === "wrap") {
    return (
      <ComposerAttachments>
        {descriptors.map((attachment) => (
          <AttachmentTile
            key={attachment.id}
            attachment={attachment}
            onRemove={onRemove}
            onRetry={onRetry}
          />
        ))}
      </ComposerAttachments>
    );
  }

  if (layout === "items") {
    return descriptors.map((attachment) => (
      <AttachmentTile
        key={attachment.id}
        attachment={attachment}
        onRemove={onRemove}
        onRetry={onRetry}
      />
    ));
  }

  return (
    <ScrollableSortableAttachments
      descriptors={descriptors}
      onRemove={onRemove}
      onRetry={onRetry}
    />
  );
}

function ScrollableSortableAttachments({
  descriptors,
  onRemove,
  onRetry,
}: {
  descriptors: readonly AttachmentDescriptor[];
  onRemove?: (name: string) => void;
  onRetry?: (name: string) => void;
}) {
  const [ids, setIds] = useState(() => descriptors.map((item) => item.id));

  useEffect(() => {
    setIds(descriptors.map((item) => item.id));
  }, [descriptors]);

  const byId = new Map(descriptors.map((item) => [item.id, item]));
  const ordered = ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });

  return (
    <ComposerAttachments>
      <SortableComposerAttachmentsScroll items={ids} onReorder={setIds}>
        {ordered.map((attachment) => (
          <SortableComposerAttachment
            key={attachment.id}
            id={attachment.id}
            label={attachment.name}
          >
            <AttachmentTile attachment={attachment} onRemove={onRemove} onRetry={onRetry} />
          </SortableComposerAttachment>
        ))}
      </SortableComposerAttachmentsScroll>
    </ComposerAttachments>
  );
}

function AttachmentTile({
  attachment,
  onRemove,
  onRetry,
}: {
  attachment: AttachmentDescriptor;
  onRemove?: (name: string) => void;
  onRetry?: (name: string) => void;
}) {
  const { name, state } = attachment;

  if (attachment.kind === "image") {
    return (
      <ComposerAttachment>
        <ComposerAttachmentImage>
          <FilePreview>
            <FilePreviewMedia>
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
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onRemove?.(name)}
        >
          <X />
        </ComposerAttachmentRemove>
      </ComposerAttachment>
    );
  }

  return (
    <ComposerAttachment>
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
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onRemove?.(name)}
      >
        <X />
      </ComposerAttachmentRemove>
    </ComposerAttachment>
  );
}
