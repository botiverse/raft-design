import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { tv, type VariantProps } from "../../lib/tv";

export type MessageSelectApi = {
  active: boolean;
  selected: ReadonlySet<string>;
  enter: (id: string) => void;
  toggle: (id: string) => void;
  cancel: () => void;
};

const MessageSelectContext = createContext<MessageSelectApi | null>(null);

export type MessageSelectProps = {
  children: ReactNode;
  active?: boolean;
  defaultActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  selected?: ReadonlySet<string>;
  defaultSelected?: ReadonlySet<string>;
  onSelectedChange?: (selected: ReadonlySet<string>) => void;
};

export function MessageSelect({
  active: controlledActive,
  children,
  defaultActive = false,
  defaultSelected = new Set(),
  onActiveChange,
  onSelectedChange,
  selected: controlledSelected,
}: MessageSelectProps) {
  const [uncontrolledActive, setUncontrolledActive] = useState(defaultActive);
  const [uncontrolledSelected, setUncontrolledSelected] =
    useState<ReadonlySet<string>>(defaultSelected);
  const active = controlledActive ?? uncontrolledActive;
  const selected = controlledSelected ?? uncontrolledSelected;

  const setActive = useCallback(
    (next: boolean) => {
      if (controlledActive === undefined) setUncontrolledActive(next);
      onActiveChange?.(next);
    },
    [controlledActive, onActiveChange],
  );

  const setSelected = useCallback(
    (next: ReadonlySet<string>) => {
      if (controlledSelected === undefined) setUncontrolledSelected(next);
      onSelectedChange?.(next);
    },
    [controlledSelected, onSelectedChange],
  );

  const enter = useCallback(
    (id: string) => {
      setActive(true);
      setSelected(new Set([id]));
    },
    [setActive, setSelected],
  );

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(next);
    },
    [selected, setSelected],
  );

  const cancel = useCallback(() => {
    setActive(false);
    setSelected(new Set());
  }, [setActive, setSelected]);

  const contextValue = useMemo(
    () => ({ active, selected, enter, toggle, cancel }),
    [active, selected, enter, toggle, cancel],
  );

  return (
    <MessageSelectContext.Provider value={contextValue}>{children}</MessageSelectContext.Provider>
  );
}

export function useMessageSelect() {
  return useContext(MessageSelectContext);
}

const messageSelect = tv({
  slots: {
    toolbar: ["border-t-2 border-black bg-soft-signal"],
    toolbarContent: ["flex items-center gap-1.5 px-2 py-2"],
    count: ["whitespace-nowrap font-mono text-xs font-bold text-black/70"],
    actions: ["flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5"],
    action: [
      "btn-brutal-sm inline-flex shrink-0 items-center justify-center whitespace-nowrap",
      "font-bold leading-none",
    ],
  },
  variants: {
    tone: {
      default: { action: "bg-white text-black" },
      accent: { action: "bg-brutal-pink text-black" },
    },
    size: {
      default: { action: "h-7 gap-1.5 px-2.5 text-xs" },
      icon: { action: "size-7 text-xs" },
    },
  },
  defaultVariants: {
    tone: "default",
    size: "default",
  },
});

export type MessageSelectToolbarProps = useRender.ComponentProps<"div">;

export function MessageSelectToolbar({
  children,
  className,
  render,
  ...props
}: MessageSelectToolbarProps) {
  const { toolbar, toolbarContent } = messageSelect();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
    children: <div className={toolbarContent()}>{children}</div>,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-select-toolbar" },
  });
}

export type MessageSelectCountProps = useRender.ComponentProps<"span">;

export function MessageSelectCount({ className, render, ...props }: MessageSelectCountProps) {
  const { count } = messageSelect();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: count({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-select-count" },
  });
}

export type MessageSelectActionsProps = useRender.ComponentProps<"div">;

export function MessageSelectActions({ className, render, ...props }: MessageSelectActionsProps) {
  const { actions } = messageSelect();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-select-actions" },
  });
}

type MessageSelectVariants = VariantProps<typeof messageSelect>;

export type MessageSelectActionProps = useRender.ComponentProps<"button"> &
  Pick<MessageSelectVariants, "size" | "tone">;

export function MessageSelectAction({
  className,
  render,
  size,
  tone,
  ...props
}: MessageSelectActionProps) {
  const { action } = messageSelect({ size, tone });
  const defaultProps: useRender.ElementProps<"button"> = {
    className: action({ className }),
    type: "button",
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-select-action" },
  });
}

const messageSelectionMenu = tv({
  slots: {
    menu: [
      "fixed z-[70] flex select-none overflow-hidden",
      "border-2 border-black bg-white text-xs font-semibold shadow-brutal-sm",
    ],
    item: [
      "flex h-7 items-center gap-1.5 px-2 text-black",
      "transition-colors hover:bg-soft-signal/30",
    ],
    separator: ["w-px bg-black/20"],
  },
});

type Point = { x: number; y: number };
type DataAttributes = Record<`data-${string}`, string | undefined>;

export type MessageSelectionMenuProps = useRender.ComponentProps<"div"> & {
  selectableSelector?: string;
};

export function MessageSelectionMenu({
  className,
  render,
  selectableSelector = "[data-message-selectable='true']",
  style,
  ...props
}: MessageSelectionMenuProps) {
  const [position, setPosition] = useState<Point | null>(null);
  const { menu } = messageSelectionMenu();
  const positionedStyle: CSSProperties | undefined = position
    ? { ...style, left: position.x, top: position.y }
    : style;
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "aria-label": "Selected text actions",
    "data-message-selection-shortcut": "true",
    className: menu({ className }),
    role: "menu",
    style: positionedStyle,
  };
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-selection-menu" },
  });

  useEffect(() => {
    let updateTimer: number | undefined;

    const update = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const isWithinSelectable = (node: Node | null) => {
        const element = node instanceof Element ? node : (node?.parentElement ?? null);
        return Boolean(element?.closest(selectableSelector));
      };

      if (!isWithinSelectable(range.startContainer) || !isWithinSelectable(range.endContainer)) {
        setPosition(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setPosition(null);
        return;
      }

      setPosition({ x: rect.left + rect.width / 2 - 62, y: rect.top - 40 });
    };

    const onMouseUp = () => {
      if (updateTimer !== undefined) window.clearTimeout(updateTimer);
      updateTimer = window.setTimeout(update, 0);
    };
    document.addEventListener("selectionchange", update);
    document.addEventListener("mouseup", onMouseUp, true);
    return () => {
      if (updateTimer !== undefined) window.clearTimeout(updateTimer);
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("mouseup", onMouseUp, true);
    };
  }, [selectableSelector]);

  if (!position) return null;
  return createPortal(element, document.body);
}

export type MessageSelectionMenuItemProps = useRender.ComponentProps<"button">;

export function MessageSelectionMenuItem({
  className,
  render,
  ...props
}: MessageSelectionMenuItemProps) {
  const { item } = messageSelectionMenu();
  const defaultProps: useRender.ElementProps<"button"> = {
    className: item({ className }),
    role: "menuitem",
    type: "button",
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-selection-menu-item" },
  });
}

export type MessageSelectionMenuSeparatorProps = useRender.ComponentProps<"div">;

export function MessageSelectionMenuSeparator({
  className,
  render,
  ...props
}: MessageSelectionMenuSeparatorProps) {
  const { separator } = messageSelectionMenu();
  const defaultProps: useRender.ElementProps<"div"> = {
    "aria-hidden": true,
    className: separator({ className }),
    role: "separator",
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-selection-menu-separator" },
  });
}
