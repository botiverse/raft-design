import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
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
