import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { messageItem, type DataAttributes } from "./recipe";

export type MessageAttachmentCardProps = useRender.ComponentProps<"button"> & {
  optimistic?: boolean;
  loading?: boolean;
};

export function MessageAttachmentCard({
  optimistic,
  loading,
  className,
  render,
  ...props
}: MessageAttachmentCardProps) {
  const { attachmentCard } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "aria-busy": loading ? "true" : undefined,
    "data-loading": loading ? "true" : undefined,
    "data-optimistic": optimistic ? "true" : undefined,
    className: attachmentCard({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-attachment-card",
    },
  });
}

export type MessageAttachmentIconProps = useRender.ComponentProps<"span">;

export function MessageAttachmentIcon({ className, render, ...props }: MessageAttachmentIconProps) {
  const { attachmentIcon } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: attachmentIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-icon",
    },
  });
}

export type MessageAttachmentBodyProps = useRender.ComponentProps<"span">;

export function MessageAttachmentBody({ className, render, ...props }: MessageAttachmentBodyProps) {
  const { attachmentBody } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: attachmentBody({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-body",
    },
  });
}

export type MessageAttachmentTitleProps = useRender.ComponentProps<"span">;

export function MessageAttachmentTitle({
  className,
  render,
  ...props
}: MessageAttachmentTitleProps) {
  const { attachmentTitle } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: attachmentTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-title",
    },
  });
}

export type MessageAttachmentMetaProps = useRender.ComponentProps<"span">;

export function MessageAttachmentMeta({ className, render, ...props }: MessageAttachmentMetaProps) {
  const { attachmentMeta } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: attachmentMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-meta",
    },
  });
}

export type MessageAttachmentActionProps = useRender.ComponentProps<"span">;

export function MessageAttachmentAction({
  className,
  render,
  ...props
}: MessageAttachmentActionProps) {
  const { attachmentAction } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: attachmentAction({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-action",
    },
  });
}
