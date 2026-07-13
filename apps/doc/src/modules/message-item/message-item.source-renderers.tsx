import { Bookmark, Download, Eye, MessageSquare, Play, SmilePlus } from "lucide-react";
import { Avatar, AvatarFallback, Badge, Spinner } from "raft-ui";
import {
  MESSAGE_FIXTURE_IMAGE_SRC,
  MESSAGE_REACTION_SPRITE_ITEMS,
  MESSAGE_REACTION_SPRITE_PATH,
  MESSAGE_REACTION_SPRITE_SIZE,
  MESSAGE_QUICK_REACTIONS,
} from "./message-item.fixtures.ts";

const IMAGE_SRC = MESSAGE_FIXTURE_IMAGE_SRC;
const SOURCE_QUICK_REACTIONS = MESSAGE_QUICK_REACTIONS;

function SourceReactionGlyph({ emoji, size = 15 }: { emoji: string; size?: number }) {
  const item = MESSAGE_REACTION_SPRITE_ITEMS[emoji];

  if (!item) {
    return (
      <span aria-hidden="true" className="block" style={{ fontSize: size, lineHeight: 1 }}>
        {emoji}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="block"
      data-reaction-glyph={item.id}
      data-reaction-sprite-path={MESSAGE_REACTION_SPRITE_PATH}
      style={{
        backgroundImage: `url(${MESSAGE_REACTION_SPRITE_PATH})`,
        backgroundPosition: `${-item.x * (size / item.width)}px 0px`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${MESSAGE_REACTION_SPRITE_SIZE.width * (size / item.width)}px ${MESSAGE_REACTION_SPRITE_SIZE.height * (size / item.width)}px`,
        display: "inline-block",
        height: size,
        lineHeight: 1,
        width: size,
      }}
    />
  );
}

function SourceReactionChip({
  emoji,
  count,
  reacted,
}: {
  emoji: string;
  count: number;
  reacted?: boolean;
}) {
  return (
    <span
      aria-label={`${emoji} ${count}`}
      className={[
        "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap border px-1.5 text-[10px] font-bold leading-none transition-colors",
        reacted
          ? "border-black bg-soft-signal/50 text-black"
          : "border-black/25 bg-white text-black/70",
      ].join(" ")}
    >
      <SourceReactionGlyph emoji={emoji} size={15} />
      <span>{count}</span>
    </span>
  );
}

export function SourceAvatar({ children, type }: { children: string; type: "agent" | "human" }) {
  return (
    <span className="relative mt-0.5 shrink-0 self-start hover:brightness-90 transition-colors">
      <Avatar size="sm" type={type}>
        <AvatarFallback>{children}</AvatarFallback>
      </Avatar>
    </span>
  );
}

export function SourceAuthoredMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:border-black hover:bg-white">
      <SourceAvatar type="agent">AT</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">Atlas</span>
          <span className="min-w-0 truncate font-mono text-xs text-black/40">claude-opus</span>
          <span className="shrink-0 font-mono text-xs text-black/40">2:14 PM</span>
        </div>
        <div className="break-words text-sm leading-5 text-black">
          Source rendered markdown and message parts here.
        </div>
      </div>
      <div className="absolute -top-3.5 right-2 z-20 hidden items-center overflow-hidden border-2 border-black bg-white shadow-brutal-sm group-hover/message:flex">
        <button
          type="button"
          aria-label="Reply in thread"
          disabled
          className="flex size-6 items-center justify-center text-black/50 hover:bg-soft-signal/30 hover:text-black"
        >
          <MessageSquare className="size-[13px]" />
        </button>
        <button
          type="button"
          aria-label="Add reaction"
          disabled
          className="flex size-6 items-center justify-center text-black/50 hover:bg-soft-signal/30 hover:text-black"
        >
          <SmilePlus className="size-[13px]" />
        </button>
        <button
          type="button"
          aria-label="Save message"
          disabled
          className="flex size-6 items-center justify-center text-black/50 hover:bg-soft-signal/30 hover:text-black"
        >
          <Bookmark className="size-[13px]" />
        </button>
      </div>
    </div>
  );
}

export function SourceSavedToolbarMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:border-black hover:bg-white">
      <div className="absolute -top-3.5 right-2 z-20 flex items-center overflow-hidden border-2 border-black bg-white shadow-brutal-sm">
        <button
          type="button"
          aria-label="Reply in thread"
          disabled
          className="flex size-6 items-center justify-center text-black/50 hover:bg-soft-signal/30 hover:text-black"
        >
          <MessageSquare className="size-[13px]" />
        </button>
        <button
          type="button"
          aria-label="Add reaction"
          disabled
          className="flex size-6 items-center justify-center text-black/50 hover:bg-soft-signal/30 hover:text-black"
        >
          <SmilePlus className="size-[13px]" />
        </button>
        <button
          type="button"
          aria-label="Remove from Saved"
          disabled
          className="flex size-6 items-center justify-center text-brutal-orange hover:bg-soft-signal/30"
        >
          <Bookmark className="size-[13px]" fill="currentColor" />
        </button>
      </div>
      <span className="absolute top-1 right-1 flex size-6 items-center justify-center text-brutal-orange">
        <Bookmark className="size-[13px]" fill="currentColor" />
      </span>
      <SourceAvatar type="agent">TB</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">
            Toolbar row
          </span>
          <span className="shrink-0 font-mono text-xs text-black/40">2:18 PM</span>
        </div>
        <div className="break-words text-sm leading-5 text-black">
          Saved indicator remains visible until the hover toolbar appears.
        </div>
      </div>
    </div>
  );
}

export function SourceConsecutiveMessageRow() {
  return (
    <div className="group/message relative mb-1 flex w-full gap-3 border-2 border-transparent px-2 py-1 hover:border-black hover:bg-white">
      <div className="relative w-9 shrink-0 self-stretch">
        <span className="absolute top-1 right-1 font-mono text-[10px] leading-none select-none tabular-nums text-black/0 group-hover/message:text-black/40">
          2:15
        </span>
      </div>
      <div className="min-w-0 flex-1 break-words text-sm leading-5 text-black">
        Consecutive rows keep the gutter timestamp and hide sender chrome.
      </div>
    </div>
  );
}

export function SourceThreadArchiveEventRow() {
  return (
    <div className="mb-1 flex min-w-0 items-center justify-center gap-2 px-2 py-1.5">
      <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">2:16 PM</span>
      <span className="min-w-0 truncate text-xs text-black/50">Atlas archived this thread.</span>
    </div>
  );
}

export function SourceRemovedSenderMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:border-black hover:bg-white">
      <SourceAvatar type="human">MX</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">Mx. Chen</span>
          <span className="inline-flex shrink-0 items-center border border-black bg-gray-300 px-1.5 py-0.5 text-[10px] font-bold text-black/60 uppercase">
            removed
          </span>
          <span className="shrink-0 font-mono text-xs text-black/40">Yesterday</span>
        </div>
        <div className="break-words text-sm leading-5 text-black">
          This row covers removed human and deactivated agent badges.
        </div>
        <div className="mt-1 inline-flex max-w-full border border-black bg-soft-signal/40 px-2 py-1 text-xs font-bold text-black/70">
          Message is visible because it belongs to the archived thread.
        </div>
      </div>
    </div>
  );
}

export function SourceActiveMessageRow() {
  return (
    <div className="relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-black bg-white px-2 py-1 text-left">
      <SourceAvatar type="agent">AC</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 pr-24">
          <span className="text-sm font-bold text-black">Active anchor</span>
          <span className="font-mono text-xs text-black/40">3:19 PM</span>
        </div>
        <div className="text-sm leading-5 text-black">
          Used for menu anchor, current row, or permalink focus.
        </div>
      </div>
    </div>
  );
}

export function SourceSearchMatchMessageRow() {
  return (
    <div className="relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-black bg-brutal-cyan/25 px-2 py-1 text-left shadow-brutal">
      <SourceAvatar type="agent">SR</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 pr-24">
          <span className="text-sm font-bold text-black">Search result</span>
          <span className="font-mono text-xs text-black/40">3:20 PM</span>
        </div>
        <div className="text-sm leading-5 text-black">
          Search jump highlight keeps the cyan source treatment.
        </div>
      </div>
    </div>
  );
}

export function SourceSelectedMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:bg-white">
      <span className="mt-1.5 inline-flex size-5 shrink-0 items-center justify-center self-start rounded-full border-2 border-black bg-brutal-yellow text-black">
        <span className="text-[11px] leading-none font-bold">✓</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 pr-24">
          <span className="text-sm font-bold text-black">Selected row</span>
          <span className="font-mono text-xs text-black/40">3:18 PM</span>
        </div>
        <div className="text-sm leading-5 text-black">
          Selection is primarily represented by the check marker.
        </div>
      </div>
    </div>
  );
}

export function SourceInteractiveStateRows() {
  return (
    <div className="flex w-full flex-col gap-2">
      <SourceSelectedMessageRow />
      <SourceActiveMessageRow />
      <SourceSearchMatchMessageRow />
    </div>
  );
}

export function SourceImageGalleryMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:border-black hover:bg-white">
      <SourceAvatar type="agent">IM</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="text-sm font-bold text-black">Image gallery</span>
          <span className="font-mono text-xs text-black/40">3:01 PM</span>
        </div>
        <div className="mt-1 max-w-[min(22rem,calc(100vw-7rem))] space-y-2 md:max-w-[28rem]">
          <div className="grid grid-cols-2 gap-2">
            <div className="group/img relative h-32 overflow-hidden border-2 border-black bg-brutal-cream/60 text-left hover:brightness-95 sm:h-36">
              <img src={IMAGE_SRC} alt="" className="block h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Download image"
                disabled
                className="absolute right-1 bottom-1 z-10 hidden size-6 items-center justify-center border border-black bg-white/80 text-black/50 group-hover/img:flex hover:text-black"
              >
                <Download className="size-3" />
              </button>
            </div>
            <div className="group/img relative h-32 overflow-hidden border-2 border-black bg-brutal-cream/60 text-left opacity-70 sm:h-36">
              <img src={IMAGE_SRC} alt="" className="block h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size="lg" className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SourceVideoPreviewMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:border-black hover:bg-white">
      <SourceAvatar type="agent">VD</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="text-sm font-bold text-black">Video preview</span>
          <span className="font-mono text-xs text-black/40">3:02 PM</span>
        </div>
        <div className="mt-1 space-y-2">
          <div className="group/video relative w-full max-w-[min(28rem,calc(100vw-7rem))] overflow-hidden border-2 border-black bg-black text-left">
            <div className="relative aspect-video w-full bg-black">
              <button
                type="button"
                aria-label="Play video"
                disabled
                className="flex h-full w-full items-center justify-center bg-black text-white"
              >
                <Play className="size-8 text-white/80" />
              </button>
              <button
                type="button"
                aria-label="Open video preview"
                disabled
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center border border-black bg-white/80 text-black/60 hover:bg-white hover:text-black"
              >
                <Eye className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SourceFileAttachmentMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:border-black hover:bg-white">
      <SourceAvatar type="agent">FL</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="text-sm font-bold text-black">File attachments</span>
          <span className="font-mono text-xs text-black/40">3:03 PM</span>
        </div>
        <div className="mt-1 flex max-w-[22.5rem] flex-wrap items-start gap-2">
          <SourceAttachmentTile name="migration.diff" meta="Diff · 18 KB" summary="+42 -7" />
          <SourceAttachmentTile name="screening.html" meta="HTML preview · 44 KB" />
        </div>
      </div>
    </div>
  );
}

export function SourceReactionOverlays() {
  return (
    <div className="flex flex-wrap items-start gap-4 px-2">
      <div className="inline-flex items-center gap-0.5 border-2 border-black bg-white px-1.5 py-1">
        {SOURCE_QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`React with ${emoji}`}
            disabled
            className="flex size-7 items-center justify-center rounded bg-transparent transition-colors hover:bg-brutal-pink/20"
          >
            <SourceReactionGlyph emoji={emoji} size={18} />
          </button>
        ))}
      </div>
      <div className="inline-block max-w-[280px] border-2 border-black bg-white px-2 py-1.5 text-xs font-bold text-black">
        <div className="flex max-w-60 flex-wrap items-center gap-y-0.5">
          <span className="inline-flex min-w-0 items-baseline leading-5">
            <span className="max-w-28 truncate">Atlas</span>
            <span className="shrink-0 text-black/45">, </span>
          </span>
          <span className="inline-flex min-w-0 items-baseline leading-5">
            <span className="max-w-28 truncate">Ada Lovelace</span>
            <span className="shrink-0 text-black/45">, </span>
          </span>
          <span className="leading-5 text-black/50">+3 more</span>
        </div>
      </div>
    </div>
  );
}

export function SourceContextMenu() {
  return (
    <div className="w-60 overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_var(--color-black)]">
      <div className="flex h-9 items-center gap-1 bg-white px-2">
        {SOURCE_QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`React with ${emoji}`}
            disabled
            className="flex size-7 items-center justify-center rounded bg-transparent transition-colors hover:bg-brutal-pink/20 active:bg-brutal-pink/20"
          >
            <SourceReactionGlyph emoji={emoji} size={18} />
          </button>
        ))}
      </div>
      <div className="border-t-2 border-black" />
      {["Copy Link", "Copy Markdown", "Select Message", "Open Thread", "Remove from Saved"].map(
        (label) => (
          <div
            key={label}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black transition-colors hover:bg-soft-signal/30"
          >
            {label}
          </div>
        ),
      )}
    </div>
  );
}

export function SourceAttachmentTile({
  name,
  meta,
  summary,
}: {
  name: string;
  meta: string;
  summary?: string;
}) {
  return (
    <div className="group/img relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col justify-between overflow-hidden border border-black/15 bg-white px-2.5 py-2 text-left transition-colors hover:border-black/30 hover:bg-black/5">
      <span className="w-full min-w-0 max-w-full overflow-hidden">
        <span className="block w-full max-w-full truncate text-xs font-bold text-black">
          {name}
        </span>
        <span className="mt-0.5 block truncate text-[10px] leading-4 text-black/45">{meta}</span>
      </span>
      {summary ? (
        <span className="pr-5 font-mono text-[10px] leading-4 font-bold text-black/45">
          {summary}
        </span>
      ) : null}
      <span className="absolute right-1.5 bottom-1.5 flex items-center justify-center text-black/60 group-hover/img:text-black">
        <Download className="size-3" />
      </span>
    </div>
  );
}

export function SourceRichAttachmentMessageRow() {
  return (
    <div className="group/message relative mb-1 mt-1.5 flex h-fit min-h-12 w-full gap-3 border-2 border-transparent px-2 py-1 text-left hover:border-black hover:bg-white">
      <SourceAvatar type="agent">AP</SourceAvatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="text-sm font-bold text-black">App Planner</span>
          <span className="font-mono text-xs text-black/40">gpt-4.1</span>
          <span className="font-mono text-xs text-black/40">3:04 PM</span>
        </div>
        <div className="break-words text-sm leading-5 text-black">
          Here is the source parity pass for <strong>#222</strong>.
        </div>
        <div className="mt-1.5 space-y-2">
          <div className="max-w-[min(22rem,calc(100vw-7rem))] space-y-2 md:max-w-[28rem]">
            <div className="grid grid-cols-2 gap-2">
              <div className="group/img relative h-32 overflow-hidden border-2 border-black bg-brutal-cream/60 text-left hover:brightness-95 sm:h-36">
                <img src={IMAGE_SRC} alt="" className="block h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Download image"
                  disabled
                  className="absolute right-1 bottom-1 z-10 hidden size-6 items-center justify-center border border-black bg-white/80 text-black/50 group-hover/img:flex hover:text-black"
                >
                  <Download className="size-3" />
                </button>
              </div>
              <div className="group/img relative h-32 overflow-hidden border-2 border-black bg-brutal-cream/60 text-left opacity-70 sm:h-36">
                <img src={IMAGE_SRC} alt="" className="block h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner size="lg" className="text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="group/video relative w-full max-w-[min(28rem,calc(100vw-7rem))] overflow-hidden border-2 border-black bg-black text-left">
            <div className="relative aspect-video w-full bg-black">
              <button
                type="button"
                aria-label="Play video"
                disabled
                className="flex h-full w-full items-center justify-center bg-black text-white"
              >
                <Play className="size-8 text-white/80" />
              </button>
              <button
                type="button"
                aria-label="Open video preview"
                disabled
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center border border-black bg-white/80 text-black/60 hover:bg-white hover:text-black"
              >
                <Eye className="size-3" />
              </button>
            </div>
          </div>
          <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
            <SourceAttachmentTile name="migration.diff" meta="Diff · 18 KB" summary="+42 -7" />
            <SourceAttachmentTile name="screening.html" meta="HTML preview · 44 KB" />
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="primary" appearance="solid">
            Task #222
          </Badge>
          <span className="inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap border border-black bg-brutal-cyan/20 px-1.5 text-[10px] font-bold leading-none text-black transition-colors hover:bg-brutal-cyan/40">
            <MessageSquare className="size-3 shrink-0" />6 replies
          </span>
          <SourceReactionChip emoji="👍" count={5} reacted />
        </div>
      </div>
    </div>
  );
}
