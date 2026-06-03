import type { ComponentPropsWithRef, MouseEvent, ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";
import { Avatar } from "../avatar/avatar.tsx";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Conversation list-row preview card. Layout reproduced 1:1. App-domain bits are
// slotted: the author avatar is a caller-supplied node and `preview` is a
// ReactNode (the original rendered markdown via `InlineMarkdownPreview`).
//
// Shadow tokens: shadow-brutal-sm → --shadow (2px), shadow-brutal → --shadow-hover (4px).
const conversationPreviewCard = tv({
  slots: {
    root: ["relative flex w-full items-start gap-3 border-2 p-3 text-left transition-colors"],
    content: ["min-w-0 flex-1"],
    meta: ["mb-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs leading-4"],
    channel: ["font-bold text-black/50"],
    author: ["inline-flex min-w-0 items-center gap-1 font-bold text-black"],
    authorName: ["truncate"],
    authorSubtitle: ["font-mono text-[10px] text-black/40"],
    timestamp: ["font-mono text-xs leading-4 text-black/40"],
    preview: ["text-sm"],
    previewLeading: ["mr-1 inline-flex align-[-1px]"],
    previewAuthor: ["font-bold text-black/70"],
    secondaryPreview: ["mt-1 line-clamp-1 text-xs"],
    footer: ["mt-1 flex items-center gap-3"],
    action: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["hover:border-black hover:shadow-[var(--shadow)]"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    interactive: {
      true: {
        root: "active:border-black active:shadow-[var(--shadow)]",
      },
      false: {
        root: "cursor-default",
      },
    },
    state: {
      focused: {
        root: "border-black bg-brutal-cyan/25 shadow-[var(--shadow-hover)]",
      },
      active: {
        root: "border-black bg-white shadow-[var(--shadow)]",
      },
      default: {
        root: "border-black/30 bg-white",
      },
    },
    emphasized: {
      true: {
        preview: "font-bold",
      },
      false: {
        preview: "",
      },
    },
  },
  defaultVariants: {
    interactive: false,
    state: "default",
    emphasized: false,
  },
});

type ConversationAuthor = {
  kind: "agent" | "user";
  name: string;
  subtitle?: string | null;
  /** Resolved avatar element; placeholder frame renders when omitted. */
  avatar?: ReactNode;
};

export type ConversationPreviewCardProps = {
  channelLabel: string;
  author?: ConversationAuthor | null;
  timestamp?: string | null;
  /** Message preview. The app passes a pre-rendered markdown preview. */
  preview: ReactNode;
  previewAuthor?: string | null;
  previewLeading?: ReactNode;
  previewLineClampClassName?: "line-clamp-2" | "line-clamp-3";
  previewClassName?: string;
  secondaryPreview?: ReactNode;
  secondaryPreviewClassName?: string;
  ariaLabel?: string;
  title?: string;
  testId?: string;
  marker?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  emphasized?: boolean;
  /** One-shot focus highlight (transient flash). */
  focused?: boolean;
  /** Sticky "currently-open conversation" highlight. */
  active?: boolean;
  onClick?: () => void;
  onContextMenu?: (event: MouseEvent) => void;
} & Pick<useRender.ComponentProps<"button">, "render"> &
  Pick<ComponentPropsWithRef<"button">, "ref">;

export function ConversationPreviewCard({
  channelLabel,
  author,
  timestamp,
  preview,
  previewAuthor,
  previewLeading,
  previewLineClampClassName = "line-clamp-3",
  previewClassName,
  secondaryPreview,
  secondaryPreviewClassName,
  ariaLabel,
  title,
  testId,
  marker,
  footer,
  action,
  emphasized = false,
  focused = false,
  active = false,
  onClick,
  onContextMenu,
  render,
  ref,
}: ConversationPreviewCardProps) {
  const theme = useTheme();
  const interactive = Boolean(onClick || onContextMenu);
  const state = focused ? "focused" : active ? "active" : "default";
  const {
    root,
    content: contentSlot,
    meta,
    channel,
    author: authorSlot,
    authorName,
    authorSubtitle,
    timestamp: timestampSlot,
    preview: previewSlot,
    previewLeading: previewLeadingSlot,
    previewAuthor: previewAuthorSlot,
    secondaryPreview: secondaryPreviewSlot,
    footer: footerSlot,
    action: actionSlot,
  } = conversationPreviewCard({ theme, interactive, state, emphasized });
  const content = (
    <>
      <div className={contentSlot()}>
        <div className={meta()}>
          <span className={channel()}>{channelLabel}</span>
          {author && !previewAuthor ? (
            <span className={authorSlot()}>
              <Avatar size="4xs" type={author.kind === "agent" ? "agent" : "human"}>
                {author.avatar}
              </Avatar>
              <span className={authorName()}>{author.name}</span>
              {author.subtitle ? <span className={authorSubtitle()}>{author.subtitle}</span> : null}
            </span>
          ) : null}
          {marker}
          {timestamp ? <span className={timestampSlot()}>{timestamp}</span> : null}
        </div>
        <p className={previewSlot({ className: [previewLineClampClassName, previewClassName] })}>
          {previewLeading ? <span className={previewLeadingSlot()}>{previewLeading}</span> : null}
          {previewAuthor ? <span className={previewAuthorSlot()}>{previewAuthor}: </span> : null}
          {preview}
        </p>
        {secondaryPreview ? (
          <p
            className={secondaryPreviewSlot({
              className: secondaryPreviewClassName ?? "text-black/45",
            })}
          >
            {secondaryPreview}
          </p>
        ) : null}
        {footer ? <div className={footerSlot()}>{footer}</div> : null}
      </div>
      {action ? <div className={actionSlot()}>{action}</div> : null}
    </>
  );

  return useRender({
    render: render ?? (interactive ? <BaseButton type="button" /> : <div />),
    ref,
    props: {
      onClick,
      onContextMenu,
      "aria-label": ariaLabel,
      title,
      "data-testid": testId,
      "data-slot": "conversation-preview-card",
      "data-focused": focused ? "true" : undefined,
      className: root(),
      children: content,
    },
  });
}
