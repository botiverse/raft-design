import { DragOverlay, type Modifier } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, type SortingStrategy } from "@dnd-kit/sortable";
import { X } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
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

export const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

/**
 * Live-reorder helper for mixed-width flex tiles.
 * Tabs can transform in place (similar sizes); attachments cannot — sibling
 * translate math fights flex packing and leaves items overlapped after drop.
 */
export function reorderAttachmentsOnDragOver(
  items: ReorderAttachment[],
  activeId: string | number,
  overId: string | number,
): ReorderAttachment[] {
  const oldIndex = items.findIndex((item) => item.id === activeId);
  const newIndex = items.findIndex((item) => item.id === overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return items;
  return arrayMove(items, oldIndex, newIndex);
}

/**
 * Sized placeholder stays in the flex flow (opacity 0). DragOverlay is the
 * pointer ghost. No dnd-kit transform — DOM order owns layout.
 */
export function SortableComposerAttachment({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });
  const style: CSSProperties = {
    opacity: isDragging ? 0 : undefined,
    zIndex: isDragging ? 0 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      aria-label={`Reorder ${label}`}
      className="w-max max-w-full shrink-0 cursor-grab touch-none active:cursor-grabbing"
      data-dragging={isDragging ? "true" : undefined}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
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

export function ComposerAttachmentsSortableList({
  attachments,
  strategy,
  activeId,
  onRemove,
  overlayModifiers,
}: {
  attachments: readonly ReorderAttachment[];
  strategy: SortingStrategy;
  activeId: string | null;
  onRemove: (id: string) => void;
  overlayModifiers?: Modifier[];
}) {
  const ids = attachments.map((attachment) => attachment.id);
  const activeAttachment = attachments.find((attachment) => attachment.id === activeId) ?? null;

  return (
    <>
      <SortableContext items={ids} strategy={strategy}>
        {attachments.map((attachment) => (
          <SortableComposerAttachment
            key={attachment.id}
            id={attachment.id}
            label={attachment.name}
          >
            <ReorderAttachmentTile attachment={attachment} onRemove={onRemove} />
          </SortableComposerAttachment>
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={null} modifiers={overlayModifiers}>
        {activeAttachment ? (
          <div className="cursor-grabbing">
            <ReorderAttachmentTile attachment={activeAttachment} />
          </div>
        ) : null}
      </DragOverlay>
    </>
  );
}
