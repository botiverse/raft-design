import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithRef, CSSProperties } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { closestCenter, DndContext, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useHoldThenMoveTouchSensor, useMouseOnlyPointerSensor } from "../../lib/touch-drag";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const tabs = tv({
  slots: {
    root: ["w-full"],
    list: [
      "relative isolate flex w-max max-w-full",
      "overscroll-contain whitespace-nowrap",
      "scrollbar-none [&::-webkit-scrollbar]:hidden",
      // More tabs than fit: the row scrolls (a mouse wheel too) and fades
      // at the side where tabs are hidden.
      "data-[overflow=end]:mask-[linear-gradient(to_right,black_calc(100%-32px),transparent)]",
      "data-[overflow=start]:mask-[linear-gradient(to_right,transparent,black_32px)]",
      "data-[overflow=both]:mask-[linear-gradient(to_right,transparent,black_32px,black_calc(100%-32px),transparent)]",
    ],
    background: ["", "hidden"],
    tab: [
      "relative z-10 flex shrink-0 cursor-pointer touch-manipulation select-none [-webkit-touch-callout:none] items-center gap-1.5 whitespace-nowrap outline-none",
      "data-[reorderable=true]:cursor-pointer data-[dragging-source=true]:cursor-grabbing",
      "font-sans text-callout font-semibold text-foreground-muted",
      "transition-[background-color,box-shadow,color] duration-100 ease-out",
      "after:absolute after:content-['']",
      "focus-visible:shadow-focus",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg:not([class*='size-'])]:size-4",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
    ],
    content: ["relative z-10 inline-flex items-center gap-[inherit]"],
    label: [""],
    panel: ["outline-none"],
    indicator: ["", "hidden"],
  },
  variants: {
    variant: {
      default: {
        list: ["gap-0.5"],
        tab: [
          "h-8 justify-center gap-1.5 rounded-control border-[1.5px] border-transparent px-3",
          "after:inset-x-0 after:-inset-y-1.5",
          "hover:bg-fill-pressed active:bg-fill-pressed",
          "data-active:border-sticker-ink data-active:bg-brand data-active:font-bold data-active:text-sticker-ink data-active:ring-[1.5px] data-active:ring-sticker-edge",
          "data-active:active:press-overlay-sticker",
          "data-disabled:bg-transparent",
        ],
      },
      underline: {
        list: ["gap-5"],
        tab: [
          "h-11 justify-center rounded-none border-0 bg-transparent px-0",
          "after:inset-y-0 after:-inset-x-2.5",
          "hover:text-foreground active:text-foreground",
          "data-active:text-foreground",
        ],
      },
    },
    placement: {
      top: {
        list: [
          "items-center overflow-x-auto overflow-y-hidden",
          "data-[sorting=true]:overflow-x-hidden",
        ],
      },
      bottom: {
        root: "flex flex-col",
        list: [
          "order-last",
          "items-center overflow-x-auto overflow-y-hidden",
          "data-[sorting=true]:overflow-x-hidden",
        ],
      },
      left: {
        root: "flex items-start",
        panel: "min-w-0 flex-1",
        list: [
          "flex-col items-stretch overflow-x-hidden overflow-y-auto",
          "data-[sorting=true]:overflow-y-hidden",
        ],
        tab: ["justify-start"],
      },
      right: {
        root: "flex items-start",
        list: [
          "order-last",
          "flex-col items-stretch overflow-x-hidden overflow-y-auto",
          "data-[sorting=true]:overflow-y-hidden",
        ],
        panel: "min-w-0 flex-1",
        tab: ["justify-start"],
      },
    },
  },
  defaultVariants: {
    variant: "default",
    placement: "top",
  },
  compoundVariants: [
    {
      variant: "underline",
      placement: "top",
      class: { tab: "data-active:shadow-[inset_0_-2px_0_var(--foreground)]" },
    },
    {
      variant: "underline",
      placement: "bottom",
      class: { tab: "data-active:shadow-[inset_0_2px_0_var(--foreground)]" },
    },
    {
      variant: "underline",
      placement: "left",
      class: {
        list: "gap-0 border-r border-line-seam",
        tab: "h-9 px-4 data-active:shadow-[inset_-2px_0_0_var(--foreground)]",
      },
    },
    {
      variant: "underline",
      placement: "right",
      class: {
        list: "gap-0 border-l border-line-seam",
        tab: "h-9 px-4 data-active:shadow-[inset_2px_0_0_var(--foreground)]",
      },
    },
  ],
});

