import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Copy, Quote, TextQuote } from "lucide-react";
import {
  Popover,
  PopoverContent,
  type PopoverContentProps,
  MessageTextSelectionToolbar,
  MessageTextSelectionToolbarButton,
  MessageTextSelectionToolbarSeparator,
} from "raft-ui";

export type MessageTextSelectionCompositionProps = {
  children: ReactNode;
  container?: PopoverContentProps["container"];
  onQuote?: (text: string) => void;
};

function selectionBelongsToRoot(range: Range, root: HTMLElement) {
  return root.contains(range.startContainer) && root.contains(range.endContainer);
}

export function MessageTextSelectionComposition({
  children,
  container,
  onQuote,
}: MessageTextSelectionCompositionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
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
    const focusToolbar = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clear();
        return;
      }
      if (!event.shiftKey || event.key !== "F10") return;

      const selection = ownerDocument.getSelection();
      if (!selection?.rangeCount || !selectionBelongsToRoot(selection.getRangeAt(0), root)) return;

      const firstButton = toolbarRef.current?.querySelector<HTMLElement>(
        '[data-slot="message-text-selection-toolbar-button"]',
      );
      if (!firstButton) return;

      event.preventDefault();
      const activeElement = ownerDocument.activeElement;
      const HTMLElementConstructor = ownerDocument.defaultView?.HTMLElement;
      restoreFocusRef.current =
        HTMLElementConstructor && activeElement instanceof HTMLElementConstructor
          ? activeElement
          : null;
      firstButton.focus();
    };

    ownerDocument.addEventListener("keydown", focusToolbar);
    return () => ownerDocument.removeEventListener("keydown", focusToolbar);
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
  const text = range?.toString() ?? "";

  return (
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
      <div ref={rootRef} className="contents">
        {children}
      </div>
      <div ref={portalContainerRef} className="absolute size-0" />
      {anchor ? (
        <MessageTextSelectionToolbar
          ref={toolbarRef}
          aria-label="Text selection actions"
          aria-keyshortcuts="Shift+F10"
          role="toolbar"
          render={
            <PopoverContent
              align="center"
              anchor={anchor}
              collisionAvoidance={{ side: "shift", align: "shift", fallbackAxisSide: "none" }}
              collisionPadding={8}
              container={container === undefined ? portalContainerRef.current : container}
              finalFocus={false}
              initialFocus={false}
              side="top"
              sideOffset={8}
              onPointerDown={(event) => event.preventDefault()}
            />
          }
        >
          {onQuote ? (
            <>
              <MessageTextSelectionToolbarButton
                onClick={() => {
                  onQuote(text);
                  clear();
                }}
              >
                <TextQuote size={13} />
                Quote
              </MessageTextSelectionToolbarButton>
              <MessageTextSelectionToolbarSeparator />
            </>
          ) : null}
          <MessageTextSelectionToolbarButton
            onClick={() => {
              if (text) void navigator.clipboard.writeText(text);
              clear();
            }}
          >
            <Copy size={13} />
            Copy
          </MessageTextSelectionToolbarButton>
        </MessageTextSelectionToolbar>
      ) : null}
    </Popover>
  );
}

export function MessageTextSelectionShowcaseComposition() {
  const [quoted, setQuoted] = useState("");

  return (
    <div className="grid w-full max-w-3xl gap-2">
      <MessageTextSelectionComposition onQuote={setQuoted}>
        <p className="max-w-[65ch] text-sm text-foreground">
          Select this sentence to expose the Quote and Copy toolbar, without making text selection a
          message-row concern.
        </p>
      </MessageTextSelectionComposition>
      {quoted ? (
        <p className="inline-flex items-center gap-1 text-xs text-foreground-muted" role="status">
          <Quote size={12} /> Quoted selection: {quoted}
        </p>
      ) : (
        <p className="inline-flex items-center gap-1 text-xs text-foreground-muted">
          <Copy size={12} /> Select text to inspect the contextual actions.
        </p>
      )}
    </div>
  );
}
