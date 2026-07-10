import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Check } from "lucide-react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Badge } from "../badge";
import {
  messageItem,
  type DataAttributes,
  type MessageItemBadgeTone,
  type MessageItemRowState,
  type MessageItemVariantProps,
} from "./recipe";

export type MessageItemProps = useRender.ComponentProps<"div"> &
  Pick<MessageItemVariantProps, "compact" | "menuOpen"> & {
    rowState?: MessageItemRowState;
  };

export function MessageItem({
  className,
  compact,
  menuOpen,
  render,
  rowState,
  ...props
}: MessageItemProps) {
  const theme = useThemeFamily();
  const { root } = messageItem({ compact, menuOpen, rowState, theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-menu-open": menuOpen ? "true" : undefined,
    "data-row-state": rowState,
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item",
    },
  });
}

export type MessageItemGutterProps = useRender.ComponentProps<"div">;

export function MessageItemGutter({ className, render, ...props }: MessageItemGutterProps) {
  const { gutter } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: gutter({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-gutter",
    },
  });
}

export type MessageItemAvatarSlotProps = useRender.ComponentProps<"div">;

export function MessageItemAvatarSlot({ className, render, ...props }: MessageItemAvatarSlotProps) {
  const { avatarSlot } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: avatarSlot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-avatar-slot",
    },
  });
}

export type MessageItemAvatarStatusProps = useRender.ComponentProps<"span"> & {
  border?: "always" | "auto";
  offset?: "fixed" | "scaled";
};

export function MessageItemAvatarStatus({
  border = "auto",
  className,
  offset = "scaled",
  render,
  ...props
}: MessageItemAvatarStatusProps) {
  const theme = useThemeFamily();
  const { avatarStatus } = messageItem({
    avatarStatusBorder: border,
    avatarStatusOffset: offset,
    theme,
  });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: avatarStatus({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-avatar-status",
    },
  });
}

export type MessageItemSelectMarkProps = Omit<useRender.ComponentProps<"span">, "children"> & {
  checked?: boolean;
};

export function MessageItemSelectMark({
  checked = false,
  className,
  render,
  ...props
}: MessageItemSelectMarkProps) {
  const { selectMark } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-hidden": true,
    "data-checked": checked ? "true" : "false",
    className: selectMark({ className }),
    children: checked ? <Check aria-hidden /> : null,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-select-mark",
    },
  });
}

export type MessageItemContinuationTimeProps = useRender.ComponentProps<"span">;

export function MessageItemContinuationTime({
  className,
  render,
  ...props
}: MessageItemContinuationTimeProps) {
  const theme = useThemeFamily();
  const { continuationTime } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: continuationTime({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-continuation-time",
    },
  });
}

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

export type MessageItemHeaderProps = useRender.ComponentProps<"div">;

export function MessageItemHeader({ className, render, ...props }: MessageItemHeaderProps) {
  const theme = useThemeFamily();
  const { header } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-header",
    },
  });
}

export type MessageItemSenderProps = useRender.ComponentProps<"span">;

export function MessageItemSender({ className, render, ...props }: MessageItemSenderProps) {
  const theme = useThemeFamily();
  const { sender } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: sender({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-sender",
    },
  });
}

export type MessageItemSenderStateProps = useRender.ComponentProps<"span">;

export function MessageItemSenderState({
  className,
  render,
  ...props
}: MessageItemSenderStateProps) {
  const theme = useThemeFamily();
  const { senderState } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: senderState({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-sender-state",
    },
  });
}

export type MessageItemMetaProps = useRender.ComponentProps<"span">;

export function MessageItemMeta({ className, render, ...props }: MessageItemMetaProps) {
  const theme = useThemeFamily();
  const { meta } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-meta",
    },
  });
}

export type MessageItemTimeProps = useRender.ComponentProps<"span">;

export function MessageItemTime({ className, render, ...props }: MessageItemTimeProps) {
  const theme = useThemeFamily();
  const { time } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: time({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-time",
    },
  });
}

export type MessageItemInlineStatusProps = useRender.ComponentProps<"span">;

export function MessageItemInlineStatus({
  className,
  render,
  ...props
}: MessageItemInlineStatusProps) {
  const theme = useThemeFamily();
  const { inlineStatus } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: inlineStatus({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-inline-status",
    },
  });
}

export type MessageItemBodyProps = useRender.ComponentProps<"div">;

export function MessageItemBody({ className, render, ...props }: MessageItemBodyProps) {
  const theme = useThemeFamily();
  const { body } = messageItem({ theme });
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

export type MessageItemNoticeProps = useRender.ComponentProps<"div">;

export function MessageItemNotice({ className, render, ...props }: MessageItemNoticeProps) {
  const { notice } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: notice({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-notice",
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

export type MessageItemBadgeProps = useRender.ComponentProps<"span"> & {
  tone?: MessageItemBadgeTone;
};

export function MessageItemBadge({ className, tone = "default", ...props }: MessageItemBadgeProps) {
  const theme = useThemeFamily();
  const { badge } = messageItem({ badgeTone: tone, theme });
  return (
    <Badge
      appearance={tone === "cyan" || theme === "elegant" ? "soft" : "outline"}
      data-slot="message-item-badge"
      uppercase={false}
      variant={tone === "cyan" ? "primary" : "default"}
      className={badge({ className })}
      {...props}
    />
  );
}

export type MessageItemToolbarProps = useRender.ComponentProps<"div"> & {
  visible?: boolean;
};

export function MessageItemToolbar({
  className,
  render,
  visible,
  ...props
}: MessageItemToolbarProps) {
  const theme = useThemeFamily();
  const { toolbar } = messageItem({ toolbarVisible: visible, theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-toolbar",
    },
  });
}

export type MessageItemToolbarButtonProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
  saved?: boolean;
};

export function MessageItemToolbarButton({
  active,
  saved,
  className,
  render,
  ...props
}: MessageItemToolbarButtonProps) {
  const theme = useThemeFamily();
  const { toolbarButton } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-active": active ? "true" : undefined,
    "data-saved": saved ? "true" : undefined,
    className: toolbarButton({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-item-toolbar-button",
    },
  });
}

export type MessageItemSavedIndicatorProps = useRender.ComponentProps<"span">;

export function MessageItemSavedIndicator({
  className,
  render,
  ...props
}: MessageItemSavedIndicatorProps) {
  const theme = useThemeFamily();
  const { savedIndicator } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    "aria-hidden": true,
    className: savedIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-saved-indicator",
    },
  });
}

export type SystemMessageItemProps = useRender.ComponentProps<"div">;

export function SystemMessageItem({ className, render, ...props }: SystemMessageItemProps) {
  const { systemRoot } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    className: systemRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "system-message-item",
    },
  });
}

export type SystemMessageItemTimeProps = useRender.ComponentProps<"span">;

export function SystemMessageItemTime({ className, render, ...props }: SystemMessageItemTimeProps) {
  const { systemTime } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: systemTime({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "system-message-item-time",
    },
  });
}

export type SystemMessageItemContentProps = useRender.ComponentProps<"span">;

export function SystemMessageItemContent({
  className,
  render,
  ...props
}: SystemMessageItemContentProps) {
  const { systemContent } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: systemContent({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "system-message-item-content",
    },
  });
}
