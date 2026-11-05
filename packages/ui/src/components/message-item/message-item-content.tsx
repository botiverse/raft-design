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

/**
 * Something small that ends the message (the faces of the agents that read it,
 * a read mark): the last child of `MessageItemBody`. It takes no column: it sits
 * at the inline end of the body's last line, and the last line keeps room for it
 * (`--message-trailing-width`, which it measures and sets on the body, with
 * `data-trailing`), so the
 * text wraps under it only when that line is full. When the body ends with a
 * block that isn't text (a code block, a table, an image), it sits on a line of
 * its own under that block. Logical properties, so it is right in RTL too.
 */
export function MessageItemTrailing({
  className,
  render,
  ref,
  ...props
}: MessageItemTrailingProps) {
  const { trailing } = messageItem();
  const own = useRef<HTMLSpanElement | null>(null);
  const measure = useCallback(() => {
    const el = own.current;
    const body = el?.parentElement;
    if (!el || !body) return;
    body.dataset.trailing = "";
    body.style.setProperty(
      "--message-trailing-width",
      `${Math.ceil(el.getBoundingClientRect().width) + TRAILING_GAP_PX}px`,
    );
  }, []);
  useLayoutEffect(() => {
    const el = own.current;
    const body = el?.parentElement;
    measure();
    const release = () => {
      body?.style.removeProperty("--message-trailing-width");
      if (body) delete body.dataset.trailing;
    };
    if (!el || typeof ResizeObserver === "undefined") return release;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      release();
    };
  }, [measure]);
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
