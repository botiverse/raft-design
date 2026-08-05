import type { ComponentProps, KeyboardEvent, ReactNode, Ref } from "react";
import { Hash, MessageSquare, Monitor, Search, User, X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  Panel,
  PanelHeaderRoot,
  Skeleton,
  useThemeFamily,
} from "raft-ui";
import { tv } from "tailwind-variants/lite";
import {
  SearchEntityResult,
  SearchEntityResultOpen,
  SearchMessageResult,
  SearchMessageResultBody,
  SearchMessageResultHeader,
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

const brutalButtonSm = [
  "border-2 border-black font-heading font-bold shadow-raft-sm",
  "transition-all duration-100 hover:-translate-y-px hover:shadow-raft-md",
  "active:translate-x-px active:translate-y-px active:shadow-raft-xs",
  "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-raft-sm disabled:transform-none",
];

export type BrutalSearchScope = "mentioned" | "humans" | "agents";
export type BrutalSearchTimeRange = "any" | "today" | "7d" | "30d";
export type BrutalSearchSort = "relevance" | "recent";

const searchShell = tv({
  slots: {
    frame: ["flex h-full min-h-0 flex-1 flex-col"],
    header: ["flex items-center gap-3"],
    content: ["relative flex min-h-0 min-w-0 flex-1 flex-col overflow-visible"],
    headerBack: ["inline-flex size-7 shrink-0 items-center justify-center leading-none md:hidden"],
    headerIconChip: ["flex size-9 shrink-0 items-center justify-center"],
    searchInputGroup: ["flex-1"],
    input: [],
    inputClear: [],
    inputKbd: ["hidden text-[10px] sm:inline"],
    filtersRow: ["shrink-0 px-4 py-3"],
    filterTrigger: ["h-8 w-auto px-3 py-0 text-xs"],
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
    resultBody: ["line-clamp-2 text-sm"],
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
    errorTitle: ["mb-2 text-sm"],
    errorDescription: ["mb-3 text-xs"],
    retryButton: ["px-3 py-1.5 text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        frame: ["bg-white"],
        header: [
          "h-[62px] px-5",
          "border-b-2 border-black bg-white",
          "[@media(max-height:600px)]:!h-[62px]",
        ],
        headerBack: ["bg-white text-black", brutalButtonSm],
        headerIconChip: ["border-2 border-black bg-soft-signal"],
        content: ["bg-white"],
        searchInputGroup: [
          "shadow-sm",
          "has-[[data-slot=input-group-control]:focus]:not-has-[[data-slot=input-group-control][data-invalid]]:shadow-md",
        ],
        input: ["font-heading font-medium placeholder:text-black/40"],
        inputClear: ["bg-white p-1", brutalButtonSm],
        inputKbd: ["font-bold uppercase text-black/50"],
        filtersRow: ["border-b-2 border-black bg-white"],
        filterTrigger: ["font-bold"],
        channelActiveChip: ["border-2 border-black bg-soft-signal font-bold text-black shadow-sm"],
        channelOptionIcon: ["text-black/50"],
        clearAllButton: ["border border-black bg-white font-bold text-black/60 hover:text-black"],
        resultsViewport: ["bg-white"],
        resultsContent: ["bg-white"],
        loadMoreButton: ["bg-white", brutalButtonSm],
        highlightMark: ["bg-soft-signal font-bold text-black"],
        metaLabel: ["font-bold text-black/50"],
        metaThreadChip: ["font-bold text-black/40"],
        metaArchivedChip: ["border border-black bg-brutal-orange/30 font-bold"],
        metaSender: ["font-bold text-black"],
        metaTimestamp: ["font-mono text-black/40"],
        resultBody: ["leading-relaxed text-black/70"],
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
        errorTitle: ["font-bold text-black"],
        errorDescription: ["text-black/60"],
        retryButton: ["bg-white", brutalButtonSm],
      },
      elegant: {
        frame: ["bg-layer-page dark:bg-layer-page"],
        header: [
          "min-h-[var(--shell-header-height,56px)]",
          "max-md:h-[var(--shell-header-height,56px)] max-md:bg-layer-page dark:bg-layer-page",
          "max-md:pl-5 max-md:pr-3.5 md:pl-9 md:pr-5",
        ],
        headerBack: [
          "rounded-md border border-line-field bg-layer-panel text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent dark:bg-layer-card dark:hover:bg-fill-muted",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        headerIconChip: ["rounded-md bg-fill-muted text-foreground-icon"],
        content: ["bg-layer-panel dark:bg-transparent"],
        searchInputGroup: ["dark:bg-layer-card"],
        input: ["font-sans text-foreground-strong placeholder:text-foreground-placeholder/70"],
        inputClear: [
          "rounded-sm p-1 text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:hover:bg-fill-muted dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        inputKbd: ["text-foreground-muted"],
        filtersRow: [
          "border-b border-line-muted bg-layer-panel",
          "px-7 max-md:pl-5 max-md:pr-3.5",
          "dark:bg-transparent",
        ],
        channelActiveChip: [
          "rounded-md border border-line-hairline bg-fill-muted font-medium text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent dark:bg-fill-muted dark:hover:bg-fill-strong",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        channelOptionIcon: ["text-foreground-icon"],
        clearAllButton: [
          "rounded-md border-0 font-medium text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:hover:bg-fill-muted dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        resultsViewport: ["bg-layer-panel dark:bg-transparent"],
        resultsContent: ["bg-layer-panel dark:bg-transparent", "px-7 max-md:pl-5 max-md:pr-3.5"],
        loadMoreButton: [
          "rounded-md border border-line-field bg-layer-panel font-medium text-foreground-strong",
          "shadow-none transition-colors hover:bg-fill-muted",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent dark:bg-layer-card dark:shadow-raft-xs dark:hover:bg-fill-muted",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        highlightMark: ["bg-soft-signal/70 text-inherit [font:inherit] dark:bg-primary-soft"],
        metaLabel: ["font-medium text-foreground-muted/70"],
        metaThreadChip: ["font-medium text-foreground-muted/70"],
        metaArchivedChip: [
          "rounded-sm border-[0.5px] border-line-hairline bg-fill-muted font-medium text-foreground-muted",
          "dark:border-transparent dark:bg-fill-muted",
        ],
        metaSender: ["font-medium text-foreground-muted"],
        metaTimestamp: ["font-sans tabular-nums text-foreground-muted/70"],
        resultBody: ["leading-5.25 tracking-[-0.01em] text-foreground-muted"],
        entityIconChannel: ["rounded-md bg-fill-muted text-foreground-icon"],
        entityIconComputer: ["rounded-md bg-fill-muted text-foreground-icon"],
        entityIconArchived: ["rounded-md bg-fill-muted text-foreground-disabled"],
        activityDot: ["border border-layer-panel bg-brutal-lime dark:bg-success"],
        entityTitle: ["font-medium text-foreground-strong"],
        entityTitleArchived: ["font-medium text-foreground-disabled"],
        typeBadge: [
          "rounded-sm border-[0.5px] border-line-hairline bg-layer-panel font-medium text-foreground-muted",
          "dark:border-transparent dark:bg-fill-muted",
        ],
        archivedBadge: [
          "rounded-sm border-[0.5px] border-line-hairline bg-fill-muted font-medium text-foreground-muted",
          "dark:border-transparent dark:bg-fill-muted",
        ],
        archivedBadgeMuted: [
          "rounded-sm border-[0.5px] border-line-hairline bg-fill-muted font-medium text-foreground-disabled",
          "dark:border-transparent dark:bg-fill-muted",
        ],
        entitySubtitle: ["text-foreground-muted/70"],
        entitySubtitleArchived: ["text-foreground-disabled"],
        threadHeaderMeta: ["font-medium text-foreground-muted"],
        threadChip: [
          "rounded-sm border-[0.5px] border-line-hairline bg-layer-panel",
          "dark:border-transparent dark:bg-fill-muted",
        ],
        threadTimestamp: ["font-sans tabular-nums text-foreground-muted/70"],
        threadTitle: ["font-medium text-foreground-strong"],
        skeletonCard: [
          "rounded-lg border-[0.5px] border-line-hairline bg-[oklch(0.985_0.003_84.559)] shadow-xs",
          "dark:border-transparent dark:bg-layer-card dark:shadow-raft-xs",
        ],
        errorTitle: ["font-medium text-foreground-strong"],
        errorDescription: ["text-foreground-muted"],
        retryButton: [
          "rounded-md border border-line-field bg-layer-panel font-medium text-foreground-strong",
          "shadow-none transition-colors hover:bg-fill-muted",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:border-transparent dark:bg-layer-card dark:shadow-raft-xs dark:hover:bg-fill-muted",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
      },
    },
  },
});

export function useSearchShell() {
  const theme = useThemeFamily();
  return searchShell({ theme });
}

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

export function BrutalSearchContent({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { content } = searchShell({ theme });
  return <div data-slot="search-panel-content" className={content({ className })} {...props} />;
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
  const { header, headerBack, headerIconChip, searchInputGroup, input, inputClear, inputKbd } =
    searchShell({ theme });
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
          <InputGroup className={searchInputGroup()}>
            <InputGroupInput
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={(event) => onCompositionEnd(event.currentTarget.value)}
              placeholder="Search channels, DMs, messages…   ⌘K"
              aria-label="Search channels, DMs, people, agents, and messages"
              className={input()}
            />
            <InputGroupAddon align="inline-end">
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
            </InputGroupAddon>
          </InputGroup>
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
      <SearchMessageResultHeader>
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
      </SearchMessageResultHeader>
      <SearchMessageResultBody className={shell.resultBody()}>
        <SearchHighlight text={message.content} query={query} />
      </SearchMessageResultBody>
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
  const hasIntent = Boolean(query || filtered);
  return (
    <EmptyState className={hasIntent ? "py-20" : "h-full"}>
      <EmptyStateContent>
        <EmptyStateIcon>
          <Search aria-hidden />
        </EmptyStateIcon>
        <EmptyStateTitle>
          {hasIntent
            ? query
              ? `No results for "${query}"`
              : "No matching messages"
            : "Search everything"}
        </EmptyStateTitle>
        <EmptyStateDescription>
          {hasIntent
            ? query
              ? "Try different keywords or a shorter phrase."
              : "Try a different filter set."
            : "Search channels, DMs, people, agents, and message history."}
        </EmptyStateDescription>
      </EmptyStateContent>
    </EmptyState>
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

const AVATAR_SIZE = {
  "surface-list": "sm",
  "compact-list": "xs",
  "preview-mini": "3xs",
} as const;

export function SourceIdentityAvatar({
  context,
  type,
  avatar,
}: {
  context: "surface-list" | "compact-list" | "preview-mini";
  type: "agent" | "human";
  avatar?: SearchIdentityAvatarFixture;
}) {
  return (
    <Avatar size={AVATAR_SIZE[context]} type={type}>
      {avatar?.kind === "image" ? <AvatarImage src={avatar.src} alt="" /> : null}
      <AvatarFallback>
        {type === "agent" ? (
          <PixelIdentityAvatar avatarKey={avatar?.kind === "pixel" ? avatar.key : "robot"} />
        ) : (
          <User aria-hidden />
        )}
      </AvatarFallback>
    </Avatar>
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
