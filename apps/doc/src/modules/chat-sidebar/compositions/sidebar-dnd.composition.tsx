import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Hash, Pin } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "raft-ui/cn";
import {
  ChatSidebarItem,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemContent,
  ChatSidebarItemTitle,
  ChatSidebarSection,
  ChatSidebarSectionEmpty,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui/wip";

const PINNED_DROP_TARGET_ID = "chat-sidebar-dnd:pinned";
const ROWS = [
  { id: "proj-uiux", label: "proj-uiux" },
  { id: "general", label: "general" },
  { id: "release", label: "release" },
] as const;

type RowId = (typeof ROWS)[number]["id"];
type DragSection = "pinned" | "channels";

export function ChatSidebarDndComposition() {
  const [pinnedIds, setPinnedIds] = useState<readonly RowId[]>(["proj-uiux"]);
  const [channelIds, setChannelIds] = useState<readonly RowId[]>(["general", "release"]);
  const [selectedRowId, setSelectedRowId] = useState<RowId>("proj-uiux");
  const [activeDrag, setActiveDrag] = useState<{ id: RowId; width?: number } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 10 } }),
  );
  const pinnedRows = getRows(pinnedIds);
  const pinnedIdSet = new Set(pinnedIds);
  const channelRows = getRows(channelIds.filter((id) => !pinnedIdSet.has(id)));

  function onDragStart({ active }: DragStartEvent) {
    const activeRow = parseDragId(String(active.id));
    if (!activeRow) return;
    setActiveDrag({ id: activeRow.id, width: active.rect.current.initial?.width });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveDrag(null);
    if (!over || active.id === over.id) return;
    const activeRow = parseDragId(String(active.id));
    if (!activeRow) return;
    const overId = String(over.id);
    const overRow = parseDragId(overId);

    if (activeRow.section === "pinned" && overRow?.section === "pinned") {
      setPinnedIds((current) => reorder(current, activeRow.id, overRow.id));
      return;
    }

    if (overRow?.section === "pinned") {
      setPinnedIds((current) =>
        current.includes(activeRow.id) ? current : insertBefore(current, activeRow.id, overRow.id),
      );
      return;
    }

    if (overId === PINNED_DROP_TARGET_ID) {
      setPinnedIds((current) =>
        current.includes(activeRow.id) ? current : [...current, activeRow.id],
      );
      return;
    }

    if (activeRow.section === "channels" && overRow?.section === "channels") {
      setChannelIds((current) => reorder(current, activeRow.id, overRow.id));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragCancel={() => setActiveDrag(null)}
      onDragEnd={onDragEnd}
    >
      <div className="w-72">
        <ChatSidebarSection>
          <ChatSidebarSectionHeader>
            <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
          </ChatSidebarSectionHeader>
          <PinnedDropTarget>
            {pinnedRows.length === 0 ? (
              <ChatSidebarSectionEmpty>Drag channels here to pin</ChatSidebarSectionEmpty>
            ) : (
              <SortableChatSidebarList items={pinnedRows.map((row) => dragId("pinned", row.id))}>
                {pinnedRows.map((row) => (
                  <SortableChatSidebarItem key={row.id} id={dragId("pinned", row.id)}>
                    <SidebarRow
                      row={row}
                      pinned
                      selected={selectedRowId === row.id}
                      onSelect={setSelectedRowId}
                    />
                  </SortableChatSidebarItem>
                ))}
              </SortableChatSidebarList>
            )}
          </PinnedDropTarget>
        </ChatSidebarSection>

        <ChatSidebarSection>
          <ChatSidebarSectionHeader>
            <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
          </ChatSidebarSectionHeader>
          <SortableChatSidebarList items={channelRows.map((row) => dragId("channels", row.id))}>
            {channelRows.map((row) => (
              <SortableChatSidebarItem key={row.id} id={dragId("channels", row.id)}>
                <SidebarRow
                  row={row}
                  pinned={false}
                  selected={selectedRowId === row.id}
                  onSelect={setSelectedRowId}
                />
              </SortableChatSidebarItem>
            ))}
          </SortableChatSidebarList>
        </ChatSidebarSection>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <SidebarRow
            row={ROWS.find((row) => row.id === activeDrag.id)!}
            pinned={pinnedIdSet.has(activeDrag.id)}
            selected={selectedRowId === activeDrag.id}
            onSelect={setSelectedRowId}
            style={{ width: activeDrag.width }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function PinnedDropTarget({ children }: { children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: PINNED_DROP_TARGET_ID });
  return (
    <div ref={setNodeRef} className={cn(isOver && "bg-ink-5")}>
      {children}
    </div>
  );
}

function SidebarRow({
  row,
  pinned,
  selected,
  onSelect,
  style,
}: {
  row: (typeof ROWS)[number];
  pinned: boolean;
  selected: boolean;
  onSelect: (rowId: RowId) => void;
  style?: CSSProperties;
}) {
  return (
    <ChatSidebarItem
      active={selected}
      className="w-full"
      onClick={() => onSelect(row.id)}
      style={style}
    >
      <ChatSidebarItemChannelIcon aria-hidden>
        <Hash />
      </ChatSidebarItemChannelIcon>
      <ChatSidebarItemContent>
        <ChatSidebarItemTitle>#{row.label}</ChatSidebarItemTitle>
      </ChatSidebarItemContent>
      {pinned ? <Pin aria-label="Pinned" /> : null}
    </ChatSidebarItem>
  );
}

function dragId(section: DragSection, rowId: RowId) {
  return `${section}:${rowId}`;
}

function parseDragId(value: string): { section: DragSection; id: RowId } | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) return null;
  const section = value.slice(0, separator);
  const id = value.slice(separator + 1);
  if ((section !== "pinned" && section !== "channels") || !ROWS.some((row) => row.id === id)) {
    return null;
  }
  return { section, id: id as RowId };
}

function getRows(ids: readonly RowId[]) {
  return ids
    .map((id) => ROWS.find((row) => row.id === id))
    .filter((row): row is (typeof ROWS)[number] => row != null);
}

function reorder(ids: readonly RowId[], activeId: RowId, overId: RowId) {
  const oldIndex = ids.indexOf(activeId);
  const newIndex = ids.indexOf(overId);
  return oldIndex === -1 || newIndex === -1 ? ids : arrayMove([...ids], oldIndex, newIndex);
}

function insertBefore(ids: readonly RowId[], rowId: RowId, targetRowId: RowId) {
  const targetIndex = ids.indexOf(targetRowId);
  return targetIndex === -1
    ? [...ids, rowId]
    : [...ids.slice(0, targetIndex), rowId, ...ids.slice(targetIndex)];
}
