import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
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
import { tv, type VariantProps } from "../../lib/tv.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const tabs = tv({
  slots: {
    root: ["w-full"],
    list: [""],
    background: [""],
    tab: [
      "relative z-10 flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap outline-none",
      "data-[reorderable=true]:cursor-grab data-[reorderable=true]:active:cursor-grabbing",
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
          "flex w-max max-w-full overflow-x-auto border-2 border-line-strong bg-layer-panel",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        ],
        background: "hidden",
        tab: [
          "bg-layer-panel px-4 py-1.5 text-xs font-semibold transition-colors",
          "hover:bg-[color-mix(in_oklch,var(--line-strong)_6%,var(--layer-panel))]",
          "[&+&]:before:absolute [&+&]:before:inset-y-0 [&+&]:before:left-0 [&+&]:before:w-0.5 [&+&]:before:bg-line-strong",
          "data-[dragging-source=true]:before:hidden",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:[stroke-width:1.5] [&_svg:not([class*='size-'])]:size-3.5",
          "data-[active]:bg-primary-400 data-[active]:hover:bg-primary-400",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
          "data-[dragging-source=true]:cursor-grabbing",
        ],
      },
      elegant: {},
    },
    variant: {
      default: {},
      underline: {},
    },
  },
  defaultVariants: {
    variant: "default",
  },
  compoundVariants: [
    {
      theme: "elegant",
      variant: "underline",
      class: {
        list: [
          "group/tabs-list relative flex h-12 w-max max-w-full items-center gap-6 px-4",
          "overflow-x-auto overflow-y-hidden overscroll-contain whitespace-nowrap",
          "border-b border-line-muted",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        ],
        background: ["pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-line-muted"],
        tab: [
          "group/tabs-tab h-12 justify-center px-3 pb-3 pt-3.5",
          "text-[0.8125rem] font-medium tracking-[-0.005em] text-foreground-placeholder",
          "transition-colors duration-200 ease-out",
          "hover:text-foreground-muted",
          "data-[active]:text-foreground-strong",
          "data-[active]:hover:text-foreground-strong",
          "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:[stroke-width:1.5]",
          "[&_svg]:text-foreground-placeholder [&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-out",
          "hover:[&_svg]:text-foreground-muted",
          "data-[active]:[&_svg]:text-foreground-strong",
          "data-[active]:hover:[&_svg]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
          "data-[dragging-source=true]:cursor-grabbing",
        ],
        indicator: [
          "absolute bottom-0 left-[var(--active-tab-left)] z-10 h-0.5",
          "w-[var(--active-tab-width)] bg-foreground-strong",
          "transition-[left,width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "default",
      class: {
        list: [
          "group/tabs-list relative isolate flex h-auto w-max max-w-full items-center gap-1",
          "overflow-x-auto overflow-y-visible overscroll-contain whitespace-nowrap",
          "p-px",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        ],
        background: ["pointer-events-none absolute inset-0 z-0 rounded-[7px] bg-layer-muted"],
        tab: [
          "group/tabs-tab h-9 justify-center gap-1.5 rounded-md px-3.5 py-2",
          "text-[0.8125rem] font-medium tracking-[-0.005em] text-foreground-placeholder",
          "transition-[background-color,box-shadow,color] duration-150 ease-out",
          "hover:text-[oklch(42%_.006_285)]",
          "data-[active]:text-[oklch(38%_.006_285)]",
          "data-[active]:hover:text-[oklch(38%_.006_285)]",
          "data-[active]:[&_[data-slot=tabs-label]]:text-[0.8125rem]",
          "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:[stroke-width:1.5]",
          "[&_svg]:text-foreground-placeholder [&_svg]:transition-colors [&_svg]:duration-150 [&_svg]:ease-out",
          "hover:[&_svg]:text-[oklch(42%_.006_285)]",
          "data-[active]:[&_svg]:text-[oklch(38%_.006_285)]",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
          "data-[dragging-source=true]:cursor-grabbing",
        ],
        indicator: [
          "absolute z-0 rounded-md bg-layer-panel",
          "[left:calc(var(--active-tab-left)+1px)] [top:calc(var(--active-tab-top)+1.671875px)]",
          "[height:calc(var(--active-tab-height)-3.34375px)] [width:calc(var(--active-tab-width)-2px)]",
          "shadow-[0_0_0_1px_oklch(0%_0_0/.1),0_1px_1px_-1px_oklch(0%_0_0/.04),0_1px_2px_oklch(0%_0_0/.03)]",
          "group-has-[>[data-slot=tabs-background]]/tabs-list:shadow-[0_0_0_1px_oklch(0%_0_0/.045),0_1px_1px_-1px_oklch(0%_0_0/.025),0_1px_2px_oklch(0%_0_0/.02)]",
          "transition-[left,width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]",
        ],
      },
    },
  ],
});

