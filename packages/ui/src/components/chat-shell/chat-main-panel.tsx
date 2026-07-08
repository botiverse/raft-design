import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./chat-shell";

const chatMainPanel = tv({
  slots: {
    root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col", "text-foreground"],
    header: ["flex h-[62px] shrink-0 items-center gap-3 px-5", "[@media(max-height:600px)]:h-12"],
    headerIcon: [
      "flex size-9 shrink-0 items-center justify-center",
      "border-2",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    titleBlock: ["min-w-0 flex-1"],
    title: ["truncate text-base font-bold leading-tight"],
    subtitle: ["truncate font-mono text-xs"],
    actions: ["flex shrink-0 items-center gap-1.5"],
    action: [
      "relative inline-flex size-7 shrink-0 items-center justify-center",
      "font-sans font-bold leading-none outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "disabled:pointer-events-none disabled:opacity-40 disabled:transform-none",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    tabs: ["shrink-0"],
    alert: ["flex shrink-0 items-center justify-between gap-3 px-5 py-2", "text-xs font-bold"],
    alertAction: [
      "inline-flex size-6 shrink-0 items-center justify-center",
      "font-sans font-bold leading-none outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    jumpToLatest: [
      "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5",
      "px-3 py-1.5 font-sans text-xs font-bold outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    body: ["relative min-h-0 flex-1 overflow-hidden"],
    timeline: [
      "relative h-full overflow-y-auto overscroll-contain",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    messageList: ["flex min-h-full flex-col"],
    footer: [
      "relative flex shrink-0 items-center px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
    ],
    composer: ["flex w-full flex-col gap-2 border-2 p-2"],
    composerInput: [
      "min-h-5 max-h-32 w-full resize-none bg-transparent text-base leading-5 outline-none md:min-h-10 md:text-sm",
    ],
    composerToolbar: ["flex items-center justify-between gap-3"],
    composerActions: ["flex items-center gap-2"],
    composerMeta: ["flex items-center gap-3"],
    composerIconButton: [
      "inline-flex shrink-0 items-center justify-center",
      "border-2 p-1 font-sans font-bold leading-none outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    composerSubmit: [
      "inline-flex size-7 shrink-0 items-center justify-center",
      "border-2 font-sans font-bold leading-none outline-none",
      "transition-all duration-100",
      "active:translate-x-[1px] active:translate-y-[1px]",
      "disabled:pointer-events-none disabled:opacity-30 disabled:transform-none",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    composerAttachments: ["flex flex-wrap gap-2"],
    composerAttachment: ["group/composer-attachment relative"],
    composerAttachmentImage: ["size-16 border-2 object-cover"],
    composerAttachmentFile: [
      "flex h-16 w-32 items-center gap-2 border-2 px-2",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    composerAttachmentBody: ["block min-w-0"],
    composerAttachmentTitle: ["block truncate text-xs font-bold"],
    composerAttachmentMeta: ["block truncate text-[10px]"],
    composerAttachmentOverlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center border-2 px-1",
      "text-center text-[10px] font-bold",
    ],
    composerAttachmentProgress: ["absolute bottom-0 left-0 h-1 w-full"],
    composerAttachmentProgressFill: ["h-full"],
    composerAttachmentRemove: [
      "absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full",
      "opacity-0 transition-opacity group-hover/composer-attachment:opacity-100",
      "[@media(hover:none)]:h-6 [@media(hover:none)]:w-6 [@media(hover:none)]:opacity-100",
      "[&_svg]:size-2.5 [&_svg]:shrink-0",
    ],
    composerDropOverlay: [
      "absolute inset-0 z-30 flex items-center justify-center border-2 border-dashed",
    ],
    composerDropOverlayLabel: ["border-2 px-3 py-1.5 text-sm font-bold"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: "border-b-2 border-black bg-white",
        headerIcon: "border-black bg-soft-signal text-black",
        title: "text-black",
        subtitle: "text-black/50",
        action: [
          "rounded-none border-2 border-black bg-white text-black",
          "shadow-brutal-sm",
          "hover:-translate-y-px hover:bg-white hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
          "disabled:shadow-brutal-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        tabs: "border-b-2 border-black bg-white",
        alert: "border-b-2 border-black bg-brutal-orange/20 text-black",
        alertAction: [
          "rounded-none border-2 border-black bg-white text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
        ],
        jumpToLatest: [
          "border-2 border-black bg-white text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
        ],
        body: "bg-white",
        timeline: "bg-white",
        footer: "border-t-2 border-black bg-white",
        composer: "border-black bg-white shadow-brutal-sm focus-within:shadow-brutal",
        composerInput: "font-sans text-black placeholder:text-black/35",
        composerIconButton: [
          "border-black bg-white text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:bg-white hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
        ],
        composerSubmit: [
          "border-black bg-brutal-pink text-black shadow-brutal-sm",
          "hover:-translate-y-px hover:shadow-brutal",
          "active:shadow-[var(--shadow-brutal-active)]",
          "disabled:shadow-brutal-sm",
        ],
        composerAttachmentImage: "border-black",
        composerAttachmentFile: "border-black bg-white [&_svg]:text-black/70",
        composerAttachmentTitle: "text-black",
        composerAttachmentMeta: "text-black/50",
        composerAttachmentProgress: "bg-black/15",
        composerAttachmentProgressFill: "bg-brutal-pink",
        composerAttachmentRemove: "bg-black text-white",
        composerDropOverlay: "border-brutal-pink bg-brutal-pink/15",
        composerDropOverlayLabel: "border-black bg-white text-black shadow-brutal-sm",
      },
      elegant: {
        root: "bg-layer-panel font-sans text-foreground",
        header: "border-b border-line-subtle bg-layer-panel",
        headerIcon: "rounded-md border-line-subtle bg-layer-muted text-foreground-strong",
        title: "text-foreground-strong",
        subtitle: "text-foreground-muted",
        action: [
          "rounded-md border border-line-subtle bg-layer-panel text-foreground-strong",
          "shadow-xs",
          "hover:bg-layer-muted",
          "focus-visible:ring-2 focus-visible:ring-line-focus",
        ],
        tabs: "border-b border-line-subtle bg-layer-panel",
        alert: "border-b border-line-subtle bg-warning-lighter text-foreground-strong",
        alertAction: [
          "rounded-md border border-line-subtle bg-layer-panel text-foreground-strong shadow-xs",
          "hover:bg-layer-muted",
        ],
        jumpToLatest: [
          "rounded-md border border-line-subtle bg-layer-panel text-foreground-strong shadow-sm",
          "hover:bg-layer-muted",
        ],
        body: "bg-layer-panel",
        timeline: "bg-layer-panel",
        footer: "border-t border-line-subtle bg-layer-panel",
        composer: "rounded-md border-line-subtle bg-layer-panel shadow-xs",
        composerInput: "font-sans text-foreground-strong placeholder:text-foreground-placeholder",
        composerIconButton: [
          "rounded-md border-line-subtle bg-layer-panel text-foreground-strong shadow-xs",
          "hover:bg-layer-muted",
        ],
        composerSubmit: [
          "rounded-md border-line-subtle bg-accent-400 text-accent-950 shadow-xs",
          "hover:bg-accent-500",
        ],
        composerAttachmentImage: "rounded-md border-line-subtle",
        composerAttachmentFile:
          "rounded-md border-line-subtle bg-layer-panel [&_svg]:text-foreground-muted",
        composerAttachmentTitle: "text-foreground-strong",
        composerAttachmentMeta: "text-foreground-muted",
        composerAttachmentProgress: "bg-line-muted",
        composerAttachmentProgressFill: "bg-accent-400",
        composerAttachmentRemove: "bg-foreground-strong text-white",
        composerDropOverlay: "rounded-md border-accent-400 bg-accent-400/15",
        composerDropOverlayLabel:
          "rounded-md border-line-subtle bg-layer-panel text-foreground-strong shadow-sm",
      },
    },
    attachmentTone: {
      uploading: {},
      failed: {
        composerAttachmentOverlay: "leading-3",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      attachmentTone: "uploading",
      class: { composerAttachmentOverlay: "border-black bg-white/85 text-black" },
    },
    {
      theme: "brutal",
      attachmentTone: "failed",
      class: { composerAttachmentOverlay: "border-black bg-brutal-orange/90 text-black" },
    },
    {
      theme: "elegant",
      attachmentTone: "uploading",
      class: {
        composerAttachmentOverlay:
          "rounded-md border-line-subtle bg-layer-panel/85 text-foreground-strong",
      },
    },
    {
      theme: "elegant",
      attachmentTone: "failed",
      class: {
        composerAttachmentOverlay:
          "rounded-md border-line-subtle bg-warning-light text-foreground-strong",
      },
    },
  ],
});

export type ChatMainPanelRootProps = useRender.ComponentProps<"section">;

export function ChatMainPanelRoot({ className, render, ...props }: ChatMainPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"section"> & DataAttributes = {
    "data-slot": "chat-main-panel-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type ChatMainPanelHeaderProps = useRender.ComponentProps<"div">;

export function ChatMainPanelHeader({ className, render, ...props }: ChatMainPanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-header",
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelHeaderIconProps = useRender.ComponentProps<"div">;

export function ChatMainPanelHeaderIcon({
  className,
  render,
  ...props
}: ChatMainPanelHeaderIconProps) {
  const theme = useThemeFamily();
  const { headerIcon } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-header-icon",
    className: headerIcon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTitleBlockProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTitleBlock({
  className,
  render,
  ...props
}: ChatMainPanelTitleBlockProps) {
  const { titleBlock } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-title-block",
    className: titleBlock({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTitleProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTitle({ className, render, ...props }: ChatMainPanelTitleProps) {
  const theme = useThemeFamily();
  const { title } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelSubtitleProps = useRender.ComponentProps<"div">;

export function ChatMainPanelSubtitle({ className, render, ...props }: ChatMainPanelSubtitleProps) {
  const theme = useThemeFamily();
  const { subtitle } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-subtitle",
    className: subtitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelActionsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelActions({ className, render, ...props }: ChatMainPanelActionsProps) {
  const { actions } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelActionProps = useRender.ComponentProps<"button">;

export function ChatMainPanelAction({ className, render, ...props }: ChatMainPanelActionProps) {
  const theme = useThemeFamily();
  const { action } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-main-panel-action",
    className: action({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelBodyProps = useRender.ComponentProps<"div">;

export function ChatMainPanelBody({ className, render, ...props }: ChatMainPanelBodyProps) {
  const { body } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-body",
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTabsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTabs({ className, render, ...props }: ChatMainPanelTabsProps) {
  const theme = useThemeFamily();
  const { tabs } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-tabs",
    className: tabs({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTimelineProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTimeline({ className, render, ...props }: ChatMainPanelTimelineProps) {
  const theme = useThemeFamily();
  const { timeline } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-timeline",
    className: timeline({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelMessageListProps = useRender.ComponentProps<"div">;

export function ChatMainPanelMessageList({
  className,
  render,
  ...props
}: ChatMainPanelMessageListProps) {
  const { messageList } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-message-list",
    className: messageList({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelFooterProps = useRender.ComponentProps<"form">;

export function ChatMainPanelFooter({ className, render, ...props }: ChatMainPanelFooterProps) {
  const theme = useThemeFamily();
  const { footer } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"form"> & DataAttributes = {
    "data-slot": "chat-main-panel-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "form",
    render,
    props: mergeProps<"form">(defaultProps, props),
  });
}

export type ChatMainPanelComposerProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposer({ className, render, ...props }: ChatMainPanelComposerProps) {
  const theme = useThemeFamily();
  const { composer } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer",
    className: composer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerInputProps = useRender.ComponentProps<"textarea">;

export function ChatMainPanelComposerInput({
  className,
  render,
  ...props
}: ChatMainPanelComposerInputProps) {
  const theme = useThemeFamily();
  const { composerInput } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"textarea"> & DataAttributes = {
    rows: 1,
    "data-slot": "chat-main-panel-composer-input",
    className: composerInput({ className }),
  };

  return useRender({
    defaultTagName: "textarea",
    render,
    props: mergeProps<"textarea">(defaultProps, props),
  });
}

export type ChatMainPanelComposerToolbarProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerToolbar({
  className,
  render,
  ...props
}: ChatMainPanelComposerToolbarProps) {
  const { composerToolbar } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-toolbar",
    className: composerToolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerActionsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerActions({
  className,
  render,
  ...props
}: ChatMainPanelComposerActionsProps) {
  const { composerActions } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-actions",
    className: composerActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerMetaProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerMeta({
  className,
  render,
  ...props
}: ChatMainPanelComposerMetaProps) {
  const { composerMeta } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-meta",
    className: composerMeta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerIconButtonProps = useRender.ComponentProps<"button">;

export function ChatMainPanelComposerIconButton({
  className,
  render,
  ...props
}: ChatMainPanelComposerIconButtonProps) {
  const theme = useThemeFamily();
  const { composerIconButton } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-main-panel-composer-icon-button",
    className: composerIconButton({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelComposerSubmitProps = useRender.ComponentProps<"button">;

export function ChatMainPanelComposerSubmit({
  className,
  render,
  ...props
}: ChatMainPanelComposerSubmitProps) {
  const theme = useThemeFamily();
  const { composerSubmit } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "submit",
    "data-slot": "chat-main-panel-composer-submit",
    className: composerSubmit({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelAlertProps = useRender.ComponentProps<"div">;

export function ChatMainPanelAlert({ className, render, ...props }: ChatMainPanelAlertProps) {
  const theme = useThemeFamily();
  const { alert } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-alert",
    className: alert({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelAlertActionProps = useRender.ComponentProps<"button">;

export function ChatMainPanelAlertAction({
  className,
  render,
  ...props
}: ChatMainPanelAlertActionProps) {
  const theme = useThemeFamily();
  const { alertAction } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-main-panel-alert-action",
    className: alertAction({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelJumpToLatestProps = useRender.ComponentProps<"button">;

export function ChatMainPanelJumpToLatest({
  className,
  render,
  ...props
}: ChatMainPanelJumpToLatestProps) {
  const theme = useThemeFamily();
  const { jumpToLatest } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-main-panel-jump-to-latest",
    className: jumpToLatest({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerAttachments({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentsProps) {
  const { composerAttachments } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachments",
    className: composerAttachments({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerAttachment({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentProps) {
  const { composerAttachment } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment",
    className: composerAttachment({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentImageProps = useRender.ComponentProps<"img">;

export function ChatMainPanelComposerAttachmentImage({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentImageProps) {
  const theme = useThemeFamily();
  const { composerAttachmentImage } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"img"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-image",
    className: composerAttachmentImage({ className }),
  };

  return useRender({
    defaultTagName: "img",
    render,
    props: mergeProps<"img">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentFileProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentFile({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentFileProps) {
  const theme = useThemeFamily();
  const { composerAttachmentFile } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-file",
    className: composerAttachmentFile({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentBodyProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentBody({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentBodyProps) {
  const { composerAttachmentBody } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-body",
    className: composerAttachmentBody({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentTitleProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentTitle({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentTitleProps) {
  const theme = useThemeFamily();
  const { composerAttachmentTitle } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-title",
    className: composerAttachmentTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentMetaProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentMeta({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentMetaProps) {
  const theme = useThemeFamily();
  const { composerAttachmentMeta } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-meta",
    className: composerAttachmentMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentRemoveProps = useRender.ComponentProps<"button">;

export function ChatMainPanelComposerAttachmentRemove({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentRemoveProps) {
  const theme = useThemeFamily();
  const { composerAttachmentRemove } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-main-panel-composer-attachment-remove",
    className: composerAttachmentRemove({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelComposerDropOverlayProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerDropOverlay({
  className,
  render,
  ...props
}: ChatMainPanelComposerDropOverlayProps) {
  const theme = useThemeFamily();
  const { composerDropOverlay } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-drop-overlay",
    className: composerDropOverlay({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerDropOverlayLabelProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerDropOverlayLabel({
  className,
  render,
  ...props
}: ChatMainPanelComposerDropOverlayLabelProps) {
  const theme = useThemeFamily();
  const { composerDropOverlayLabel } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-drop-overlay-label",
    className: composerDropOverlayLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentOverlayProps = useRender.ComponentProps<"span"> & {
  tone?: "uploading" | "failed";
};

export function ChatMainPanelComposerAttachmentOverlay({
  className,
  render,
  tone = "uploading",
  ...props
}: ChatMainPanelComposerAttachmentOverlayProps) {
  const theme = useThemeFamily();
  const { composerAttachmentOverlay } = chatMainPanel({ theme, attachmentTone: tone });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-overlay",
    "data-tone": tone,
    className: composerAttachmentOverlay({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentProgressProps = useRender.ComponentProps<"span"> & {
  value?: number;
};

export function ChatMainPanelComposerAttachmentProgress({
  className,
  render,
  style,
  value = 0,
  ...props
}: ChatMainPanelComposerAttachmentProgressProps) {
  const theme = useThemeFamily();
  const { composerAttachmentProgress, composerAttachmentProgressFill } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-progress",
    className: composerAttachmentProgress({ className }),
    children: (
      <span
        className={composerAttachmentProgressFill()}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    ),
    style,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
