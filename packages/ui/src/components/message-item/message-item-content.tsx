import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useCallback, useLayoutEffect, useRef } from "react";
import { messageItem } from "./message-item.recipe";

export type MessageItemContentProps = useRender.ComponentProps<"div">;

export function MessageItemContent({ className, render, ...props }: MessageItemContentProps) {
  const { content } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-content",
    },
  });
}

export type MessageItemBodyProps = useRender.ComponentProps<"div">;

export function MessageItemBody({ className, render, ...props }: MessageItemBodyProps) {
  const { body } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-body",
    },
  });
}

export type MessageItemEditedProps = useRender.ComponentProps<"span">;

/**
 * The edited marker, inline at the end of the message text on every row, full
 * or continuation. Put it inside the last paragraph so it follows the last
 * word; pass the copy ("(edited)") as children and the edit time as its tooltip.
 */
export function MessageItemEdited({ className, render, ...props }: MessageItemEditedProps) {
  const { edited } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: edited({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-edited",
    },
  });
}

export type MessageItemSearchMatchProps = useRender.ComponentProps<"mark">;

export function MessageItemSearchMatch({
  className,
  render,
  ...props
}: MessageItemSearchMatchProps) {
  const { searchMatch } = messageItem();
  const defaultProps: useRender.ElementProps<"mark"> = {
    className: searchMatch({ className }),
  };

  return useRender({
    defaultTagName: "mark",
    render,
    props: mergeProps<"mark">(defaultProps, props),
    state: {
      slot: "message-item-search-match",
    },
  });
}

export type MessageItemEmbeddedProps = useRender.ComponentProps<"div">;

export function MessageItemEmbedded({ className, render, ...props }: MessageItemEmbeddedProps) {
  const { embedded } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: embedded({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-embedded",
    },
  });
}

export type MessageItemAttachmentsProps = useRender.ComponentProps<"div">;

export function MessageItemAttachments({
  className,
  render,
  ...props
}: MessageItemAttachmentsProps) {
  const { attachments } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: attachments({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-attachments",
    },
  });
}

export type MessageItemFooterProps = useRender.ComponentProps<"div">;

export function MessageItemFooter({ className, render, ...props }: MessageItemFooterProps) {
  const { footer } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-footer",
    },
  });
}

export type MessageItemTrailingProps = useRender.ComponentProps<"span">;

/** The space kept before a trailing slot on the body's last line. */
const TRAILING_GAP_PX = 8;
const BODY_SELECTOR = '[data-slot="message-item-body"]';
const TEXT_BLOCKS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN"]);
const BLOCKS = new Set([
  ...TEXT_BLOCKS,
  "UL",
  "OL",
  "BLOCKQUOTE",
  "PRE",
  "TABLE",
  "DIV",
  "FIGURE",
  "IMG",
]);

// One observer for every slot on the page (a ResizeObserver per row is what
// the hover toolbar gave up, message-item.md). It watches each slot, for its
// width, and each slot's body: a body that changes size may end with a
// different block (a paragraph that became a code block without the row
// rendering again), so its last line is stamped again. Nothing reads layout
// in a layout effect.
const slotOfBody = new WeakMap<Element, Element>();
// The callback only records what changed; the writes wait for the next frame.
// Writing the room (or the line's mark) in the callback resizes the observed
// body at the same depth, which the browser reports as "ResizeObserver loop
// completed with undelivered notifications" (Kirby's review, 2026-11-05).
const pendingWidths = new Map<HTMLElement, number>();
const pendingStamps = new Map<HTMLElement, Element>();
let frame = 0;
function flush() {
  frame = 0;
  for (const [body, width] of pendingWidths)
    body.style.setProperty("--message-trailing-width", `${Math.ceil(width) + TRAILING_GAP_PX}px`);
  for (const [body, slot] of pendingStamps) if (body.contains(slot)) stampLastLine(body, slot);
  pendingWidths.clear();
  pendingStamps.clear();
}
let sharedObserver: ResizeObserver | null = null;
function trailingObserver(): ResizeObserver | null {
  if (typeof ResizeObserver === "undefined") return null;
  sharedObserver ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement;
      const slot = slotOfBody.get(target);
      if (slot) {
        pendingStamps.set(target, slot);
        continue;
      }
      const body = target.closest<HTMLElement>(BODY_SELECTOR);
      if (!body) continue;
      const box = entry.borderBoxSize?.[0];
      pendingWidths.set(body, box ? box.inlineSize : entry.contentRect.width);
    }
    if (!frame) frame = requestAnimationFrame(flush);
  });
  return sharedObserver;
}

