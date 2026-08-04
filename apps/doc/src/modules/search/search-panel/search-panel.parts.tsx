import type { KeyboardEvent, ReactNode, Ref } from "react";
import { Hash, MessageSquare, Monitor, Search, User, X } from "lucide-react";
import { Kbd, Panel, PanelHeaderRoot, Skeleton, useThemeFamily } from "raft-ui";
import { tv } from "tailwind-variants/lite";
import {
  SearchEntityResult,
  SearchEntityResultOpen,
  SearchMessageResult,
  SearchResultsEmpty as SearchResultsEmptyFrame,
  SearchResultsError as SearchResultsErrorFrame,
  SearchThreadMessageResult,
  SearchThreadResult,
  SearchThreadResultHeader,
  SearchThreadResultMessages,
} from "raft-ui/wip";

import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchEntitySubtitle,
  SearchIdentityAvatarFixture,
  SearchMessageFixture,
  SearchSenderFixture,
} from "../search.fixtures.ts";

export type BrutalSearchScope = "mentioned" | "humans" | "agents";
export type BrutalSearchTimeRange = "any" | "today" | "7d" | "30d";
export type BrutalSearchSort = "relevance" | "recent";

export const searchShell = tv({
  slots: {
    frame: ["flex min-h-0 flex-1 flex-col"],
    header: ["flex h-panel-header items-center gap-3 px-5"],
    headerBack: [
      "inline-flex size-7 shrink-0 items-center justify-center font-bold leading-none md:hidden",
    ],
    headerIconChip: ["flex size-icon-header shrink-0 items-center justify-center"],
    inputRow: ["flex min-w-0 flex-1 items-center gap-2 px-3 py-2"],
    input: ["min-w-0 flex-1 bg-transparent text-sm outline-none"],
    inputClear: [],
    inputKbd: ["hidden text-[10px] font-bold uppercase sm:inline"],
    filtersRow: ["shrink-0 px-4 py-3"],
    filterTrigger: ["h-8 w-auto px-3 py-0 text-xs font-bold"],
    filterContent: ["min-w-[220px]"],
    channelActiveChip: ["inline-flex items-center gap-2 px-3 py-1.5 text-xs"],
    channelOptionIcon: [],
    clearAllButton: ["inline-flex items-center gap-2 px-2.5 py-1 text-[11px]"],
    resultsViewport: ["min-h-0 flex-1 overflow-y-auto"],
    resultsContent: ["p-4"],
    loadMoreButton: ["px-4 py-1.5 text-xs"],
    highlightMark: ["px-0.5"],
    metaLabel: [],
    metaThreadChip: ["inline-flex items-center gap-1"],
    metaArchivedChip: [
      "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
    ],
    metaSender: ["inline-flex items-center gap-1"],
    metaTimestamp: [],
    resultBody: ["line-clamp-2 text-sm leading-relaxed"],
    entityIconChannel: ["flex size-8 items-center justify-center overflow-hidden"],
    entityIconComputer: ["flex size-8 items-center justify-center overflow-hidden"],
    entityIconArchived: ["flex size-8 items-center justify-center overflow-hidden"],
    activityDot: ["absolute -right-0.5 -bottom-0.5 inline-block size-2.5 shrink-0 rounded-full"],
    entityTitle: ["truncate text-sm"],
    entityTitleArchived: ["truncate text-sm"],
    typeBadge: ["px-1 py-0.5 text-[9px] uppercase leading-none"],
    archivedBadge: ["px-1 py-0.5 text-[9px] uppercase leading-none"],
    archivedBadgeMuted: ["px-1 py-0.5 text-[9px] uppercase leading-none"],
    entitySubtitle: ["block truncate text-xs"],
    entitySubtitleArchived: ["block truncate text-xs"],
    threadHeaderMeta: ["mb-1 flex flex-wrap items-center gap-2 text-[11px]"],
    threadChip: ["inline-flex items-center gap-1 px-1.5 py-0.5"],
    threadTimestamp: ["normal-case"],
    threadTitle: ["text-sm"],
    skeletonCard: ["p-3"],
    emptyIcon: ["mb-3"],
    emptyTitle: ["text-sm"],
    emptyDescription: ["mt-1 text-xs"],
    errorTitle: ["mb-2 text-sm"],
    errorDescription: ["mb-3 text-xs"],
    retryButton: ["px-3 py-1.5 text-xs"],
    identityAvatar: ["flex shrink-0 items-center justify-center overflow-hidden"],
  },
  variants: {
    theme: {
      brutal: {
        frame: ["bg-white"],
        header: ["border-b-2 border-black bg-white", "[@media(max-height:600px)]:!h-panel-header"],
        headerBack: ["btn-brutal-sm bg-white text-black"],
        headerIconChip: ["border-2 border-black bg-soft-signal"],
        inputRow: ["border-2 border-black bg-white shadow-sm focus-within:shadow-md"],
        input: ["font-display font-medium placeholder:text-black/40"],
        inputClear: ["btn-brutal-sm bg-white p-1"],
        inputKbd: ["text-black/50"],
        filtersRow: ["border-b-2 border-black bg-white"],
        channelActiveChip: ["border-2 border-black bg-soft-signal font-bold text-black shadow-sm"],
        channelOptionIcon: ["text-black/50"],
        clearAllButton: ["border border-black bg-white font-bold text-black/60 hover:text-black"],
        resultsViewport: ["bg-white"],
        resultsContent: ["bg-white"],
        loadMoreButton: ["btn-brutal-sm bg-white"],
        highlightMark: ["bg-soft-signal font-bold text-black"],
        metaLabel: ["font-bold text-black/50"],
        metaThreadChip: ["font-bold text-black/40"],
        metaArchivedChip: ["border border-black bg-brutal-orange/30 font-bold"],
        metaSender: ["font-bold text-black"],
        metaTimestamp: ["font-mono text-black/40"],
        resultBody: ["text-black/70"],
        entityIconChannel: ["border-2 border-black bg-soft-signal text-black"],
        entityIconComputer: ["border-2 border-black bg-brutal-lime"],
        entityIconArchived: ["border-2 border-black/40 bg-black/5 text-black/45"],
        activityDot: ["border border-black bg-brutal-lime"],
        entityTitle: ["font-bold text-black"],
        entityTitleArchived: ["font-bold text-black/45"],
        typeBadge: ["border border-black bg-white font-bold text-black/60"],
        archivedBadge: ["border border-black bg-brutal-orange/30 font-bold text-black"],
        archivedBadgeMuted: ["border border-black/40 bg-black/5 font-bold text-black/45"],
        entitySubtitle: ["text-black/50"],
        entitySubtitleArchived: ["text-black/30"],
        threadHeaderMeta: ["font-bold uppercase tracking-wide text-black/70"],
        threadChip: ["border border-black bg-white"],
        threadTimestamp: ["font-mono text-black/50"],
        threadTitle: ["font-bold text-black"],
        skeletonCard: ["border-2 border-black/30 bg-white"],
        emptyIcon: ["text-black/20"],
        emptyTitle: ["font-bold text-black/50"],
        emptyDescription: ["text-black/40"],
        errorTitle: ["font-bold text-black"],
        errorDescription: ["text-black/60"],
        retryButton: ["btn-brutal-sm bg-white"],
        identityAvatar: ["border-black"],
      },
      elegant: {
        frame: ["bg-layer-page"],
        header: [
          "h-auto min-h-[var(--shell-header-height,56px)]",
          "max-md:h-[var(--shell-header-height,56px)]",
          "border-b-0 bg-transparent max-md:bg-layer-page",
          "px-0 max-md:pl-5 max-md:pr-3.5 md:pl-9 md:pr-5",
        ],
        headerBack: [
          "rounded-md border border-line-field bg-layer-field text-foreground-muted",
          "transition-colors hover:bg-layer-hover hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
        ],
        headerIconChip: ["rounded-md bg-layer-muted text-foreground-icon"],
        inputRow: [
          "rounded-md border border-line-field bg-layer-field shadow-none",
          "transition duration-200 ease-out",
          "hover:border-line-field-hover hover:shadow-field-hover",
          "focus-within:ring-1 focus-within:ring-primary-400 focus-within:ring-offset-2 focus-within:ring-offset-background",
        ],
        input: ["font-sans text-foreground-strong placeholder:text-foreground-placeholder/70"],
        inputClear: [
          "rounded-sm p-1 text-foreground-muted",
          "transition-colors hover:bg-layer-hover hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
        ],
        inputKbd: ["text-foreground-muted"],
        filtersRow: [
          "border-b border-line-subtle bg-layer-panel",
          "px-7 max-md:pl-5 max-md:pr-3.5",
        ],
        channelActiveChip: [
          "rounded-md border border-line-subtle bg-layer-muted font-medium text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
        ],
        channelOptionIcon: ["text-foreground-icon"],
        clearAllButton: [
          "rounded-md border-0 font-medium text-foreground-muted",
          "transition-colors hover:bg-layer-hover hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
        ],
        resultsViewport: ["bg-layer-panel"],
        resultsContent: ["bg-layer-panel", "px-7 max-md:pl-5 max-md:pr-3.5"],
        loadMoreButton: [
          "rounded-md border border-line-field bg-layer-field font-medium text-foreground-strong",
          "shadow-none transition-colors hover:bg-layer-hover",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
        ],
        highlightMark: ["bg-soft-signal/70 text-inherit [font:inherit]"],
        metaLabel: ["font-medium text-foreground-muted/70"],
        metaThreadChip: ["font-medium text-foreground-muted/70"],
        metaArchivedChip: [
          "rounded-sm border-[0.5px] border-line-subtle bg-layer-muted font-medium text-foreground-muted",
        ],
        metaSender: ["font-medium text-foreground-muted"],
        metaTimestamp: ["font-sans tabular-nums text-foreground-muted/70"],
        resultBody: ["leading-5.25 tracking-[-0.01em] text-foreground-muted"],
        entityIconChannel: ["rounded-md bg-layer-muted text-foreground-icon"],
        entityIconComputer: ["rounded-md bg-layer-muted text-foreground-icon"],
        entityIconArchived: ["rounded-md bg-layer-muted text-foreground-disabled"],
        activityDot: ["border border-layer-panel bg-brutal-lime"],
        entityTitle: ["font-medium text-foreground-strong"],
        entityTitleArchived: ["font-medium text-foreground-disabled"],
        typeBadge: [
          "rounded-sm border-[0.5px] border-line-subtle bg-layer-panel font-medium text-foreground-muted",
        ],
        archivedBadge: [
          "rounded-sm border-[0.5px] border-line-subtle bg-layer-muted font-medium text-foreground-muted",
        ],
        archivedBadgeMuted: [
          "rounded-sm border-[0.5px] border-line-subtle bg-layer-muted font-medium text-foreground-disabled",
        ],
        entitySubtitle: ["text-foreground-muted/70"],
        entitySubtitleArchived: ["text-foreground-disabled"],
        threadHeaderMeta: ["font-medium normal-case tracking-normal text-foreground-muted"],
        threadChip: ["rounded-sm border-[0.5px] border-line-subtle bg-layer-panel"],
        threadTimestamp: ["font-sans tabular-nums text-foreground-muted/70"],
        threadTitle: ["font-medium text-foreground-strong"],
        skeletonCard: ["rounded-lg border-[0.5px] border-line-subtle bg-layer-panel shadow-xs"],
        emptyIcon: ["text-foreground-disabled"],
        emptyTitle: ["font-medium text-foreground-strong"],
        emptyDescription: ["text-foreground-muted"],
        errorTitle: ["font-medium text-foreground-strong"],
        errorDescription: ["text-foreground-muted"],
        retryButton: [
          "rounded-md border border-line-field bg-layer-field font-medium text-foreground-strong",
          "shadow-none transition-colors hover:bg-layer-hover",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
        ],
        identityAvatar: ["rounded-md border-line-subtle"],
      },
    },
    avatarContext: {
      "surface-list": { identityAvatar: "size-8 border-2" },
      "compact-list": { identityAvatar: "size-5 border" },
      "preview-mini": { identityAvatar: "size-[14px] border" },
    },
    avatarType: {
      agent: { identityAvatar: "bg-brutal-cyan" },
      human: { identityAvatar: "bg-brutal-lavender text-black" },
    },
  },
});

