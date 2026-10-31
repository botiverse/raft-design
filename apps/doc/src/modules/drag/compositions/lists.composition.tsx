import { useCallback, useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Hash, Lock } from "lucide-react";
import {
  closestCenter,
  DndContext,
  MeasuringStrategy,
  pointerWithin,
  useDroppable,
} from "@dnd-kit/core";
import type { CollisionDetection } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SidebarItem,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemIcon,
  SidebarItemTitle,
  SidebarList,
  SidebarRoot,
  SidebarSection,
  SidebarSectionChevron,
  SidebarSectionCount,
  SidebarSectionDisclosure,
  SidebarSectionHeader,
  SidebarSectionTitle,
} from "@botiverse/raft-ui";
import {
  DragLift,
  DragLiveRegion,
  DragRemeasure,
  DraggedSlot,
  dragListStrategy,
  useDragAnnouncer,
  useDragLists,
  useDragSensors,
  useDragSiblingTransition,
} from "@botiverse/raft-ui/wip";
import type { DragListsItems } from "@botiverse/raft-ui/wip";

type Section = "pinned" | "channels";

const SECTIONS = ["pinned", "channels"] as const;
const SECTION_NAME: Record<Section, string> = { pinned: "Pinned", channels: "Channels" };
const PRIVATE = new Set(["launch-week", "hiring"]);
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };
const INITIAL: DragListsItems<Section> = {
  pinned: ["launch-week", "design"],
  channels: ["general", "release-notes", "hiring", "research"],
};

/** A row wins over the section it sits in; by keyboard (no pointer), the closest row. */
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  if (hits.length > 0) {
    const row = hits.find((hit) => !SECTIONS.includes(hit.id as Section));
    return row ? [row] : [hits[0]!];
  }
  return closestCenter(args);
};

const channelName = (id: string) => `#${id}`;
const sectionName = (section: Section) => SECTION_NAME[section];

export function ListsContent() {
  const [items, setItems] = useState(INITIAL);
  const [selected, setSelected] = useState("launch-week");
  const { message, announce } = useDragAnnouncer();
  const lists = useDragLists({
    lists: SECTIONS,
    items,
    onItemsChange: setItems,
    listName: sectionName,
    itemName: channelName,
    collisionDetection: collision,
    announce,
  });
  const sensors = useDragSensors({ coordinateGetter: lists.coordinateGetter });
  const into = lists.activeId ? lists.listOf(items, lists.activeId) : null;

  return (
    <SidebarRoot className="w-64 py-1">
      <DndContext
        sensors={sensors}
        collisionDetection={lists.collisionDetection}
        measuring={MEASURING}
        autoScroll={false}
        accessibility={lists.accessibility}
        {...lists.handlers}
      >
        <DragRemeasure version={items} />
        {SECTIONS.map((section) => (
          <ChannelSection
            key={section}
            section={section}
            ids={items[section]}
            into={into === section && lists.originList !== section}
          >
            {items[section].map((id) => (
              <ChannelRow
                key={id}
                id={id}
                selected={selected === id}
                isHome={lists.isHome}
                onSelect={setSelected}
              />
            ))}
          </ChannelSection>
        ))}
        <DragLift>
          {lists.activeId ? (
            <Channel id={lists.activeId} selected={selected === lists.activeId} />
          ) : null}
        </DragLift>
      </DndContext>
      <DragLiveRegion message={message} />
    </SidebarRoot>
  );
}

function ChannelSection({
  section,
  ids,
  into,
  children,
}: {
  section: Section;
  ids: readonly string[];
  into: boolean;
  children: ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: section });
  return (
    <SidebarSection>
      <SidebarSectionHeader>
        <SidebarSectionDisclosure type="button">
          <SidebarSectionChevron />
          <SidebarSectionTitle>{SECTION_NAME[section]}</SidebarSectionTitle>
          <SidebarSectionCount>{ids.length}</SidebarSectionCount>
        </SidebarSectionDisclosure>
      </SidebarSectionHeader>
      <SidebarList>
        <SortableContext id={section} items={ids as string[]} strategy={dragListStrategy}>
          <div
            ref={setNodeRef}
            data-drag-into={into ? "" : undefined}
            className="min-h-8 rounded-control"
          >
            {children}
          </div>
        </SortableContext>
      </SidebarList>
    </SidebarSection>
  );
}

function ChannelRow({
  id,
  selected,
  isHome,
  onSelect,
}: {
  id: string;
  selected: boolean;
  isHome: (id: string, index: number) => boolean;
  onSelect: (id: string) => void;
}) {
  const siblingTransition = useDragSiblingTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, index, overIndex } =
    useSortable({ id, transition: siblingTransition });
  const handleClick = useCallback(() => onSelect(id), [id, onSelect]);
  const style = useMemo(
    () => ({ transform: CSS.Translate.toString(transform), transition }),
    [transform, transition],
  );
  return (
    <div ref={setNodeRef} style={style}>
      <DraggedSlot dragging={isDragging} home={isHome(id, overIndex >= 0 ? overIndex : index)}>
        <Channel id={id} selected={selected} onClick={handleClick} {...attributes} {...listeners} />
      </DraggedSlot>
    </div>
  );
}

function Channel({
  id,
  selected,
  ...props
}: { id: string; selected: boolean } & Omit<
  ComponentProps<typeof SidebarItem>,
  "children" | "id"
>) {
  return (
    <SidebarItem active={selected} {...props}>
      <SidebarItemIcon aria-hidden>
        <SidebarItemChannelIcon>{PRIVATE.has(id) ? <Lock /> : <Hash />}</SidebarItemChannelIcon>
      </SidebarItemIcon>
      <SidebarItemContent>
        <SidebarItemTitle>{id}</SidebarItemTitle>
      </SidebarItemContent>
    </SidebarItem>
  );
}