/** Exported for the merge-contract test. */

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
  Omit<VariantProps<typeof tabs>, "placement"> & {
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

/**
 * A horizontal tab row that has more tabs than room: it scrolls by itself
 * (its scrollbar hidden), a vertical mouse wheel scrolls it sideways, it marks
 * which side holds hidden tabs (`data-overflow="start" | "end" | "both"`, for
 * the edge fade), and it keeps the selected tab in view.
 */
function useTabsRowOverflow(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const row = ref.current;
    if (!enabled || !row) return;
    const update = () => {
      const max = row.scrollWidth - row.clientWidth;
      const start = row.scrollLeft > 1;
      const end = max > 1 && row.scrollLeft < max - 1;
      const next = start && end ? "both" : start ? "start" : end ? "end" : null;
      if (next) row.setAttribute("data-overflow", next);
      else row.removeAttribute("data-overflow");
    };
    const revealActive = () => {
      const active = row.querySelector<HTMLElement>("[data-slot=tabs-tab][data-active]");
      if (!active || row.scrollWidth <= row.clientWidth) return;
      const inset = parseFloat(getComputedStyle(row).paddingLeft) || 0;
      const left = active.offsetLeft - inset;
      const right = active.offsetLeft + active.offsetWidth + inset - row.clientWidth;
      if (left < row.scrollLeft) row.scrollLeft = left;
      else if (right > row.scrollLeft) row.scrollLeft = right;
    };
    const onWheel = (event: WheelEvent) => {
      if (row.scrollWidth <= row.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const before = row.scrollLeft;
      row.scrollLeft += event.deltaY;
      if (row.scrollLeft !== before) event.preventDefault();
    };
    revealActive();
    update();
    row.addEventListener("scroll", update, { passive: true });
    row.addEventListener("wheel", onWheel, { passive: false });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    resize?.observe(row);
    const mutations =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
            revealActive();
            update();
          });
    mutations?.observe(row, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-active"],
    });
    return () => {
      row.removeEventListener("scroll", update);
      row.removeEventListener("wheel", onWheel);
      resize?.disconnect();
      mutations?.disconnect();
    };
  }, [enabled]);
  return ref;
}

export function TabsList({
  className,
  children,
  variant = "default",
  ref,
  ...props
}: TabsListProps) {
  const placement = use(TabsPlacementContext);
  const { list } = tabs({ variant, placement });
  const overflowRef = useTabsRowOverflow(placement === "top" || placement === "bottom");
  const listRef = useCallback(
    (node: HTMLDivElement | null) => {
      overflowRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [overflowRef, ref],
  );

  return (
    <TabsListVariantContext.Provider value={variant}>
      <BaseTabs.List
        ref={listRef}
        data-slot="tabs-list"
        data-variant={variant}
        data-placement={placement}
        className={list({ className })}
        {...props}
      >
        {children}
      </BaseTabs.List>
    </TabsListVariantContext.Provider>
  );
}

export type SortableTabsListProps<T extends string = string> = TabsListProps & {
  value: readonly T[];
  onReorder: (value: T[]) => void;
  /** A tab was picked up. On a touch screen the long press that armed it may
   *  have opened a menu the caller owns: close it here (DS › States ›
   *  Dragging on a touch screen). */
  onDragStart?: (value: T) => void;
};

export function SortableTabsList<T extends string = string>({
  value,
  onReorder,
  onDragStart,
  children,
  variant = "default",
  ...props
}: SortableTabsListProps<T>) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const placement = use(TabsPlacementContext);
  // Stable id keeps dnd-kit's aria-describedby deterministic across SSR/client
  // (its internal counter-based id otherwise mismatches and breaks hydration).
  const dndContextId = useId();
  const sensors = useSensors(useMouseOnlyPointerSensor(6), useHoldThenMoveTouchSensor());
  const tabIds = useMemo(() => value.map(String), [value]);
  const reorderContext = useMemo(
    () => ({ enabled: true, activeId }) as const satisfies TabsReorderContextValue,
    [activeId],
  );
  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      setActiveId(String(active.id));
      onDragStart?.(String(active.id) as T);
    },
    [onDragStart],
  );
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
  const baseStyle = typeof props.style === "function" ? undefined : props.style;
  const vertical = placement === "left" || placement === "right";
  const translate = vertical ? transform?.y : transform?.x;
  const style = useMemo<CSSProperties>(
    () => ({
      ...baseStyle,
      transform:
        translate === undefined
          ? undefined
          : vertical
            ? `translate3d(0, ${translate}px, 0)`
            : `translate3d(${translate}px, 0, 0)`,
      transition,
      zIndex: isDragging ? 20 : baseStyle?.zIndex,
      cursor: isDragging ? "grabbing" : "pointer",
    }),
    [baseStyle, vertical, translate, transition, isDragging],
  );

  if (!reorder.enabled) {
    return <TabsTabButton value={value} {...props} />;
  }

  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;

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
  const variant = use(TabsListVariantContext);
  const placement = use(TabsPlacementContext);
  const { content, tab } = tabs({ variant, placement });

  return (
    <BaseTabs.Tab
      ref={sortableRef}
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