/** Marks the text block the slot ends (`data-trailing-line`), or the body as ending in a block. */
function stampLastLine(body: HTMLElement, slot: Element) {
  const block = lastBlock(body, slot);
  const line = block ? lastLine(block) : null;
  const previous = body.querySelector("[data-trailing-line]");
  if (previous && previous !== line) previous.removeAttribute("data-trailing-line");
  if (line && !line.hasAttribute("data-trailing-line")) line.setAttribute("data-trailing-line", "");
  const ending = line ? "line" : "block";
  if (body.dataset.trailing !== ending) body.dataset.trailing = ending;
}

/** The body's last block before the slot, through wrappers that only hold blocks (a markdown root). */
function lastBlock(body: Element, slot: Element): Element | null {
  let el: Element | null = slot.previousElementSibling;
  while (el && !BLOCKS.has(el.tagName)) el = el.previousElementSibling;
  while (
    el &&
    el.tagName === "DIV" &&
    !el.hasAttribute("data-slot") &&
    el.lastElementChild &&
    BLOCKS.has(el.lastElementChild.tagName)
  )
    el = el.lastElementChild;
  return el && body.contains(el) ? el : null;
}

/** The text block that ends a last block, or null when it ends with something else. */
function lastLine(block: Element): Element | null {
  if (TEXT_BLOCKS.has(block.tagName)) return block;
  if (block.tagName === "UL" || block.tagName === "OL") {
    const item = block.lastElementChild;
    if (!item || item.tagName !== "LI") return null;
    const inner = item.lastElementChild;
    if (inner && inner.tagName === "P") return inner;
    return inner && BLOCKS.has(inner.tagName) ? null : item;
  }
  if (block.tagName === "BLOCKQUOTE") {
    const inner = block.lastElementChild;
    return inner && inner.tagName === "P" ? inner : null;
  }
  return null;
}

/**
 * Something small that ends the message (the faces of the agents that read it,
 * a read mark): the last child of `MessageItemBody`. It takes no column: it sits
 * at the inline end of the body's last line, and the last line keeps room for it,
 * so the text wraps under it only when that line is full. When the body ends with
 * a block that isn't text (a code block, a table, an image), it sits on a line of
 * its own under that block. Logical properties, so it is right in RTL too.
 *
 * It finds the body's last block itself and stamps it (`data-trailing-line`, or
 * `data-trailing="block"` on the body), so the CSS needs no structural selector,
 * and one shared ResizeObserver sets the room (`--message-trailing-width`).
 */
export function MessageItemTrailing({
  className,
  render,
  ref,
  ...props
}: MessageItemTrailingProps) {
  const { trailing } = messageItem();
  const own = useRef<HTMLSpanElement | null>(null);
  // Every render: the body may have changed (an edit), so the last block is found again.
  useLayoutEffect(() => {
    const slot = own.current;
    const body = slot?.closest<HTMLElement>(BODY_SELECTOR);
    if (slot && body) stampLastLine(body, slot);
  });
  useLayoutEffect(() => {
    const slot = own.current;
    const body = slot?.closest<HTMLElement>(BODY_SELECTOR);
    const observer = trailingObserver();
    if (slot && observer) observer.observe(slot);
    if (slot && body && observer) {
      slotOfBody.set(body, slot);
      observer.observe(body);
    }
    return () => {
      if (slot && observer) observer.unobserve(slot);
      if (body) {
        if (observer) observer.unobserve(body);
        slotOfBody.delete(body);
        body.querySelector("[data-trailing-line]")?.removeAttribute("data-trailing-line");
        delete body.dataset.trailing;
        body.style.removeProperty("--message-trailing-width");
      }
    };
  }, []);
  const setRef = useCallback(
    (el: HTMLSpanElement | null) => {
      own.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );
  const defaultProps: useRender.ElementProps<"span"> = {
    className: trailing({ className }),
    ref: setRef,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-trailing",
    },
  });
}
