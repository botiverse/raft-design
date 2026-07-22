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

export type MessageAttachmentFrameProps = useRender.ComponentProps<"div">;

export function MessageAttachmentFrame({
  className,
  render,
  ...props
}: MessageAttachmentFrameProps) {
  const { frame } = messageAttachment();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: frame({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-attachment-frame",
    },
  });
}

export type MessageAttachmentCardProps = useRender.ComponentProps<"div">;

export function MessageAttachmentCard({ className, render, ...props }: MessageAttachmentCardProps) {
  const theme = useThemeFamily();
  const { card } = messageAttachment({ theme });
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

export type MessageAttachmentIconProps = useRender.ComponentProps<"span">;

export function MessageAttachmentIcon({ className, render, ...props }: MessageAttachmentIconProps) {
  const theme = useThemeFamily();
  const { icon } = messageAttachment({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: icon({ className }),
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
  const { body } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: body({ className }),
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

export type MessageAttachmentLoadingBarProps = useRender.ComponentProps<"span">;

export function MessageAttachmentLoadingBar({
  className,
  render,
  ...props
}: MessageAttachmentLoadingBarProps) {
  const theme = useThemeFamily();
  const { loadingBar } = messageAttachment({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: loadingBar({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-loading-bar",
    },
  });
}

export type MessageAttachmentActionProps = useRender.ComponentProps<"button">;

export type MessageAttachmentActionsProps = useRender.ComponentProps<"span">;

export function MessageAttachmentActions({
  className,
  render,
  ...props
}: MessageAttachmentActionsProps) {
  const { actions } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-actions",
    },
  });
}

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

export type MessageAttachmentPendingIndicatorProps = useRender.ComponentProps<"span">;

export function MessageAttachmentPendingIndicator({
  className,
  render,
  ...props
}: MessageAttachmentPendingIndicatorProps) {
  const theme = useThemeFamily();
  const { pendingIndicator } = messageAttachment({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: pendingIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-pending-indicator",
    },
  });
}

export type MessageAttachmentErrorOverlayProps = useRender.ComponentProps<"span">;

export function MessageAttachmentErrorOverlay({
  className,
  render,
  ...props
}: MessageAttachmentErrorOverlayProps) {
  const { errorOverlay } = messageAttachment();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: errorOverlay({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-attachment-error-overlay",
    },
  });
}
