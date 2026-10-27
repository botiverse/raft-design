import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithRef, CSSProperties, KeyboardEvent, ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { closestCenter, DndContext } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DragLift, useDragSiblingTransition, useLiftContainer } from "../drag/drag-lift";
import { createDragAnnouncements, dragInstructions } from "../drag/drag-announcements";
import type { DragAnnouncementSource, DragMessages } from "../drag/drag-announcements";
import { useDragSensors } from "../drag/drag-sensors";
import { DropPlaceholder } from "../drag/drop-placeholder";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { useTapActivation } from "../../lib/tap-activation";
import { useMergedRef } from "../../lib/use-merged-ref";
import type { StyledProps } from "../../lib/styled-props";

const tabs = tv({
  slots: {
    root: ["w-full"],
    list: [
      "relative isolate flex w-max max-w-full",
      "overscroll-contain whitespace-nowrap",
      "scrollbar-none [&::-webkit-scrollbar]:hidden",
      // More tabs than fit: the row scrolls (a mouse wheel too) and fades
      // at the side where tabs are hidden, over the edge fade (24px).
      "mask-fade-x",
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
          "hover:bg-fill-medium active:bg-fill-medium",
          "data-active:border-sticker-ink data-active:bg-selected data-active:font-bold data-active:text-sticker-ink data-active:ring-[1.5px] data-active:ring-sticker-edge",
          "data-active:active:overlay-sticker-medium",
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
  /** Each sortable tab's content, for the copy that follows the hand. */
  copies?: Map<string, ReactNode>;
  /** Each sortable tab's node, for its name in the announcements. */
  nodes?: Map<string, HTMLElement>;
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
  /**
   * Your translations of the drag's instructions and announcements. Each step
   * is said by the tab's name (its `aria-label` or text) and its position in
   * the row, named after the list's `aria-label`; never by its value.
   */
  messages?: Partial<DragMessages>;
  /**
   * Where the lifted copy renders: `document.body` by default, so a
   * transformed ancestor (a drawer, a dialog) doesn't offset it. `null`
   * renders it in place.
   */
  container?: Element | DocumentFragment | null;
};

/** What people call a tab: its `aria-label`, or its text. */
function tabName(node: HTMLElement | undefined) {
  if (!node) return "";
  return (node.getAttribute("aria-label") ?? node.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** What people call the row a tab is in: the tab list's accessible name, or nothing. */
function tabListName(node: HTMLElement | undefined) {
  const list = node?.closest<HTMLElement>("[role=tablist]");
  if (!list) return "";
  const label = list.getAttribute("aria-label");
  if (label) return label.trim();
  const ids = list.getAttribute("aria-labelledby")?.split(/\s+/).filter(Boolean) ?? [];
  return ids
    .map((id) => list.ownerDocument.getElementById(id)?.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

/**
 * A tab is said by its name, at its position in the row: a drop on a tab
 * takes its place, and with nothing under the hand the tab is home. Read
 * when dnd-kit announces, never while rendering.
 */
function tabAnnouncementSource(
  positions: Map<string, number>,
  nodes: Map<string, HTMLElement>,
): DragAnnouncementSource {
  return {
    name: (id) => tabName(nodes.get(String(id))),
    place: (id, overId) => {
      const index = positions.get(String(overId ?? id));
      if (index == null) return null;
      return {
        place: tabListName(nodes.get(String(id))),
        position: index + 1,
        count: positions.size,
      };
    },
  };
}

export function SortableTabsList<T extends string = string>({
  value,
  onReorder,
  onDragStart,
  messages,
  container,
  children,
  variant = "default",
  ...props
}: SortableTabsListProps<T>) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const placement = use(TabsPlacementContext);
  // Stable id keeps dnd-kit's aria-describedby deterministic across SSR/client
  // (its internal counter-based id otherwise mismatches and breaks hydration).
  const dndContextId = useId();
  const sensors = useDragSensors();
  const [copies] = useState(() => new Map<string, ReactNode>());
  const [nodes] = useState(() => new Map<string, HTMLElement>());
  const liftContainer = useLiftContainer(container);
  const selectedValue = use(TabsValueContext);
  const { tab: tabClassName, content: contentClassName } = tabs({ variant, placement });
  const tabIds = useMemo(() => value.map(String), [value]);
  // Read by the announcements, which dnd-kit calls outside render.
  // Each tab's index, for the announcements dnd-kit makes outside render.
  const [positions] = useState(() => new Map<string, number>());
  useLayoutEffect(() => {
    positions.clear();
    tabIds.forEach((id, index) => positions.set(id, index));
  }, [positions, tabIds]);
  const accessibility = useMemo(
    () => ({
      screenReaderInstructions: dragInstructions(messages),
      announcements: createDragAnnouncements(tabAnnouncementSource(positions, nodes), messages),
    }),
    [messages, nodes, positions],
  );
  const reorderContext = useMemo(
    () => ({ enabled: true, activeId, copies, nodes }) as const satisfies TabsReorderContextValue,
    [activeId, copies, nodes],
  );
  // While a tab is lifted the arrow keys and Space move and drop it: Base UI
  // must not move focus or select another tab under it.
  const { onKeyDown: onListKeyDown, ...listProps } = props;
  const handleListKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement> & { preventBaseUIHandler?: () => void }) => {
      onListKeyDown?.(event as never);
      if (activeId !== undefined) event.preventBaseUIHandler?.();
    },
    [activeId, onListKeyDown],
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
      accessibility={accessibility}
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
          <TabsList
            variant={variant}
            {...listProps}
            onKeyDown={handleListKeyDown}
            data-sorting={activeId ? "true" : undefined}
          >
            {children}
          </TabsList>
        </TabsReorderContext.Provider>
      </SortableContext>
      <DragLift className="rounded-control" container={liftContainer}>
        {activeId === undefined ? null : (
          <span
            data-slot="tabs-tab"
            data-active={selectedValue === activeId ? "" : undefined}
            className={tabClassName({ className: "pointer-events-none size-full" })}
          >
            <span data-slot="tabs-tab-content" className={contentClassName()}>
              {copies.get(activeId)}
            </span>
          </span>
        )}
      </DragLift>
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
  const siblingTransition = useDragSiblingTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, index, overIndex } =
    useSortable({
      id: value,
      disabled: !reorder.enabled,
      transition: siblingTransition,
    });
  const isDraggingActive = isDragging && activeValue === String(value);
  // The lifted tab's own slot: faded while it is still home, the dashed place
  // once it stands anywhere else.
  const home = overIndex < 0 || overIndex === index;
  const copies = reorder.copies;
  const key = String(value);
  const { children } = props;
  useLayoutEffect(() => {
    if (!copies) return;
    copies.set(key, children);
    return () => {
      copies.delete(key);
    };
  }, [copies, key, children]);
  const nodes = reorder.nodes;
  const sortableRef = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      if (!nodes) return;
      if (node) nodes.set(key, node);
      else nodes.delete(key);
    },
    [setNodeRef, nodes, key],
  );
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
      ...(isDragging && !home ? PLACE_STYLE : null),
    }),
    [baseStyle, vertical, translate, transition, isDragging, home],
  );
  const { onKeyDown: onTabKeyDown } = props;
  const { onKeyDown: onSortableKeyDown, ...sortableListeners } = listeners ?? {};
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement> & { preventBaseUIHandler?: () => void }) => {
      onTabKeyDown?.(event as never);
      if (reorder.activeId !== undefined) event.preventBaseUIHandler?.();
      onSortableKeyDown?.(event);
    },
    [onTabKeyDown, onSortableKeyDown, reorder.activeId],
  );

  if (!reorder.enabled) {
    return <TabsTabButton value={value} {...props} />;
  }

  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;

  return (
    <TabsTabButton
      value={value}
      sortableRef={sortableRef}
      {...props}
      data-dragging-active={isDraggingActive ? "true" : undefined}
      data-dragging-source={isDragging ? "true" : undefined}
      data-drag-origin={isDragging && home ? "" : undefined}
      data-reorderable="true"
      style={style}
      {...sortableAttributes}
      {...sortableListeners}
      onKeyDown={handleKeyDown}
      dropPlace={isDragging && !home}
    />
  );
}

