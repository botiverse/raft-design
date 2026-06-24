import { MessageSquare } from "lucide-react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv.ts";
import { PreviewShell, type PreviewShellProps } from "../preview-shell/preview-shell.tsx";
import { useThemeFamily } from "../../lib/theme/use-theme.ts";

// A quoted-message preview routed through PreviewShell. The source's app-domain
// fields (channel object, author fetching, markdown rendering, attachments
// derivation) are now composed by the caller; this file owns only the visual
// slots and their brutal/elegant styling hooks.
const quotedMessageCard = tv({
  slots: {
    root: ["group block w-full text-left"],
    body: ["px-2.5 py-2 sm:px-3 sm:py-2.5"],
    unavailable: ["text-[13px] leading-snug"],
    header: ["mb-1 flex items-start gap-2 sm:mb-1.5"],
    meta: ["flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-none"],
    channel: ["inline-flex items-center gap-1 font-bold", "[&_svg]:size-[11px] [&_svg]:shrink-0"],
    separator: ["text-foreground/30"],
    author: ["inline-flex min-w-0 items-center gap-1.5"],
    authorName: ["truncate font-bold"],
    authorSubtitle: ["truncate font-mono text-[10px]"],
    thread: ["inline-flex items-center gap-1 font-bold", "[&_svg]:size-2.5 [&_svg]:shrink-0"],
    tag: [
      "inline-flex items-center gap-1 border-[1.5px] border-line-strong px-1.5 py-0.5",
      "text-[11px] font-bold leading-none",
    ],
    timestamp: ["shrink-0 font-mono text-[10px]"],
    contentWrap: ["min-w-0"],
    content: ["line-clamp-2 text-xs leading-snug sm:text-[13px]"],
    attachments: ["mt-2 flex flex-wrap gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        channel: "text-foreground/70",
        authorName: "text-foreground/70",
        authorSubtitle: "text-foreground/40",
        thread: "text-accent-400",
        timestamp: "text-foreground/40",
        content: "text-foreground-strong",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type QuotedMessageCardProps = PreviewShellProps;

export function QuotedMessageCard({
  className,
  "data-testid": testId = "quoted-message-card",
  ...props
}: QuotedMessageCardProps) {
  const { root } = quotedMessageCard();
  return <PreviewShell data-testid={testId} className={root({ className })} {...props} />;
}

export type QuotedMessageCardBodyProps = useRender.ComponentProps<"div">;

export function QuotedMessageCardBody({ className, render, ...props }: QuotedMessageCardBodyProps) {
  const { body } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "quoted-message-card-body",
    },
  });
}

export type QuotedMessageCardUnavailableProps = useRender.ComponentProps<"div">;

export function QuotedMessageCardUnavailable({
  className,
  render,
  ...props
}: QuotedMessageCardUnavailableProps) {
  const { unavailable } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: unavailable({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "quoted-message-card-unavailable",
    },
  });
}

export type QuotedMessageCardHeaderProps = useRender.ComponentProps<"div">;

export function QuotedMessageCardHeader({
  className,
  render,
  ...props
}: QuotedMessageCardHeaderProps) {
  const { header } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "quoted-message-card-header",
    },
  });
}

export type QuotedMessageCardMetaProps = useRender.ComponentProps<"div">;

export function QuotedMessageCardMeta({ className, render, ...props }: QuotedMessageCardMetaProps) {
  const { meta } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "quoted-message-card-meta",
    },
  });
}

export type QuotedMessageCardChannelProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardChannel({
  className,
  render,
  ...props
}: QuotedMessageCardChannelProps) {
  const theme = useThemeFamily();
  const { channel } = quotedMessageCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: channel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-channel",
    },
  });
}

export type QuotedMessageCardSeparatorProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardSeparator({
  className,
  render,
  ...props
}: QuotedMessageCardSeparatorProps) {
  const { separator } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: separator({ className }),
    children: "·",
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-separator",
    },
  });
}

export type QuotedMessageCardAuthorProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardAuthor({
  className,
  render,
  ...props
}: QuotedMessageCardAuthorProps) {
  const { author } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: author({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-author",
    },
  });
}

export type QuotedMessageCardAuthorNameProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardAuthorName({
  className,
  render,
  ...props
}: QuotedMessageCardAuthorNameProps) {
  const theme = useThemeFamily();
  const { authorName } = quotedMessageCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: authorName({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-author-name",
    },
  });
}

export type QuotedMessageCardAuthorSubtitleProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardAuthorSubtitle({
  className,
  render,
  ...props
}: QuotedMessageCardAuthorSubtitleProps) {
  const theme = useThemeFamily();
  const { authorSubtitle } = quotedMessageCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: authorSubtitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-author-subtitle",
    },
  });
}

export type QuotedMessageCardThreadProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardThread({
  className,
  render,
  children = "Thread",
  ...props
}: QuotedMessageCardThreadProps) {
  const theme = useThemeFamily();
  const { thread } = quotedMessageCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: thread({ className }),
    children: (
      <>
        <MessageSquare />
        {children}
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-thread",
    },
  });
}

export type QuotedMessageCardTagProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardTag({ className, render, ...props }: QuotedMessageCardTagProps) {
  const { tag } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: tag({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-tag",
    },
  });
}

export type QuotedMessageCardTimestampProps = useRender.ComponentProps<"span">;

export function QuotedMessageCardTimestamp({
  className,
  render,
  ...props
}: QuotedMessageCardTimestampProps) {
  const theme = useThemeFamily();
  const { timestamp } = quotedMessageCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: timestamp({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "quoted-message-card-timestamp",
    },
  });
}

export type QuotedMessageCardContentWrapProps = useRender.ComponentProps<"div">;

export function QuotedMessageCardContentWrap({
  className,
  render,
  ...props
}: QuotedMessageCardContentWrapProps) {
  const { contentWrap } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: contentWrap({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "quoted-message-card-content-wrap",
    },
  });
}

export type QuotedMessageCardContentProps = useRender.ComponentProps<"div">;

export function QuotedMessageCardContent({
  className,
  render,
  ...props
}: QuotedMessageCardContentProps) {
  const theme = useThemeFamily();
  const { content } = quotedMessageCard({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "quoted-message-card-content",
    },
  });
}

export type QuotedMessageCardAttachmentsProps = useRender.ComponentProps<"div">;

export function QuotedMessageCardAttachments({
  className,
  render,
  ...props
}: QuotedMessageCardAttachmentsProps) {
  const { attachments } = quotedMessageCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: attachments({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "quoted-message-card-attachments",
    },
  });
}
