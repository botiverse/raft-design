import type { ReactNode } from "react";
import { Hash, MessageSquare } from "lucide-react";
import { tv } from "tailwind-variants";
import { Avatar } from "../avatar/avatar.tsx";
import { PreviewShell } from "../preview-shell/preview-shell.tsx";
import { useTheme } from "../../lib/theme/use-theme.ts";

// A quoted-message preview routed through PreviewShell. Layout reproduced 1:1.
// App-domain bits are slotted: the author avatar is a caller-supplied node (the
// original's `Avatar` fetching is dropped) and `content` is a ReactNode (the
// original rendered markdown via `InlineMarkdownPreview`, app domain).
const quotedMessageCard = tv({
  slots: {
    root: ["group block w-full text-left"],
    body: ["px-2.5 py-2 sm:px-3 sm:py-2.5"],
    unavailable: ["text-[13px] leading-snug"],
    header: ["mb-1 flex items-start gap-2 sm:mb-1.5"],
    meta: ["flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-none"],
    channel: ["inline-flex items-center gap-1 font-bold text-black/70"],
    separator: ["text-black/30"],
    author: ["inline-flex min-w-0 items-center gap-1.5"],
    authorName: ["truncate font-bold text-black/70"],
    authorSubtitle: ["truncate font-mono text-[10px] text-black/40"],
    thread: ["inline-flex items-center gap-1 font-bold text-brutal-pink"],
    tag: [
      "inline-flex items-center gap-1 border-[1.5px] border-black px-1.5 py-0.5",
      "text-[11px] font-bold leading-none",
    ],
    timestamp: ["shrink-0 font-mono text-[10px] text-black/40"],
    contentWrap: ["min-w-0"],
    content: ["line-clamp-2 text-xs leading-snug text-black sm:text-[13px]"],
    attachments: ["mt-2 flex flex-wrap gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

// Bordered inline tag (channel marker, attachment chip).
function Tag({ children, className }: { children: ReactNode; className: string }) {
  const { tag } = quotedMessageCard();
  return <span className={tag({ className })}>{children}</span>;
}

function ThreadMarker() {
  const { thread } = quotedMessageCard();
  return (
    <span className={thread()}>
      <MessageSquare size={10} className="shrink-0" />
      Thread
    </span>
  );
}

export type QuotedMessageCardProps = {
  channelName: string;
  channelKind?: "channel" | "dm";
  isThread?: boolean;
  isArchived?: boolean;
  timestamp: string;
  author: {
    name: string;
    kind: "agent" | "user";
    subtitle?: string;
    /** Resolved avatar element; placeholder frame renders when omitted. */
    avatar?: ReactNode;
  };
  /** Message content. The app passes a pre-rendered markdown preview. */
  content: ReactNode;
  attachments?: { label: string }[];
  onClick?: () => void;
  unavailable?: boolean;
};

export function QuotedMessageCard({
  channelName,
  channelKind = "channel",
  isThread = false,
  isArchived = false,
  timestamp,
  author,
  content,
  attachments,
  onClick,
  unavailable = false,
}: QuotedMessageCardProps) {
  const theme = useTheme();
  const {
    root,
    body,
    unavailable: unavailableSlot,
    header,
    meta,
    channel,
    separator,
    author: authorSlot,
    authorName,
    authorSubtitle,
    timestamp: timestampSlot,
    contentWrap,
    content: contentSlot,
    attachments: attachmentsSlot,
  } = quotedMessageCard({ theme });

  if (unavailable) {
    return (
      <PreviewShell
        variant="muted"
        onClick={onClick}
        data-testid="quoted-message-card"
        className={root()}
      >
        <div className={body()}>
          <div className={unavailableSlot()}>Message unavailable</div>
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell onClick={onClick} data-testid="quoted-message-card" className={root()}>
      <div className={body()}>
        <div className={header()}>
          <div className={meta()}>
            <span className={channel()}>
              {channelKind === "dm" ? null : <Hash size={11} className="shrink-0" />}
              {channelKind === "dm" ? `@${channelName}` : channelName}
            </span>
            <span className={separator()}>·</span>
            <span className={authorSlot()}>
              <Avatar size="2xs" type={author.kind === "agent" ? "agent" : "human"}>
                {author.avatar}
              </Avatar>
              <span className={authorName()}>{author.name}</span>
              {author.subtitle ? <span className={authorSubtitle()}>{author.subtitle}</span> : null}
            </span>
            {isThread ? (
              <>
                <span className={separator()}>·</span>
                <ThreadMarker />
              </>
            ) : null}
            {isArchived ? (
              <>
                <span className={separator()}>·</span>
                <Tag className="bg-brutal-orange/30 text-black">Archived</Tag>
              </>
            ) : null}
          </div>
          <span className={timestampSlot()}>{timestamp}</span>
        </div>
        <div className={contentWrap()}>
          <div className={contentSlot()}>{content}</div>
          {attachments?.length ? (
            <div className={attachmentsSlot()}>
              {attachments.map((attachment) => (
                <Tag
                  key={attachment.label}
                  className="bg-brutal-lavender font-mono text-[10px] font-bold text-black"
                >
                  {attachment.label}
                </Tag>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </PreviewShell>
  );
}
