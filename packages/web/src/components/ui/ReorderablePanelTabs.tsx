import { useCallback, useMemo, type ComponentType, type RefObject } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface PanelTabItem<T extends string> {
  id: T;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

function reconcilePanelTabOrder<T extends string>(
  tabs: readonly PanelTabItem<T>[],
  order: readonly string[],
): PanelTabItem<T>[] {
  const byId = new Map(tabs.map((tab) => [tab.id, tab]));
  const next: PanelTabItem<T>[] = [];
  const seen = new Set<string>();

  for (const id of order) {
    const tab = byId.get(id as T);
    if (!tab || seen.has(tab.id)) continue;
    next.push(tab);
    seen.add(tab.id);
  }

  for (const tab of tabs) {
    if (seen.has(tab.id)) continue;
    next.push(tab);
    seen.add(tab.id);
  }

  return next;
}

export function useOrderedPanelTabs<T extends string>(
  tabs: readonly PanelTabItem<T>[],
  storedOrder: readonly string[],
) {
  return useMemo(() => reconcilePanelTabOrder(tabs, storedOrder), [tabs, storedOrder]);
}

function SortablePanelTab<T extends string>({
  tab,
  active,
  activeRef,
  onClick,
}: {
  tab: PanelTabItem<T>;
  active: boolean;
  activeRef?: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });
  const Icon = tab.icon;
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;
  const style = {
    transform: CSS.Transform.toString(horizontalTransform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <button
      ref={(node) => {
        setNodeRef(node);
        if (activeRef) activeRef.current = node;
      }}
      type="button"
      onClick={onClick}
      className={`flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap border-r-2 border-black px-4 py-1.5 text-xs font-bold transition-colors ${
        active ? "bg-brutal-yellow" : "bg-white hover:bg-black/5"
      }`}
      style={style}
      data-testid={`panel-tab-${tab.id}`}
      {...attributes}
      {...listeners}
    >
      <Icon size={12} />
      <span>{tab.label}</span>
    </button>
  );
}

export default function ReorderablePanelTabs<T extends string>({
  tabs,
  activeTab,
  activeTabRef,
  onSelectTab,
  onReorderTabs,
}: {
  tabs: readonly PanelTabItem<T>[];
  activeTab: T;
  activeTabRef?: RefObject<HTMLButtonElement | null>;
  onSelectTab: (tab: T) => void;
  onReorderTabs: (tabs: T[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
  );

  const tabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const activeId = String(active.id) as T;
    const overId = String(over.id) as T;
    const oldIndex = tabIds.indexOf(activeId);
    const newIndex = tabIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorderTabs(arrayMove(tabIds, oldIndex, newIndex));
  }, [onReorderTabs, tabIds]);

  return (
    <div className="overflow-x-auto border-b-2 border-black bg-white scrollbar-none">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <SortablePanelTab
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                activeRef={activeTab === tab.id ? activeTabRef : undefined}
                onClick={() => onSelectTab(tab.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
