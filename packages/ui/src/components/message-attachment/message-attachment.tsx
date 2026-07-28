import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
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

export type MessageAttachmentContentProps = useRender.ComponentProps<"div">;

export function MessageAttachmentContent({
  className,
  render,
  ...props
}: MessageAttachmentContentProps) {
  const theme = useThemeFamily();
  const { content } = messageAttachment({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-content",
    },
  });
}

export type MessageAttachmentTitleProps = useRender.ComponentProps<"span">;

export function MessageAttachmentTitle({
  className,
  render,
  ...props
}: MessageAttachmentTitleProps) {
  const theme = useThemeFamily();
  const { title } = messageAttachment({ theme });
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
  const theme = useThemeFamily();
  const { meta } = messageAttachment({ theme });
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

export type MessageAttachmentMetaLabelProps = useRender.ComponentProps<"span">;

export function MessageAttachmentMetaLabel({
  className,
  render,
  ...props
}: MessageAttachmentMetaLabelProps) {
  const { metaLabel } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: metaLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-meta-label",
    },
  });
}

export type MessageAttachmentMetaDetailProps = useRender.ComponentProps<"span">;

export function MessageAttachmentMetaDetail({
  className,
  render,
  ...props
}: MessageAttachmentMetaDetailProps) {
  const { metaDetail } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: metaDetail({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-meta-detail",
    },
  });
}

export type MessageAttachmentMetaSeparatorProps = useRender.ComponentProps<"span">;

export function MessageAttachmentMetaSeparator({
  className,
  render,
  ...props
}: MessageAttachmentMetaSeparatorProps) {
  const { metaSeparator } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    "aria-hidden": true,
    className: metaSeparator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-meta-separator",
    },
  });
}

export type MessageAttachmentSummaryProps = useRender.ComponentProps<"span">;

export function MessageAttachmentSummary({
  className,
  render,
  ...props
}: MessageAttachmentSummaryProps) {
  const theme = useThemeFamily();
  const { summary } = messageAttachment({ theme });
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
  const theme = useThemeFamily();
  const { commentSummary, summary } = messageAttachment({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: summary({ className: commentSummary({ className }) }),
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
  const theme = useThemeFamily();
  const { diffSummary, summary } = messageAttachment({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: summary({ className: diffSummary({ className }) }),
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
  const theme = useThemeFamily();
  const { diffAddition } = messageAttachment({ theme });
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
  const theme = useThemeFamily();
  const { diffDeletion } = messageAttachment({ theme });
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
  const theme = useThemeFamily();
  const { action } = messageAttachment({ theme });
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