const SEARCH_RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const PIXEL_PALETTE = {
  _: "transparent",
  K: "oklch(0.1812926 0.0049716 17.6198)",
  W: "oklch(1 0 0)",
  C: "var(--color-brutal-cyan)",
  Y: "var(--color-brutal-yellow)",
  V: "var(--color-brutal-lavender)",
} as const;

const PIXEL_AVATARS: Record<
  Extract<SearchIdentityAvatarFixture, { kind: "pixel" }>["key"],
  { background: string; rows: readonly string[] }
> = {
  robot: {
    background: PIXEL_PALETTE.C,
    rows: [
      "_KKKKKK_",
      "KCKWWKCK",
      "KWKWWKWK",
      "KKKKKKKK",
      "_KWKKWK_",
      "_KKKKKK_",
      "_KK__KK_",
      "_KK__KK_",
    ],
  },
  cat: {
    background: PIXEL_PALETTE.Y,
    rows: [
      "K______K",
      "KK____KK",
      "KYKYYKYK",
      "KYYYYYYK",
      "KYKYYKYK",
      "_KYYYYK_",
      "__KYYK__",
      "___KK___",
    ],
  },
  ghost: {
    background: PIXEL_PALETTE.V,
    rows: [
      "__KKKK__",
      "_KWWWWK_",
      "KWKWWKWK",
      "KWWWWWWK",
      "KWWWWWWK",
      "KWWKKWWK",
      "KWKWWKWK",
      "K_K__K_K",
    ],
  },
};

