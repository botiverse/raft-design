import {
  useCallback,
  useMemo,
  type ComponentType,
  type CSSProperties,
  type RefObject,
} from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Horizontal tab strip with drag-to-reorder. The source uses @dnd-kit sensors
// and sortable transforms; this keeps that interaction contract while moving the
// styling into tv slots for theme expansion.
const panelTabs = tv({
  slots: {
    root: [
      "overflow-x-auto border-b-2 border-black bg-white",
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ],
    list: ["flex min-w-max"],
    tab: [
      "flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap px-4 py-1.5",
      "border-r-2 text-xs font-bold transition-colors",
    ],
    icon: ["shrink-0"],
    label: "",
  },
  variants: {
    theme: {
      brutal: {
        tab: ["border-black"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    active: {
      true: {
        tab: "bg-brutal-yellow",
      },
      false: {
        tab: "bg-white hover:bg-black/5",
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export type PanelTabItem<T extends string> = {
  id: T;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

// Pure reconciliation: apply a stored order, then append any tabs the order
// doesn't mention (new tabs) in their declared order.
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
): PanelTabItem<T>[] {
  return useMemo(() => reconcilePanelTabOrder(tabs, storedOrder), [tabs, storedOrder]);
}

export type ReorderablePanelTabsProps<T extends string> = {
  tabs: readonly PanelTabItem<T>[];
  activeTab: T;
  activeTabRef?: RefObject<HTMLButtonElement | null>;
  onSelectTab: (tab: T) => void;
  onReorderTabs: (tabs: T[]) => void;
};

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
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
  });
  const Icon = tab.icon;
  const { tab: tabSlot, icon, label } = panelTabs({ theme, active });
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;
  const style: CSSProperties = {
    transform: CSS.Transform.toString(horizontalTransform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <BaseButton
      ref={(node) => {
        setNodeRef(node);
        if (activeRef) activeRef.current = node instanceof HTMLButtonElement ? node : null;
      }}
      type="button"
      onClick={onClick}
      className={tabSlot()}
      style={style}
      data-testid={`panel-tab-${tab.id}`}
      {...attributes}
      {...listeners}
    >
      <Icon size={12} className={icon()} />
      <span className={label()}>{tab.label}</span>
    </BaseButton>
  );
}

export function ReorderablePanelTabs<T extends string>({
  tabs,
  activeTab,
  activeTabRef,
  onSelectTab,
  onReorderTabs,
}: ReorderablePanelTabsProps<T>) {
  const theme = useTheme();
  const tabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
  );
  const { root, list } = panelTabs({ theme });

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const activeId = String(active.id) as T;
      const overId = String(over.id) as T;
      const oldIndex = tabIds.indexOf(activeId);
      const newIndex = tabIds.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return;
      onReorderTabs(arrayMove(tabIds, oldIndex, newIndex));
    },
    [onReorderTabs, tabIds],
  );

  return (
    <div data-slot="reorderable-panel-tabs" className={root()}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
          <div className={list()}>
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
