import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Copy, Quote, TextQuote } from "lucide-react";
import {
  Popover,
  PopoverContent,
  MessageTextSelectionToolbar,
  MessageTextSelectionToolbarButton,
  MessageTextSelectionToolbarSeparator,
} from "@botiverse/raft-ui";
import type { PopoverContentProps } from "@botiverse/raft-ui";

export type MessageTextSelectionCompositionProps = {
  children: ReactNode;
  container?: PopoverContentProps["container"];
  onQuote?: (text: string) => void;
};

const COLLISION_AVOIDANCE = { side: "shift", align: "shift", fallbackAxisSide: "none" } as const;

function selectionBelongsToRoot(range: Range, root: HTMLElement) {
  return root.contains(range.startContainer) && root.contains(range.endContainer);
}

function preventDefault(event: { preventDefault: () => void }) {
  event.preventDefault();
}

export function MessageTextSelectionComposition({
  children,
  container,
  onQuote,
}: MessageTextSelectionCompositionProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [range, setRange] = useState<Range | null>(null);

  const clear = useCallback(() => {
    const selection = root?.ownerDocument.getSelection();
    if (root && selection?.rangeCount && selectionBelongsToRoot(selection.getRangeAt(0), root)) {
      selection.removeAllRanges();
    }
    setRange(null);

    const restoreFocus = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (restoreFocus?.isConnected) queueMicrotask(() => restoreFocus.focus());
  }, [root]);

  useEffect(() => {
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
  }, [root]);

  useEffect(() => {
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
  }, [clear, range, root]);

  const anchor = useMemo<PopoverContentProps["anchor"]>(() => {
    if (!range) return null;
    return {
      contextElement: root ?? undefined,
      getBoundingClientRect: () => range.getBoundingClientRect(),
      getClientRects: () => Array.from(range.getClientRects()),
    };
  }, [range, root]);
  const text = range?.toString() ?? "";

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) return;
      const selection = root?.ownerDocument.getSelection();
      const preservesCurrentSelection =
        root &&
        selection &&
        !selection.isCollapsed &&
        selection.rangeCount > 0 &&
        selectionBelongsToRoot(selection.getRangeAt(0), root);
      if (!preservesCurrentSelection) clear();
    },
    [clear, root],
  );

  const handleQuote = useCallback(() => {
    onQuote?.(text);
    clear();
  }, [clear, onQuote, text]);

  const handleCopy = useCallback(() => {
    if (text) void navigator.clipboard.writeText(text);
    clear();
  }, [clear, text]);

  return (
    <Popover open={Boolean(anchor)} onOpenChange={handleOpenChange}>
      <div ref={setRoot} className="contents">
        {children}
      </div>
      <div ref={setPortalContainer} className="absolute size-0" />
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
              collisionAvoidance={COLLISION_AVOIDANCE}
              collisionPadding={8}
              container={container === undefined ? portalContainer : container}
              finalFocus={false}
              initialFocus={false}
              side="top"
              sideOffset={8}
              onPointerDown={preventDefault}
            />
          }
        >
          {onQuote ? (
            <>
              <MessageTextSelectionToolbarButton onClick={handleQuote}>
                <TextQuote size={13} />
                Quote
              </MessageTextSelectionToolbarButton>
              <MessageTextSelectionToolbarSeparator />
            </>
          ) : null}
          <MessageTextSelectionToolbarButton onClick={handleCopy}>
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
