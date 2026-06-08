import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import {
  closestCenter,
  DndContext,
  DragOverlay,
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
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const tabs = tv({
  slots: {
    root: ["w-full"],
    list: [
      "flex w-max max-w-full overflow-x-auto border-l-2 border-t-2 border-b-2 bg-white",
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ],
    tab: [
      "relative flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap px-4 py-1.5",
      "border-r-2 text-xs font-bold transition-colors",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
    ],
    label: [""],
    panel: ["outline-none"],
    indicator: [""],
  },
  variants: {
    theme: {
      brutal: {
        list: ["border-black"],
        tab: [
          "border-black bg-white hover:bg-black/5",
          "data-[active]:bg-brutal-yellow data-[active]:hover:bg-brutal-yellow",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
          "data-[dragging-source=true]:opacity-0",
          "data-[overlay=true]:z-20 data-[overlay=true]:cursor-grabbing data-[overlay=true]:[outline:2px_solid_oklch(0_0_0)] data-[overlay=true]:[outline-offset:-2px]",
        ],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

type TabsReorderContextValue = {
  enabled: boolean;
};

const TabsReorderContext = createContext<TabsReorderContextValue>({ enabled: false });
const TabsValueContext = createContext<string | undefined>(undefined);

const REORDER_ENABLED_CONTEXT = { enabled: true } as const satisfies TabsReorderContextValue;

export type TabsProps<T extends string = string> = StyledProps<
  Omit<BaseTabs.Root.Props, "defaultValue" | "onValueChange" | "value">
> &
  Omit<VariantProps<typeof tabs>, "theme"> & {
    value?: T;
    defaultValue?: T;
    onValueChange?: (value: T, eventDetails: BaseTabs.Root.ChangeEventDetails) => void;
  };

export function Tabs<T extends string = string>({
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: TabsProps<T>) {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const resolvedValue = value ?? uncontrolledValue;
  const { root } = tabs();

  return (
    <TabsValueContext.Provider value={resolvedValue == null ? undefined : String(resolvedValue)}>
      <BaseTabs.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={(nextValue, eventDetails) => {
          if (nextValue == null) return;
          const typedValue = String(nextValue) as T;
          if (value === undefined) setUncontrolledValue(typedValue);
          onValueChange?.(typedValue, eventDetails);
        }}
        data-slot="tabs"
        className={root({ className })}
        {...props}
      />
    </TabsValueContext.Provider>
  );
}

export type TabsListProps = StyledProps<BaseTabs.List.Props>;

export function TabsList({ className, ...props }: TabsListProps) {
  const theme = useTheme();
  const { list } = tabs({ theme });
  return <BaseTabs.List data-slot="tabs-list" className={list({ className })} {...props} />;
}

export type SortableTabsListProps<T extends string = string> = TabsListProps & {
  value: readonly T[];
  onReorder: (value: T[]) => void;
};

export function SortableTabsList<T extends string = string>({
  value,
  onReorder,
  children,
  ...props
}: SortableTabsListProps<T>) {
  const activeValue = use(TabsValueContext);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
  );
  const tabIds = useMemo(() => value.map(String), [value]);
  const overlayTab = useMemo(
    () => getSortableTabOverlayItem(children, activeId, activeValue),
    [activeId, activeValue, children],
  );
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      if (!over || active.id === over.id) return;
      const oldIndex = tabIds.indexOf(String(active.id));
      const newIndex = tabIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onReorder(arrayMove([...value], oldIndex, newIndex) as T[]);
    },
    [onReorder, tabIds, value],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
        <TabsReorderContext.Provider value={REORDER_ENABLED_CONTEXT}>
          <TabsList {...props}>{children}</TabsList>
        </TabsReorderContext.Provider>
      </SortableContext>
      <DragOverlay adjustScale={false} dropAnimation={null}>
        {overlayTab ? (
          <TabsTabVisual active={overlayTab.active} className={overlayTab.className} overlay>
            {overlayTab.children}
          </TabsTabVisual>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export type TabsTabProps<T extends string = string> = StyledProps<BaseTabs.Tab.Props> & {
  value: T;
};

export function TabsTab<T extends string = string>({ value, ...props }: TabsTabProps<T>) {
  return <TabsTabButton value={value} {...props} />;
}

export type SortableTabsTabProps<T extends string = string> = TabsTabProps<T>;

export function SortableTabsTab<T extends string = string>({
  value,
  ...props
}: SortableTabsTabProps<T>) {
  const reorder = use(TabsReorderContext);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: value,
    disabled: !reorder.enabled,
  });

  if (!reorder.enabled) {
    return <TabsTabButton value={value} {...props} />;
  }

  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;
  const baseStyle = typeof props.style === "function" ? undefined : props.style;
  const style: CSSProperties = {
    ...baseStyle,
    transform: CSS.Transform.toString(horizontalTransform),
    transition,
    zIndex: isDragging ? 20 : baseStyle?.zIndex,
  };

  return (
    <TabsTabButton
      value={value}
      sortableRef={setNodeRef}
      data-dragging-source={isDragging ? "true" : undefined}
      style={style}
      {...props}
      {...sortableAttributes}
      {...listeners}
    />
  );
}

function TabsTabButton<T extends string = string>({
  value,
  sortableRef,
  className,
  ...props
}: TabsTabProps<T> & {
  sortableRef?: (node: HTMLElement | null) => void;
}) {
  const theme = useTheme();
  const { tab } = tabs({ theme });

  return (
    <BaseTabs.Tab
      ref={(node) => {
        sortableRef?.(node);
      }}
      value={value}
      data-slot="tabs-tab"
      className={tab({ className })}
      {...props}
    />
  );
}

type SortableTabOverlayItem = {
  active: boolean;
  children: ReactNode;
  className?: string;
};

function getSortableTabOverlayItem(
  children: ReactNode,
  activeId: string | null,
  activeValue: string | undefined,
): SortableTabOverlayItem | null {
  if (activeId == null) return null;

  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ children?: ReactNode; className?: string; value?: unknown }>(child)) {
      continue;
    }

    if (String(child.props.value) !== activeId) continue;

    return {
      active: activeValue === activeId,
      children: child.props.children,
      className: child.props.className,
    };
  }

  return null;
}

type TabsTabVisualProps = ComponentPropsWithRef<"button"> & {
  active?: boolean;
  overlay?: boolean;
};

function TabsTabVisual({ active, className, overlay, ...props }: TabsTabVisualProps) {
  const theme = useTheme();
  const { tab } = tabs({ theme });

  return (
    <button
      type="button"
      data-active={active ? "" : undefined}
      data-overlay={overlay ? "true" : undefined}
      data-slot="tabs-tab"
      className={tab({ className })}
      {...props}
    />
  );
}

export type TabsLabelProps = ComponentPropsWithRef<"span">;

export function TabsLabel({ className, ...props }: TabsLabelProps) {
  const { label } = tabs();
  return <span data-slot="tabs-label" className={label({ className })} {...props} />;
}

export type TabsPanelProps = StyledProps<BaseTabs.Panel.Props>;

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  const { panel } = tabs();
  return <BaseTabs.Panel data-slot="tabs-panel" className={panel({ className })} {...props} />;
}

export type TabsIndicatorProps = StyledProps<BaseTabs.Indicator.Props>;

export function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  const { indicator } = tabs();
  return (
    <BaseTabs.Indicator
      data-slot="tabs-indicator"
      className={indicator({ className })}
      {...props}
    />
  );
}

export type OrderedTabItem<T extends string = string> = {
  id: T;
};

export function useOrderedTabs<T extends OrderedTabItem<string>>(
  items: readonly T[],
  storedOrder: readonly string[],
): T[] {
  return useMemo(() => reconcileTabOrder(items, storedOrder), [items, storedOrder]);
}

function reconcileTabOrder<T extends OrderedTabItem<string>>(
  items: readonly T[],
  order: readonly string[],
): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const next: T[] = [];
  const seen = new Set<string>();

  for (const id of order) {
    const item = byId.get(id);
    if (!item || seen.has(item.id)) continue;
    next.push(item);
    seen.add(item.id);
  }

  for (const item of items) {
    if (seen.has(item.id)) continue;
    next.push(item);
    seen.add(item.id);
  }

  return next;
}
