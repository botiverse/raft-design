import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from "react";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tv } from "../../lib/tv";
import { Popover, PopoverContent, type PopoverContentProps } from "../popover/index";
import { type SlotElementProps } from "../../lib/data-attributes";

const messageTextSelection = tv({
  slots: {
    menu: ["flex min-w-0 items-center select-none overflow-hidden text-xs"],
    item: ["flex h-7 items-center gap-1.5 px-2 outline-none transition-colors"],
    separator: ["w-px"],
  },
  variants: {
    theme: {
      brutal: {
        menu: "border-2 border-black bg-white font-semibold shadow-sm",
        item: "text-black hover:bg-soft-signal/30 focus-visible:bg-soft-signal/30",
        separator: "bg-black/20",
      },
      elegant: {
        menu: "gap-1 rounded-lg border-[0.5px] border-line-subtle bg-layer-panel p-1 font-medium shadow-xs",
        item: [
          "rounded-sm text-foreground-muted",
          "hover:bg-layer-muted hover:text-foreground-strong",
          "focus-visible:bg-layer-muted focus-visible:text-foreground-strong",
        ],
        separator: "hidden",
      },
    },
  },
});

type MessageTextSelectionContextValue = {
  anchor: PopoverContentProps["anchor"];
  clear: () => void;
  container: PopoverContentProps["container"];
  menuRef: RefObject<HTMLDivElement | null>;
  text: string;
};

export type MessageTextSelectionApi = Pick<MessageTextSelectionContextValue, "clear" | "text">;

const MessageTextSelectionContext = createContext<MessageTextSelectionContextValue | null>(null);

export type MessageTextSelectionProps = useRender.ComponentProps<"div"> & {
  container?: PopoverContentProps["container"];
};

function selectionBelongsToRoot(range: Range, root: HTMLElement) {
  return root.contains(range.startContainer) && root.contains(range.endContainer);
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export function MessageTextSelection({
  children,
  className,
  container,
  render,
  ...props
}: MessageTextSelectionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [range, setRange] = useState<Range | null>(null);

  const clear = useCallback(() => {
    const root = rootRef.current;
    const selection = root?.ownerDocument.getSelection();
    if (root && selection?.rangeCount && selectionBelongsToRoot(selection.getRangeAt(0), root)) {
      selection.removeAllRanges();
    }
    setRange(null);

    const restoreFocus = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (restoreFocus?.isConnected) queueMicrotask(() => restoreFocus.focus());
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ownerDocument = root.ownerDocument;
    const update = () => {
      const selection = ownerDocument.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setRange(null);
        return;
      }

      const nextRange = selection.getRangeAt(0);
      if (!selectionBelongsToRoot(nextRange, root)) {
        setRange(null);
        return;
      }

      const rect = nextRange.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setRange(null);
        return;
      }

      setRange(nextRange.cloneRange());
    };

    ownerDocument.addEventListener("selectionchange", update);
    return () => ownerDocument.removeEventListener("selectionchange", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !range) return;

    const ownerDocument = root.ownerDocument;
    const focusMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clear();
        return;
      }
      if (!event.shiftKey || event.key !== "F10") return;

      const selection = ownerDocument.getSelection();
      if (!selection?.rangeCount || !selectionBelongsToRoot(selection.getRangeAt(0), root)) return;

      const firstItem = menuRef.current?.querySelector<HTMLElement>(
        '[data-slot="message-text-selection-menu-item"]',
      );
      if (!firstItem) return;

      event.preventDefault();
      const activeElement = ownerDocument.activeElement;
      const HTMLElementConstructor = ownerDocument.defaultView?.HTMLElement;
      restoreFocusRef.current =
        HTMLElementConstructor && activeElement instanceof HTMLElementConstructor
          ? activeElement
          : null;
      firstItem.focus();
    };

    ownerDocument.addEventListener("keydown", focusMenu);
    return () => ownerDocument.removeEventListener("keydown", focusMenu);
  }, [clear, range]);

  const anchor = useMemo<PopoverContentProps["anchor"]>(() => {
    if (!range) return null;
    const root = rootRef.current;
    return {
      contextElement: root ?? undefined,
      getBoundingClientRect: () => range.getBoundingClientRect(),
      getClientRects: () => Array.from(range.getClientRects()),
    };
  }, [range]);

  const contextValue = useMemo(
    () => ({ anchor, clear, container, menuRef, text: range?.toString() ?? "" }),
    [anchor, clear, container, range],
  );
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "message-text-selection",
    children: (
      <MessageTextSelectionContext.Provider value={contextValue}>
        <Popover
          open={Boolean(anchor)}
          onOpenChange={(open) => {
            if (open) return;
            const root = rootRef.current;
            const selection = root?.ownerDocument.getSelection();
            const preservesCurrentSelection =
              root &&
              selection &&
              !selection.isCollapsed &&
              selection.rangeCount > 0 &&
              selectionBelongsToRoot(selection.getRangeAt(0), root);
            if (!preservesCurrentSelection) clear();
          }}
        >
          {children}
        </Popover>
      </MessageTextSelectionContext.Provider>
    ),
    className: cn("contents", className),
    ref: rootRef,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export function useMessageTextSelection() {
  const selection = useContext(MessageTextSelectionContext);
  return selection ? { clear: selection.clear, text: selection.text } : null;
}

function useMessageTextSelectionContext() {
  return useContext(MessageTextSelectionContext);
}

export type MessageTextSelectionMenuProps = Omit<
  PopoverContentProps,
  "align" | "anchor" | "container" | "side"
>;

export function MessageTextSelectionMenu({
  className,
  collisionAvoidance = { side: "shift", align: "shift", fallbackAxisSide: "none" },
  collisionPadding = 8,
  onPointerDown,
  ref,
  ...props
}: MessageTextSelectionMenuProps) {
  const selection = useMessageTextSelectionContext();
  const theme = useThemeFamily();
  const { menu } = messageTextSelection({ theme });
  if (!selection?.anchor) return null;

  return (
    <PopoverContent
      ref={(element) => {
        selection.menuRef.current = element;
        assignRef(ref, element);
      }}
      align="center"
      anchor={selection.anchor}
      aria-keyshortcuts="Shift+F10"
      className={menu({ className })}
      collisionAvoidance={collisionAvoidance}
      collisionPadding={collisionPadding}
      container={selection.container}
      data-slot="message-text-selection-menu"
      finalFocus={false}
      initialFocus={false}
      role="group"
      side="top"
      sideOffset={8}
      onPointerDown={(event) => {
        event.preventDefault();
        onPointerDown?.(event);
      }}
      {...props}
    />
  );
}

export type MessageTextSelectionMenuItemProps = useRender.ComponentProps<"button">;

export function MessageTextSelectionMenuItem({
  className,
  render,
  onClick,
  ...props
}: MessageTextSelectionMenuItemProps) {
  const selection = useMessageTextSelectionContext();
  const theme = useThemeFamily();
  const { item } = messageTextSelection({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    className: item({ className }),
    onClick: (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) selection?.clear();
    },
    type: "button",
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-text-selection-menu-item" },
  });
}

export type MessageTextSelectionMenuSeparatorProps = useRender.ComponentProps<"div">;

export function MessageTextSelectionMenuSeparator({
  className,
  render,
  ...props
}: MessageTextSelectionMenuSeparatorProps) {
  const theme = useThemeFamily();
  const { separator } = messageTextSelection({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    "aria-hidden": true,
    className: separator({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-text-selection-menu-separator" },
  });
}
