import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { messageAttachment } from "./message-attachment.recipe";

export type MessageAttachmentGroupProps = useRender.ComponentProps<"div">;

export function MessageAttachmentGroup({
  className,
  render,
  ...props
}: MessageAttachmentGroupProps) {
  const { group } = messageAttachment();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: group({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-group",
    },
  });
}

export type MessageAttachmentCardProps = useRender.ComponentProps<"div">;

export function MessageAttachmentCard({ className, render, ...props }: MessageAttachmentCardProps) {
  const { card } = messageAttachment();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: card({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-card",
    },
  });
}

export type MessageAttachmentTitleProps = useRender.ComponentProps<"span">;

export function MessageAttachmentTitle({
  className,
  render,
  ...props
}: MessageAttachmentTitleProps) {
  const { title } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: title({ className }),
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
  const { meta } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: meta({ className }),
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

export type MessageAttachmentMetaStartProps = useRender.ComponentProps<"span">;

export function MessageAttachmentMetaStart({
  className,
  render,
  ...props
}: MessageAttachmentMetaStartProps) {
  const { metaStart } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: metaStart({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-meta-start",
    },
  });
}

export type MessageAttachmentMetaEndProps = useRender.ComponentProps<"span">;

export function MessageAttachmentMetaEnd({
  className,
  render,
  ...props
}: MessageAttachmentMetaEndProps) {
  const { metaEnd } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: metaEnd({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-meta-end",
    },
  });
}

export type MessageAttachmentSummaryProps = useRender.ComponentProps<"span">;

export function MessageAttachmentSummary({
  className,
  render,
  ...props
}: MessageAttachmentSummaryProps) {
  const { summary } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: summary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-summary",
    },
  });
}

export type MessageAttachmentCommentSummaryProps = useRender.ComponentProps<"span">;

export function MessageAttachmentCommentSummary({
  className,
  render,
  ...props
}: MessageAttachmentCommentSummaryProps) {
  const { commentSummary } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: commentSummary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-comment-summary",
    },
  });
}

export type MessageAttachmentDiffSummaryProps = useRender.ComponentProps<"span">;

export function MessageAttachmentDiffSummary({
  className,
  render,
  ...props
}: MessageAttachmentDiffSummaryProps) {
  const { diffSummary } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: diffSummary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-diff-summary",
    },
  });
}

export type MessageAttachmentDiffAdditionProps = useRender.ComponentProps<"span">;

export function MessageAttachmentDiffAddition({
  className,
  render,
  ...props
}: MessageAttachmentDiffAdditionProps) {
  const { diffAddition } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: diffAddition({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-diff-addition",
    },
  });
}

export type MessageAttachmentDiffDeletionProps = useRender.ComponentProps<"span">;

export function MessageAttachmentDiffDeletion({
  className,
  render,
  ...props
}: MessageAttachmentDiffDeletionProps) {
  const { diffDeletion } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: diffDeletion({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-diff-deletion",
    },
  });
}

export type MessageAttachmentActionProps = useRender.ComponentProps<"button">;

export function MessageAttachmentAction({
  className,
  render,
  ...props
}: MessageAttachmentActionProps) {
  const { action } = messageAttachment();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-attachment-action",
    },
  });
}