export function BrutalSearchFrame({
  children,
  onKeyDown,
}: {
  children: ReactNode;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const theme = useThemeFamily();
  const { frame } = searchShell({ theme });
  return (
    <Panel render={<div />} className={frame()} onKeyDown={onKeyDown}>
      {children}
    </Panel>
  );
}

export function BrutalSearchHeader({
  inputRef,
  query,
  onBack,
  onQueryChange,
  onCompositionStart,
  onCompositionEnd,
  onClear,
}: {
  inputRef?: Ref<HTMLInputElement>;
  query: string;
  onBack: () => void;
  onQueryChange: (value: string) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (value: string) => void;
  onClear: () => void;
}) {
  const theme = useThemeFamily();
  const { header, headerBack, headerIconChip, inputRow, input, inputClear, inputKbd } = searchShell(
    { theme },
  );
  return (
    <PanelHeaderRoot className={header()}>
      <button
        type="button"
        onClick={onBack}
        title="Back"
        aria-label="Back"
        className={headerBack()}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className={headerIconChip()}>
            <Search aria-hidden size={18} />
          </div>
          <div className={inputRow()}>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={(event) => onCompositionEnd(event.currentTarget.value)}
              placeholder="Search channels, DMs, messages…   ⌘K"
              aria-label="Search channels, DMs, people, agents, and messages"
              className={input()}
            />
            {query ? (
              <button
                type="button"
                onClick={onClear}
                className={inputClear()}
                aria-label="Clear search"
              >
                <X aria-hidden size={12} />
              </button>
            ) : null}
            <Kbd className={inputKbd()}>Esc</Kbd>
          </div>
        </div>
      </div>
    </PanelHeaderRoot>
  );
}

export function EntityResult({
  entity,
  selected,
  buttonRef,
  onOpen,
}: {
  entity: SearchEntityFixture;
  selected: boolean;
  buttonRef?: (element: HTMLButtonElement | null) => void;
  onOpen: () => void;
}) {
  const theme = useThemeFamily();
  const shell = searchShell({ theme });
  const isArchivedChannel = entity.type === "channel" && Boolean(entity.archivedAt);
  const Icon = entity.type === "channel" ? Hash : Monitor;
  const identityType = entity.type === "agentDm" ? "agent" : "human";
  const typeLabel =
    entity.type === "channel"
      ? "Channel"
      : entity.type === "computer"
        ? "Computer"
        : entity.type === "agentDm"
          ? "Agent"
          : "Human";

  return (
    <SearchEntityResult selected={selected}>
      <SearchEntityResultOpen ref={buttonRef} onClick={onOpen}>
        <div className="flex items-center gap-3">
          <div className="relative flex shrink-0">
            {entity.type === "channel" || entity.type === "computer" ? (
              <div
                className={
                  isArchivedChannel
                    ? shell.entityIconArchived()
                    : entity.type === "channel"
                      ? shell.entityIconChannel()
                      : shell.entityIconComputer()
                }
              >
                <Icon aria-hidden size={14} />
              </div>
            ) : (
              <SourceIdentityAvatar
                context="surface-list"
                type={identityType}
                avatar={entity.avatar}
              />
            )}
            {entity.type === "agentDm" && entity.activity === "active" ? (
              <span aria-label="Active" className={shell.activityDot()} />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={isArchivedChannel ? shell.entityTitleArchived() : shell.entityTitle()}
              >
                {entity.title}
              </span>
              <span className={isArchivedChannel ? shell.archivedBadgeMuted() : shell.typeBadge()}>
                {typeLabel}
              </span>
              {entity.archivedAt ? (
                <span
                  className={isArchivedChannel ? shell.archivedBadgeMuted() : shell.archivedBadge()}
                >
                  Archived
                </span>
              ) : null}
            </div>
            <div
              className={
                isArchivedChannel ? shell.entitySubtitleArchived() : shell.entitySubtitle()
              }
            >
              {formatEntitySubtitle(entity.subtitle)}
            </div>
          </div>
        </div>
      </SearchEntityResultOpen>
    </SearchEntityResult>
  );
}

function SearchHighlight({ text, query }: { text: string; query: string }) {
  const theme = useThemeFamily();
  const { highlightMark } = searchShell({ theme });
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;
  const expression = new RegExp(
    `(${tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "ig",
  );
  return (
    <>
      {text.split(expression).map((part, index) =>
        tokens.some((token) => token.toLowerCase() === part.toLowerCase()) ? (
          <mark key={`${part}-${index}`} className={highlightMark()}>
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

export function MessageResult({
  message,
  sender,
  channel,
  query,
  nested = false,
  selected,
  buttonRef,
  onOpen,
}: {
  message: SearchMessageFixture;
  sender?: SearchSenderFixture;
  channel?: SearchChannelFixture;
  query: string;
  nested?: boolean;
  selected: boolean;
  buttonRef?: (element: HTMLButtonElement | null) => void;
  onOpen: () => void;
}) {
  const theme = useThemeFamily();
  const shell = searchShell({ theme });
  const Result = nested ? SearchThreadMessageResult : SearchMessageResult;

  return (
    <Result ref={buttonRef} onClick={onOpen} selected={selected}>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
        <span className={shell.metaLabel()}>
          {channel?.kind === "dm" ? "@" : "#"}
          {channel?.name ?? "unknown"}
        </span>
        {message.threadId ? (
          <span className={shell.metaThreadChip()}>
            <MessageSquare aria-hidden size={10} /> thread
          </span>
        ) : null}
        {channel?.archivedAt ? <span className={shell.metaArchivedChip()}>Archived</span> : null}
        <span className={shell.metaSender()}>
          <SourceIdentityAvatar
            context="preview-mini"
            type={sender?.kind ?? "human"}
            avatar={sender?.avatar}
          />
          <span>{sender?.label ?? "Unknown"}</span>
        </span>
        <span className={shell.metaTimestamp()}>{formatTimestamp(message.createdAt)}</span>
      </div>
      <div className={shell.resultBody()}>
        <SearchHighlight text={message.content} query={query} />
      </div>
    </Result>
  );
}

export function ThreadResult({
  title,
  messages,
  query,
  selectedKey,
  getSender,
  getChannel,
  setResultRef,
  onOpenMessage,
}: {
  title: string;
  messages: readonly SearchMessageFixture[];
  query: string;
  selectedKey: string | null;
  getSender: (id: string) => SearchSenderFixture | undefined;
  getChannel: (id: string) => SearchChannelFixture | undefined;
  setResultRef: (key: string, element: HTMLButtonElement | null) => void;
  onOpenMessage: (message: SearchMessageFixture) => void;
}) {
  const theme = useThemeFamily();
  const shell = searchShell({ theme });
  const first = messages[0];
  const latest = messages.reduce<SearchMessageFixture | undefined>((current, message) => {
    if (!current) return message;
    return Date.parse(message.createdAt) > Date.parse(current.createdAt) ? message : current;
  }, undefined);
  const channel = first ? getChannel(first.channelId) : undefined;
  const hasSelected = messages.some((message) => selectedKey === `message:${message.id}`);
  return (
    <SearchThreadResult selected={hasSelected}>
      <SearchThreadResultHeader>
        <div className={shell.threadHeaderMeta()}>
          <span className={shell.threadChip()}>
            <MessageSquare aria-hidden size={11} /> Thread
          </span>
          <span className="normal-case">
            {channel?.kind === "dm" ? "@" : "#"}
            {channel?.name ?? "unknown"}
          </span>
          <span>{messages.length} hits</span>
          <span className={shell.threadTimestamp()}>
            {latest ? formatTimestamp(latest.createdAt) : ""}
          </span>
        </div>
        <div className={shell.threadTitle()}>{title || "Thread discussion"}</div>
      </SearchThreadResultHeader>
      <SearchThreadResultMessages>
        {messages.map((message) => (
          <MessageResult
            key={message.id}
            message={message}
            sender={getSender(message.senderId)}
            channel={getChannel(message.channelId)}
            query={query}
            nested
            selected={selectedKey === `message:${message.id}`}
            buttonRef={(element) => setResultRef(`message:${message.id}`, element)}
            onOpen={() => onOpenMessage(message)}
          />
        ))}
      </SearchThreadResultMessages>
    </SearchThreadResult>
  );
}

export function SearchSkeleton() {
  const theme = useThemeFamily();
  const { skeletonCard } = searchShell({ theme });
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className={skeletonCard()}>
          <div className="mb-2 flex gap-2">
            <Skeleton variant="line" className="w-24" />
            <Skeleton variant="line" className="w-20" />
            <Skeleton variant="line" className="w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="line" className="w-full" />
            <Skeleton variant="line" className="w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchEmpty({ query, filtered = false }: { query?: string; filtered?: boolean }) {
  const theme = useThemeFamily();
  const { emptyIcon, emptyTitle, emptyDescription } = searchShell({ theme });
  const hasIntent = Boolean(query || filtered);
  return (
    <SearchResultsEmptyFrame className={hasIntent ? "py-20" : "h-full"}>
      <Search aria-hidden size={48} className={emptyIcon()} />
      <p className={emptyTitle()}>
        {hasIntent
          ? query
            ? `No results for "${query}"`
            : "No matching messages"
          : "Search everything"}
      </p>
      <p className={emptyDescription()}>
        {hasIntent
          ? query
            ? "Try different keywords or a shorter phrase."
            : "Try a different filter set."
          : "Search channels, DMs, people, agents, and message history."}
      </p>
    </SearchResultsEmptyFrame>
  );
}

export function SearchError({ onRetry }: { onRetry: () => void }) {
  const theme = useThemeFamily();
  const { errorTitle, errorDescription, retryButton } = searchShell({ theme });
  return (
    <SearchResultsErrorFrame>
      <div className={errorTitle()}>Search failed</div>
      <div className={errorDescription()}>
        The last search request failed. Existing results are preserved when possible, but this query
        needs a retry.
      </div>
      <button type="button" onClick={onRetry} className={retryButton()}>
        Retry
      </button>
    </SearchResultsErrorFrame>
  );
}

function formatTimestamp(value: string) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "Unknown time";
  const difference = time - Date.now();
  const absolute = Math.abs(difference);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (absolute < hour) {
    return SEARCH_RELATIVE_TIME_FORMATTER.format(Math.round(difference / minute), "minute");
  }
  if (absolute < day) {
    return SEARCH_RELATIVE_TIME_FORMATTER.format(Math.round(difference / hour), "hour");
  }
  return SEARCH_RELATIVE_TIME_FORMATTER.format(Math.round(difference / day), "day");
}

function formatEntitySubtitle(subtitle: SearchEntitySubtitle) {
  if (subtitle.kind === "channel") return "Channel";
  if (subtitle.kind === "computer")
    return subtitle.hostname ? `Computer · ${subtitle.hostname}` : "Computer";
  if (subtitle.kind === "agentDm") return "Agent DM";
  if (subtitle.kind === "selfDm") return "Self DM";
  return subtitle.text;
}

export function SourceIdentityAvatar({
  context,
  type,
  avatar,
}: {
  context: "surface-list" | "compact-list" | "preview-mini";
  type: "agent" | "human";
  avatar?: SearchIdentityAvatarFixture;
}) {
  const theme = useThemeFamily();
  const { identityAvatar } = searchShell({ theme, avatarContext: context, avatarType: type });

  return (
    <span className={identityAvatar()}>
      {avatar?.kind === "image" ? (
        <img src={avatar.src} alt="" className="h-full w-full object-cover" />
      ) : type === "agent" ? (
        <PixelIdentityAvatar avatarKey={avatar?.kind === "pixel" ? avatar.key : "robot"} />
      ) : (
        <User
          aria-hidden
          size={context === "surface-list" ? 16 : context === "compact-list" ? 12 : 10}
        />
      )}
    </span>
  );
}

function PixelIdentityAvatar({
  avatarKey,
}: {
  avatarKey: Extract<SearchIdentityAvatarFixture, { kind: "pixel" }>["key"];
}) {
  const avatar = PIXEL_AVATARS[avatarKey];
  return (
    <span
      aria-hidden
      className="grid size-full shrink-0 grid-cols-8 grid-rows-8"
      style={{ backgroundColor: avatar.background, imageRendering: "pixelated" }}
    >
      {avatar.rows.flatMap((row, rowIndex) =>
        row.split("").map((color, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            style={{
              backgroundColor: PIXEL_PALETTE[color as keyof typeof PIXEL_PALETTE] ?? "transparent",
            }}
          />
        )),
      )}
    </span>
  );
}
