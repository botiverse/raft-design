import { useId, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Paperclip, Send } from "lucide-react";
import {
  ComposerActions,
  ComposerAttachments,
  ComposerAttachmentsScrollArea,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "raft-ui/wip";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

import {
  ComposerAttachmentsSortableList,
  SCROLL_REORDER_ATTACHMENTS,
  reorderAttachmentsOnDragOver,
  restrictToHorizontalAxis,
  type ReorderAttachment,
} from "./composer-attachments-reorder-shared.tsx";

export function ComposerAttachmentsScrollReorderComposition() {
  const dndContextId = useId();
  const [attachments, setAttachments] = useState<ReorderAttachment[]>([
    ...SCROLL_REORDER_ATTACHMENTS,
  ]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    setAttachments((items) => reorderAttachmentsOnDragOver(items, active.id, over.id));
  };

  const clearDrag = () => {
    setActiveId(null);
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    clearDrag();
  };

  return (
    <ComposerRoot>
      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        autoScroll={{
          threshold: { x: 0.15, y: 0 },
          // Horizontal strip only — skip page / vertical scroll containers.
          canScroll: (element) => element.scrollWidth > element.clientWidth + 1,
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={clearDrag}
        onDragEnd={handleDragEnd}
      >
        <ComposerAttachments>
          <ComposerAttachmentsScrollArea>
            <ComposerAttachmentsSortableList
              attachments={attachments}
              strategy={horizontalListSortingStrategy}
              activeId={activeId}
              overlayModifiers={[restrictToHorizontalAxis]}
              onRemove={(id) => setAttachments((items) => items.filter((item) => item.id !== id))}
            />
          </ComposerAttachmentsScrollArea>
        </ComposerAttachments>
      </DndContext>
      <Composer>
        <ComposerInput aria-label="Message #proj-uiux" placeholder="Message #proj-uiux" readOnly />
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
