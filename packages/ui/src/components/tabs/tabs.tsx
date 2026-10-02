import { createContext, use, useCallback, useId, useMemo, useState } from "react";
import type { ComponentPropsWithRef, CSSProperties } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const tabs = tv({
  slots: {
    root: ["w-full"],
    list: [""],
    background: [""],
    tab: [
      "relative z-10 flex shrink-0 cursor-pointer touch-manipulation items-center gap-1.5 whitespace-nowrap outline-none",
      "data-[reorderable=true]:cursor-pointer data-[dragging-source=true]:cursor-grabbing",
    ],
    content: ["relative z-10 inline-flex items-center gap-[inherit]"],
    label: [""],
    panel: ["outline-none"],
    indicator: [""],
  },
  variants: {
    theme: {
      brutal: {
        list: [
          "flex w-max max-w-full border-2 border-line-strong bg-layer-panel",
          "scrollbar-none [&::-webkit-scrollbar]:hidden",
        ],
        background: "hidden",
        tab: [
          "bg-layer-panel px-4 py-1.5 text-xs font-semibold transition-colors",
          "hover:bg-[color-mix(in_oklch,var(--line-strong)_6%,var(--layer-panel))]",
          "[&+&]:before:absolute [&+&]:before:bg-line-strong",
          "data-[dragging-source=true]:before:hidden",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[2.5] [&_svg_*]:stroke-[2.5] [&_svg:not([class*='size-'])]:size-3.5",
          "data-active:bg-primary-400 data-active:hover:bg-primary-400",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
        ],
      },
      elegant: {},
    },
    variant: {
      default: {},
      underline: {},
    },
    placement: {
      top: {},
      bottom: { root: "flex flex-col", list: "order-last" },
      left: { root: "flex items-start", panel: "min-w-0 flex-1" },
      right: { root: "flex items-start", list: "order-last", panel: "min-w-0 flex-1" },
    },
  },
  defaultVariants: {
    variant: "default",
    placement: "top",
  },
  compoundVariants: [
    {
      theme: "brutal",
      placement: ["top", "bottom"],
      class: {
        list: ["overflow-x-auto", "data-[sorting=true]:overflow-x-hidden"],
        tab: ["[&+&]:before:inset-y-0 [&+&]:before:left-0 [&+&]:before:w-0.5"],
      },
    },
    {
      theme: "brutal",
      placement: ["left", "right"],
      class: {
        list: ["flex-col overflow-y-auto", "data-[sorting=true]:overflow-y-hidden"],
        tab: ["justify-start", "[&+&]:before:inset-x-0 [&+&]:before:top-0 [&+&]:before:h-0.5"],
      },
    },
    {
      theme: "elegant",
      variant: "underline",
      class: {
        list: [
          "group/tabs-list relative flex w-max max-w-full gap-1",
          "overscroll-contain whitespace-nowrap border-line-hairline",
          "data-[sorting=true]:**:data-[slot=tabs-indicator]:opacity-0 data-[sorting=true]:**:data-[slot=tabs-indicator]:transition-none",
          "scrollbar-none [&::-webkit-scrollbar]:hidden",
        ],
        background: ["pointer-events-none absolute z-0 bg-line-hairline"],
        tab: [
          "group/tabs-tab",
          "text-[13px] font-medium tracking-[-0.005em] text-foreground-placeholder",
          "transition-colors duration-200 ease-out",
          "hover:text-foreground-muted",
          "data-active:text-foreground",
          "data-active:hover:text-foreground",
          "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
          "[&_svg]:text-foreground-placeholder [&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-out",
          "hover:[&_svg]:text-foreground-muted",
          "data-active:[&_svg]:text-foreground",
          "data-active:hover:[&_svg]:text-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
        ],
        indicator: [
          "absolute z-10 bg-foreground",
          "duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "underline",
      placement: ["top", "bottom"],
      class: {
        list: [
          "h-12 items-center px-4",
          "overflow-x-auto overflow-y-hidden",
          "data-[sorting=true]:overflow-x-hidden",
        ],
        background: "inset-x-0 h-px",
        tab: "h-12 justify-center px-3",
        indicator: [
          "left-(--active-tab-left) h-0.5 w-(--active-tab-width)",
          "transition-[left,width]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "underline",
      placement: ["left", "right"],
      class: {
        list: [
          "flex-col items-stretch py-2",
          "overflow-y-auto overflow-x-hidden",
          "data-[sorting=true]:overflow-y-hidden",
        ],
        background: "inset-y-0 w-px",
        tab: "h-9 justify-start px-4",
        indicator: [
          "top-(--active-tab-top) h-(--active-tab-height) w-0.5",
          "transition-[top,height]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "underline",
      placement: "top",
      class: { list: "border-b", background: "top-0", tab: "pb-3 pt-3.5", indicator: "bottom-0" },
    },
    {
      theme: "elegant",
      variant: "underline",
      placement: "bottom",
      class: { list: "border-t", background: "bottom-0", tab: "pb-3.5 pt-3", indicator: "top-0" },
    },
    {
      theme: "elegant",
      variant: "underline",
      placement: "left",
      class: { list: "border-r", background: "left-0", indicator: "right-0" },
    },
    {
      theme: "elegant",
      variant: "underline",
      placement: "right",
      class: { list: "border-l", background: "right-0", indicator: "left-0" },
    },
    {
      theme: "elegant",
      variant: "default",
      class: {
        list: [
          "group/tabs-list relative isolate flex h-auto w-max max-w-full gap-1",
          "overscroll-contain whitespace-nowrap",
          "p-px",
          "data-[sorting=true]:**:data-[slot=tabs-indicator]:opacity-0 data-[sorting=true]:**:data-[slot=tabs-indicator]:transition-none",
          "scrollbar-none [&::-webkit-scrollbar]:hidden",
        ],
        background: [
          "pointer-events-none absolute inset-0 z-0 rounded-[7px] bg-fill-muted",
          "dark:bg-layer-inset dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.35),inset_0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
        ],
        tab: [
          "group/tabs-tab h-9 gap-1.5 rounded-md px-3.5 py-2",
          "text-[13px] font-medium tracking-[-0.005em] text-foreground-placeholder",
          "transition-[background-color,box-shadow,color] duration-150 ease-out",
          "hover:text-foreground-hover",
          "data-active:text-foreground-active",
          "data-active:hover:text-foreground-active",
          "data-active:**:data-[slot=tabs-label]:text-[13px]",
          "ring-ink-10 group-has-[>[data-slot=tabs-background]]/tabs-list:ring-ink-4",
          "dark:ring-transparent",
          "data-[reorderable=true]:data-active:bg-layer-panel",
          "dark:data-[reorderable=true]:data-active:bg-fill-muted",
          "data-[reorderable=true]:data-active:shadow-raft-sm data-[reorderable=true]:data-active:ring-1",
          "data-[dragging-active=true]:bg-layer-panel",
          "dark:data-[dragging-active=true]:bg-fill-muted",
          "data-[dragging-active=true]:shadow-raft-sm data-[dragging-active=true]:ring-1",
          "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
          "[&_svg]:text-foreground-placeholder [&_svg]:transition-colors [&_svg]:duration-150 [&_svg]:ease-out",
          "hover:[&_svg]:text-foreground-hover",
          "data-active:[&_svg]:text-foreground-active",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
        ],
        indicator: [
          "absolute z-0 rounded-md bg-layer-panel",
          "left-[calc(var(--active-tab-left)+1px)] top-[calc(var(--active-tab-top)+1.671875px)]",
          "h-[calc(var(--active-tab-height)-3.34375px)] w-[calc(var(--active-tab-width)-2px)]",
          "shadow-raft-sm ring-1 ring-ink-10",
          "dark:bg-fill-muted",
          "group-has-[>[data-slot=tabs-background]]/tabs-list:ring-ink-4",
          "dark:ring-transparent",
          "duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "default",
      placement: ["top", "bottom"],
      class: {
        list: [
          "items-center overflow-x-auto overflow-y-visible",
          "data-[sorting=true]:overflow-x-hidden",
        ],
        tab: "justify-center",
        indicator: "transition-[left,width]",
      },
    },
    {
      theme: "elegant",
      variant: "default",
      placement: ["left", "right"],
      class: {
        list: [
          "flex-col items-stretch overflow-y-auto overflow-x-visible",
          "data-[sorting=true]:overflow-y-hidden",
        ],
        tab: "justify-start",
        indicator: "transition-[top,height]",
      },
    },
  ],
});

export type TabsPlacement = "top" | "bottom" | "left" | "right";

const TabsPlacementContext = createContext<TabsPlacement>("top");

type TabsReorderContextValue = {
  enabled: boolean;
  activeId?: string | undefined;
};

const TabsReorderContext = createContext<TabsReorderContextValue>({ enabled: false });
const TabsValueContext = createContext<string | undefined>(undefined);
type TabsListVariant = "default" | "underline";

const TabsListVariantContext = createContext<TabsListVariant>("default");

export type TabsProps<T extends string = string> = StyledProps<
  Omit<BaseTabs.Root.Props, "defaultValue" | "onValueChange" | "value">
> &
  Omit<VariantProps<typeof tabs>, "theme" | "placement"> & {
    /**
     * Side of the panels the tab list sits on. `left` and `right` also make the
     * tabs vertical (arrow up / down) unless `orientation` is set.
     */
    placement?: TabsPlacement;
    value?: T;
    defaultValue?: T;
    onValueChange?: (value: T, eventDetails: BaseTabs.Root.ChangeEventDetails) => void;
  };

export function Tabs<T extends string = string>({
  value,
  defaultValue,
  onValueChange,
  placement = "top",
  orientation,
  className,
  ...props
}: TabsProps<T>) {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const resolvedValue = value ?? uncontrolledValue;
  const { root } = tabs({ placement });
  const handleValueChange = useCallback<NonNullable<BaseTabs.Root.Props["onValueChange"]>>(
    (nextValue, eventDetails) => {
      if (nextValue == null) return;
      const typedValue = String(nextValue) as T;
      if (value === undefined) setUncontrolledValue(typedValue);
      onValueChange?.(typedValue, eventDetails);
    },
    [value, onValueChange],
  );

  return (
    <TabsPlacementContext.Provider value={placement}>
      <TabsValueContext.Provider value={resolvedValue == null ? undefined : String(resolvedValue)}>
        <BaseTabs.Root
          orientation={
            orientation ??
            (placement === "left" || placement === "right" ? "vertical" : "horizontal")
          }
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          data-slot="tabs"
          data-placement={placement}
          className={root({ className })}
          {...props}
        />
      </TabsValueContext.Provider>
    </TabsPlacementContext.Provider>
  );
}

export type TabsListProps = StyledProps<BaseTabs.List.Props> & {
  variant?: TabsListVariant;
};

export function TabsList({ className, children, variant = "default", ...props }: TabsListProps) {
  const theme = useThemeFamily();
  const placement = use(TabsPlacementContext);
  const reorder = use(TabsReorderContext);
  const resolvedVariant = theme === "elegant" ? variant : "underline";
  const { list } = tabs({ theme, variant: resolvedVariant, placement });

  return (
    <TabsListVariantContext.Provider value={resolvedVariant}>
      <BaseTabs.List
        data-slot="tabs-list"
        data-variant={resolvedVariant}
        data-placement={placement}
        className={list({ className })}
        {...props}
      >
        {children}
        {theme === "elegant" && !reorder.enabled ? <TabsIndicator /> : null}
      </BaseTabs.List>
    </TabsListVariantContext.Provider>
  );
}

export type SortableTabsListProps<T extends string = string> = TabsListProps & {
  value: readonly T[];
  onReorder: (value: T[]) => void;
};

export function SortableTabsList<T extends string = string>({
  value,
  onReorder,
  children,
  variant = "default",
  ...props
}: SortableTabsListProps<T>) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const placement = use(TabsPlacementContext);
  // Stable id keeps dnd-kit's aria-describedby deterministic across SSR/client
  // (its internal counter-based id otherwise mismatches and breaks hydration).
  const dndContextId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
  );
  const tabIds = useMemo(() => value.map(String), [value]);
  const reorderContext = useMemo(
    () => ({ enabled: true, activeId }) as const satisfies TabsReorderContextValue,
    [activeId],
  );
  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  }, []);
  const handleDragCancel = useCallback(() => {
    setActiveId(undefined);
  }, []);
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveId(undefined);
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
      id={dndContextId}
      autoScroll={false}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tabIds}
        strategy={
          placement === "left" || placement === "right"
            ? verticalListSortingStrategy
            : horizontalListSortingStrategy
        }
      >
        <TabsReorderContext.Provider value={reorderContext}>
          <TabsList variant={variant} {...props} data-sorting={activeId ? "true" : undefined}>
            {children}
          </TabsList>
        </TabsReorderContext.Provider>
      </SortableContext>
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
  const activeValue = use(TabsValueContext);
  const placement = use(TabsPlacementContext);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: value,
    disabled: !reorder.enabled,
  });
  const isDraggingActive = isDragging && activeValue === String(value);

  if (!reorder.enabled) {
    return <TabsTabButton value={value} {...props} />;
  }

  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
  const baseStyle = typeof props.style === "function" ? undefined : props.style;
  const style: CSSProperties = {
    ...baseStyle,
    transform: transform
      ? placement === "left" || placement === "right"
        ? `translate3d(0, ${transform.y}px, 0)`
        : `translate3d(${transform.x}px, 0, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 20 : baseStyle?.zIndex,
    cursor: isDragging ? "grabbing" : "pointer",
  };

  return (
    <TabsTabButton
      value={value}
      sortableRef={setNodeRef}
      {...props}
      data-dragging-active={isDraggingActive ? "true" : undefined}
      data-dragging-source={isDragging ? "true" : undefined}
      data-reorderable="true"
      style={style}
      {...sortableAttributes}
      {...listeners}
    />
  );
}

function TabsTabButton<T extends string = string>({
  value,
  sortableRef,
  className,
  children,
  ...props
}: TabsTabProps<T> & {
  sortableRef?: (node: HTMLElement | null) => void;
}) {
  const theme = useThemeFamily();
  const variant = use(TabsListVariantContext);
  const placement = use(TabsPlacementContext);
  const { content, tab } = tabs({
    theme,
    variant: theme === "elegant" ? variant : "underline",
    placement,
  });

  return (
    <BaseTabs.Tab
      ref={(node) => {
        sortableRef?.(node);
      }}
      value={value}
      data-slot="tabs-tab"
      className={tab({ className })}
      {...props}
    >
      <span data-slot="tabs-tab-content" className={content()}>
        {children}
      </span>
    </BaseTabs.Tab>
  );
}

export type TabsLabelProps = ComponentPropsWithRef<"span">;

export function TabsLabel({ className, ...props }: TabsLabelProps) {
  const { label } = tabs();
  return <span data-slot="tabs-label" className={label({ className })} {...props} />;
}

export type TabsPanelProps = StyledProps<BaseTabs.Panel.Props>;

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  const placement = use(TabsPlacementContext);
  const { panel } = tabs({ placement });
  return <BaseTabs.Panel data-slot="tabs-panel" className={panel({ className })} {...props} />;
}

export type TabsBackgroundProps = ComponentPropsWithRef<"span">;

export function TabsBackground({ className, ...props }: TabsBackgroundProps) {
  const theme = useThemeFamily();
  const variant = use(TabsListVariantContext);
  const placement = use(TabsPlacementContext);
  const { background } = tabs({
    theme,
    variant: theme === "elegant" ? variant : "underline",
    placement,
  });

  return (
    <span
      aria-hidden="true"
      data-slot="tabs-background"
      className={background({ className })}
      {...props}
    />
  );
}

export type TabsIndicatorProps = StyledProps<BaseTabs.Indicator.Props>;

export function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  const theme = useThemeFamily();
  const variant = use(TabsListVariantContext);
  const placement = use(TabsPlacementContext);
  const { indicator } = tabs({
    theme,
    variant: theme === "elegant" ? variant : "underline",
    placement,
  });
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
