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
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { Paperclip, Send } from "lucide-react";
import {
  ComposerActions,
  ComposerAttachments,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "raft-ui/wip";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

import {
  ComposerAttachmentsSortableList,
  WRAP_REORDER_ATTACHMENTS,
  reorderAttachmentsOnDragOver,
  type ReorderAttachment,
} from "./composer-attachments-reorder-shared.tsx";

export function ComposerAttachmentsReorderComposition() {
  const dndContextId = useId();
  const [attachments, setAttachments] = useState<ReorderAttachment[]>([
    ...WRAP_REORDER_ATTACHMENTS,
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
        autoScroll={false}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={clearDrag}
        onDragEnd={handleDragEnd}
      >
        <ComposerAttachments>
          <ComposerAttachmentsSortableList
            attachments={attachments}
            strategy={rectSortingStrategy}
            activeId={activeId}
            onRemove={(id) => setAttachments((items) => items.filter((item) => item.id !== id))}
          />
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