type TabsReorderContextValue = {
  enabled: boolean;
};

const TabsReorderContext = createContext<TabsReorderContextValue>({ enabled: false });
const TabsValueContext = createContext<string | undefined>(undefined);
type TabsListVariant = "default" | "underline";

const TabsListVariantContext = createContext<TabsListVariant>("default");
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

export type TabsListProps = StyledProps<BaseTabs.List.Props> & {
  variant?: TabsListVariant;
};

export function TabsList({ className, children, variant = "default", ...props }: TabsListProps) {
  const theme = useTheme();
  const resolvedVariant = theme === "elegant" ? variant : "underline";
  const { list } = tabs({ theme, variant: resolvedVariant });

  return (
    <TabsListVariantContext.Provider value={resolvedVariant}>
      <BaseTabs.List
        data-slot="tabs-list"
        data-variant={resolvedVariant}
        className={list({ className })}
        {...props}
      >
        {children}
        {theme === "elegant" ? <TabsIndicator /> : null}
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
  );
  const tabIds = useMemo(() => value.map(String), [value]);
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const oldIndex = tabIds.indexOf(String(active.id));
      const newIndex = tabIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onReorder(arrayMove([...value], oldIndex, newIndex) as T[]);
    },
    [onReorder, tabIds, value],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
        <TabsReorderContext.Provider value={REORDER_ENABLED_CONTEXT}>
          <TabsList variant={variant} {...props}>
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: value,
    disabled: !reorder.enabled,
  });

  if (!reorder.enabled) {
    return <TabsTabButton value={value} {...props} />;
  }

  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
  const baseStyle = typeof props.style === "function" ? undefined : props.style;
  const style: CSSProperties = {
    ...baseStyle,
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
    zIndex: isDragging ? 20 : baseStyle?.zIndex,
  };

  return (
    <TabsTabButton
      value={value}
      sortableRef={setNodeRef}
      data-dragging-source={isDragging ? "true" : undefined}
      data-reorderable="true"
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
  children,
  ...props
}: TabsTabProps<T> & {
  sortableRef?: (node: HTMLElement | null) => void;
}) {
  const theme = useTheme();
  const variant = use(TabsListVariantContext);
  const { content, tab } = tabs({ theme, variant: theme === "elegant" ? variant : "underline" });

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
  const { panel } = tabs();
  return <BaseTabs.Panel data-slot="tabs-panel" className={panel({ className })} {...props} />;
}

export type TabsBackgroundProps = ComponentPropsWithRef<"span">;

export function TabsBackground({ className, ...props }: TabsBackgroundProps) {
  const theme = useTheme();
  const variant = use(TabsListVariantContext);
  const { background } = tabs({ theme, variant: theme === "elegant" ? variant : "underline" });

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
  const theme = useTheme();
  const variant = use(TabsListVariantContext);
  const { indicator } = tabs({ theme, variant: theme === "elegant" ? variant : "underline" });
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