/** The lifted tab's slot away from home: none of the tab's own look, under the dashed place. */
const PLACE_STYLE: CSSProperties = {
  backgroundColor: "transparent",
  borderColor: "transparent",
  boxShadow: "none",
};

function TabsTabButton<T extends string = string>({
  value,
  sortableRef,
  dropPlace = false,
  className,
  children,
  ref,
  ...props
}: TabsTabProps<T> & {
  sortableRef?: (node: HTMLElement | null) => void;
  dropPlace?: boolean;
}) {
  const variant = use(TabsListVariantContext);
  const placement = use(TabsPlacementContext);
  const { content, tab } = tabs({ variant, placement });
  // A tab switches when the finger lifts, so a tap that stops a scrolling
  // list still switches (design/patterns/navigation.md#switching-on-finger-lift).
  const tapRef = useTapActivation<HTMLElement>();
  const [setRef] = useMergedRef<HTMLElement>(sortableRef, tapRef, ref);

  return (
    <BaseTabs.Tab
      ref={setRef}
      value={value}
      data-slot="tabs-tab"
      className={tab({ className })}
      {...props}
    >
      <span
        data-slot="tabs-tab-content"
        className={content({ className: dropPlace ? "invisible" : undefined })}
      >
        {children}
      </span>
      {dropPlace ? <DropPlaceholder className="absolute inset-0 z-10 rounded-control" /> : null}
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
