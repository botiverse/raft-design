import { X } from "lucide-react";
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
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";

export type ReorderAttachment = {
  id: string;
  kind: "image" | "file";
  name: string;
};

export const WRAP_REORDER_ATTACHMENTS: readonly ReorderAttachment[] = [
  { id: "shot", kind: "image", name: "screenshot.png" },
  { id: "release", kind: "file", name: "release-notes.pdf" },
  { id: "design", kind: "file", name: "design-spec.pdf" },
  { id: "research", kind: "file", name: "research-notes.pdf" },
  { id: "api", kind: "file", name: "api-contract.pdf" },
];

export const SCROLL_REORDER_ATTACHMENTS: readonly ReorderAttachment[] = [
  { id: "shot", kind: "image", name: "screenshot.png" },
  { id: "release", kind: "file", name: "release-notes.pdf" },
  { id: "design", kind: "file", name: "design-spec.pdf" },
  { id: "research", kind: "file", name: "research-notes.pdf" },
  { id: "api", kind: "file", name: "api-contract.pdf" },
  { id: "brief", kind: "file", name: "product-brief.pdf" },
  { id: "audit", kind: "file", name: "audit-log.pdf" },
  { id: "plan", kind: "file", name: "rollout-plan.pdf" },
  { id: "qa", kind: "file", name: "qa-checklist.pdf" },
  { id: "notes", kind: "file", name: "meeting-notes.pdf" },
];

export function reorderAttachmentsByIds(
  items: readonly ReorderAttachment[],
  nextIds: readonly string[],
): ReorderAttachment[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return nextIds.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

export function ReorderAttachmentTile({
  attachment,
  onRemove,
}: {
  attachment: ReorderAttachment;
  onRemove?: (id: string) => void;
}) {
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
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onRemove(attachment.id)}
        >
          <X />
        </ComposerAttachmentRemove>
      ) : null}
    </ComposerAttachment>
  );
}
