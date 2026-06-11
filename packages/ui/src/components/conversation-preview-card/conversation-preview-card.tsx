import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const conversationPreviewCard = tv({
  slots: {
    root: ["relative flex w-full items-start gap-3 border-2 p-3 text-left transition-colors"],
    content: ["min-w-0 flex-1"],
    meta: ["mb-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs leading-4"],
    channel: ["font-bold"],
    author: ["inline-flex min-w-0 items-center gap-1 font-bold"],
    authorName: ["truncate"],
    authorSubtitle: ["font-mono text-[10px]"],
    timestamp: ["font-mono text-xs leading-4"],
    preview: ["text-sm"],
    previewLeading: ["mr-1 inline-flex align-[-1px]", "[&_svg]:size-[13px] [&_svg]:shrink-0"],
    previewAuthor: ["font-bold"],
    secondaryPreview: ["mt-1 line-clamp-1 text-xs"],
    footer: ["mt-1 flex items-center gap-3"],
    action: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-line-subtle bg-layer-panel hover:border-line-strong hover:shadow-sm",
          "data-[state=active]:border-line-strong data-[state=active]:bg-layer-panel data-[state=active]:shadow-sm",
          "data-[highlighted=true]:border-line-strong data-[highlighted=true]:bg-info-base/25 data-[highlighted=true]:shadow-md",
        ],
        channel: "text-foreground/50",
        author: "text-foreground-strong",
        authorSubtitle: "text-foreground/40",
        timestamp: "text-foreground/40",
        previewAuthor: "text-foreground/70",
        secondaryPreview: "text-foreground/45",
      },
      elegant: {},
    },
    interactive: {
      true: {
        root: "active:border-line-strong active:shadow-sm",
      },
      false: {
        root: "cursor-default",
      },
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

export type ConversationPreviewCardProps = useRender.ComponentProps<"button"> & {
  testId?: string;
};

export function ConversationPreviewCard({
  onClick,
  className,
  render,
  testId,
  ...props
}: ConversationPreviewCardProps) {
  const theme = useTheme();
  const interactive = Boolean(onClick);
  const { root } = conversationPreviewCard({ theme, interactive });
  const defaultProps: useRender.ElementProps<"button"> & {
    "data-slot": string;
    "data-testid"?: string;
  } = {
    onClick,
    "data-slot": "conversation-preview-card",
    "data-testid": testId,
    className: root({ className }),
  };

  return useRender({
    render: render ?? (interactive ? <BaseButton type="button" /> : <div />),
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ConversationPreviewCardContentProps = useRender.ComponentProps<"div">;

export function ConversationPreviewCardContent({
  className,
  render,
  ...props
}: ConversationPreviewCardContentProps) {
  const { content } = conversationPreviewCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPreviewCardMetaProps = useRender.ComponentProps<"div">;

export function ConversationPreviewCardMeta({
  className,
  render,
  ...props
}: ConversationPreviewCardMetaProps) {
  const { meta } = conversationPreviewCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPreviewCardChannelProps = useRender.ComponentProps<"span">;

export function ConversationPreviewCardChannel({
  className,
  render,
  ...props
}: ConversationPreviewCardChannelProps) {
  const theme = useTheme();
  const { channel } = conversationPreviewCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: channel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPreviewCardAuthorProps = useRender.ComponentProps<"span">;

export function ConversationPreviewCardAuthor({
  className,
  render,
  ...props
}: ConversationPreviewCardAuthorProps) {
  const theme = useTheme();
  const { author } = conversationPreviewCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: author({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPreviewCardAuthorNameProps = useRender.ComponentProps<"span">;

export function ConversationPreviewCardAuthorName({
  className,
  render,
  ...props
}: ConversationPreviewCardAuthorNameProps) {
  const { authorName } = conversationPreviewCard();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: authorName({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPreviewCardAuthorSubtitleProps = useRender.ComponentProps<"span">;

export function ConversationPreviewCardAuthorSubtitle({
  className,
  render,
  ...props
}: ConversationPreviewCardAuthorSubtitleProps) {
  const theme = useTheme();
  const { authorSubtitle } = conversationPreviewCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: authorSubtitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPreviewCardTimestampProps = useRender.ComponentProps<"span">;

export function ConversationPreviewCardTimestamp({
  className,
  render,
  ...props
}: ConversationPreviewCardTimestampProps) {
  const theme = useTheme();
  const { timestamp } = conversationPreviewCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: timestamp({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPreviewCardPreviewProps = useRender.ComponentProps<"p">;

export function ConversationPreviewCardPreview({
  className,
  render,
  ...props
}: ConversationPreviewCardPreviewProps) {
  const { preview } = conversationPreviewCard();
  const defaultProps: useRender.ElementProps<"p"> = {
    className: preview({ className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type ConversationPreviewCardPreviewLeadingProps = useRender.ComponentProps<"span">;

export function ConversationPreviewCardPreviewLeading({
  className,
  render,
  ...props
}: ConversationPreviewCardPreviewLeadingProps) {
  const { previewLeading } = conversationPreviewCard();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: previewLeading({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPreviewCardPreviewAuthorProps = useRender.ComponentProps<"span">;

export function ConversationPreviewCardPreviewAuthor({
  className,
  render,
  ...props
}: ConversationPreviewCardPreviewAuthorProps) {
  const theme = useTheme();
  const { previewAuthor } = conversationPreviewCard({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: previewAuthor({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPreviewCardSecondaryPreviewProps = useRender.ComponentProps<"p">;

export function ConversationPreviewCardSecondaryPreview({
  className,
  render,
  ...props
}: ConversationPreviewCardSecondaryPreviewProps) {
  const theme = useTheme();
  const { secondaryPreview } = conversationPreviewCard({ theme });
  const defaultProps: useRender.ElementProps<"p"> = {
    className: secondaryPreview({ className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type ConversationPreviewCardFooterProps = useRender.ComponentProps<"div">;

export function ConversationPreviewCardFooter({
  className,
  render,
  ...props
}: ConversationPreviewCardFooterProps) {
  const { footer } = conversationPreviewCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPreviewCardActionProps = useRender.ComponentProps<"div">;

export function ConversationPreviewCardAction({
  className,
  render,
  ...props
}: ConversationPreviewCardActionProps) {
  const { action } = conversationPreviewCard();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
