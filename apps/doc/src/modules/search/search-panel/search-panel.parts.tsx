import { useCallback } from "react";
import type { ChangeEvent, CompositionEvent, Ref } from "react";
import { Hash, MessageSquare, Monitor, Search, User, X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  PanelHeader,
  PanelHeaderIcon,
  SearchEntityResult,
  SearchEntityResultActivity,
  SearchEntityResultContent,
  SearchEntityResultDescription,
  SearchEntityResultHeader,
  SearchEntityResultIcon,
  SearchEntityResultLeading,
  SearchEntityResultTitle,
  SearchMessageResult,
  SearchMessageResultBody,
  SearchMessageResultHeader,
  SearchMessageResultMatch,
  SearchMessageResultMeta,
  SearchMessageResultSender,
  SearchMessageResultThreadMeta,
  SearchMessageResultTimestamp,
  SearchThreadMessageResult,
  SearchThreadResult,
  SearchThreadResultHeader,
  SearchThreadResultMeta,
  SearchThreadResultMessages,
  SearchThreadResultTimestamp,
  SearchThreadResultTitle,
  Skeleton,
} from "@botiverse/raft-ui";

import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchEntitySubtitle,
  SearchIdentityAvatarFixture,
  SearchMessageFixture,
  SearchSenderFixture,
} from "../search.fixtures.ts";

export type SearchScope = "mentioned" | "humans" | "agents";
export type SearchTimeRange = "any" | "today" | "7d" | "30d";
export type SearchSort = "relevance" | "recent";

const SEARCH_RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const PIXEL_PALETTE = {
  _: "transparent",
  K: "oklch(0.1812926 0.0049716 17.6198)",
  W: "oklch(1 0 0)",
  C: "var(--color-palette-cyan)",
  Y: "var(--color-palette-yellow)",
  V: "var(--color-palette-lavender)",
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

export function SearchHeader({
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
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.currentTarget.value),
    [onQueryChange],
  );
  const handleCompositionEnd = useCallback(
    (event: CompositionEvent<HTMLInputElement>) => onCompositionEnd(event.currentTarget.value),
    [onCompositionEnd],
  );

  return (
    <PanelHeader className="gap-3 md:pl-5 [@media(max-height:600px)]:h-[62px]!">
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        onClick={onBack}
        title="Back"
        aria-label="Back"
        className="md:hidden"
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
      </Button>
      <PanelHeaderIcon>
        <Search aria-hidden className="size-4.5" />
      </PanelHeaderIcon>
      <InputGroup className="min-w-0 flex-1 max-md:col-start-3 max-md:row-start-1">
        <InputGroupInput
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="Search channels, DMs, messages…   ⌘K"
          aria-label="Search channels, DMs, people, agents, and messages"
        />
        <InputGroupAddon align="inline-end">
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onClear}
              aria-label="Clear search"
            >
              <X aria-hidden size={12} />
            </Button>
          ) : null}
          <Kbd className="max-md:hidden">Esc</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </PanelHeader>
  );
}

export function EntityResult({
  entity,
  selected,
  setResultRef,
  onOpen,
}: {
  entity: SearchEntityFixture;
  selected: boolean;
  setResultRef?: (key: string, element: HTMLButtonElement | null) => void;
  onOpen?: (entity: SearchEntityFixture) => void;
}) {
  const buttonRef = useCallback(
    (element: HTMLButtonElement | null) => setResultRef?.(entity.key, element),
    [entity.key, setResultRef],
  );
  const handleOpen = useCallback(() => onOpen?.(entity), [entity, onOpen]);
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
    <SearchEntityResult
      selected={selected}
      ref={buttonRef}
      onClick={onOpen ? handleOpen : undefined}
      disabled={!onOpen}
    >
      <SearchEntityResultLeading>
        {entity.type === "channel" || entity.type === "computer" ? (
          <SearchEntityResultIcon>
            <Icon aria-hidden size={14} />
          </SearchEntityResultIcon>
        ) : (
          <SourceIdentityAvatar context="surface-list" type={identityType} avatar={entity.avatar} />
        )}
        {entity.type === "agentDm" && entity.activity === "active" ? (
          <SearchEntityResultActivity role="img" aria-label="Active" />
        ) : null}
      </SearchEntityResultLeading>
      <SearchEntityResultContent>
        <SearchEntityResultHeader>
          <SearchEntityResultTitle muted={isArchivedChannel}>
            {entity.title}
          </SearchEntityResultTitle>
          <Badge
            appearance={isArchivedChannel ? "soft" : "solid"}
            variant={isArchivedChannel ? "muted" : "default"}
          >
            {typeLabel}
          </Badge>
          {entity.archivedAt ? (
            isArchivedChannel ? (
              <Badge appearance="soft" variant="muted">
                Archived
              </Badge>
            ) : (
              <Badge appearance="soft" variant="warning">
                Archived
              </Badge>
            )
          ) : null}
        </SearchEntityResultHeader>
        <SearchEntityResultDescription muted={isArchivedChannel}>
          {formatEntitySubtitle(entity.subtitle)}
        </SearchEntityResultDescription>
      </SearchEntityResultContent>
    </SearchEntityResult>
  );
}

function SearchHighlight({ text, query }: { text: string; query: string }) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;
  const expression = new RegExp(
    `(${tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "ig",
  );
  const segments: Array<{ end: number; highlighted: boolean; start: number; value: string }> = [];
  let cursor = 0;
  for (const match of text.matchAll(expression)) {
    const start = match.index;
    if (start > cursor) {
      segments.push({
        end: start,
        highlighted: false,
        start: cursor,
        value: text.slice(cursor, start),
      });
    }
    const end = start + match[0].length;
    segments.push({ end, highlighted: true, start, value: match[0] });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({
      end: text.length,
      highlighted: false,
      start: cursor,
      value: text.slice(cursor),
    });
  }
  return (
    <>
      {segments.map(({ end, highlighted, start, value }) =>
        highlighted ? (
          <SearchMessageResultMatch key={`${start}:${end}:match`}>{value}</SearchMessageResultMatch>
        ) : (
          <span key={`${start}:${end}:text`}>{value}</span>
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
  setResultRef,
  onOpen,
}: {
  message: SearchMessageFixture;
  sender?: SearchSenderFixture;
  channel?: SearchChannelFixture;
  query: string;
  nested?: boolean;
  selected: boolean;
  setResultRef?: (key: string, element: HTMLButtonElement | null) => void;
  onOpen?: (message: SearchMessageFixture) => void;
}) {
  const Result = nested ? SearchThreadMessageResult : SearchMessageResult;
  const buttonRef = useCallback(
    (element: HTMLButtonElement | null) => setResultRef?.(`message:${message.id}`, element),
    [message.id, setResultRef],
  );
  const handleOpen = useCallback(() => onOpen?.(message), [message, onOpen]);

  return (
    <Result
      ref={buttonRef}
      onClick={onOpen ? handleOpen : undefined}
      selected={selected}
      disabled={!onOpen}
    >
      <SearchMessageResultHeader>
        <SearchMessageResultMeta>
          {channel?.kind === "dm" ? "@" : "#"}
          {channel?.name ?? "unknown"}
        </SearchMessageResultMeta>
        {message.threadId ? (
          <SearchMessageResultThreadMeta>
            <MessageSquare aria-hidden size={10} /> thread
          </SearchMessageResultThreadMeta>
        ) : null}
        {channel?.archivedAt ? (
          <Badge appearance="soft" variant="warning">
            Archived
          </Badge>
        ) : null}
        <SearchMessageResultSender>
          <SourceIdentityAvatar
            context="preview-mini"
            type={sender?.kind ?? "human"}
            avatar={sender?.avatar}
          />
          <span>{sender?.label ?? "Unknown"}</span>
        </SearchMessageResultSender>
        <SearchMessageResultTimestamp>
          {formatTimestamp(message.createdAt)}
        </SearchMessageResultTimestamp>
      </SearchMessageResultHeader>
      <SearchMessageResultBody>
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
  setResultRef?: (key: string, element: HTMLButtonElement | null) => void;
  onOpenMessage?: (message: SearchMessageFixture) => void;
}) {
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
        <SearchThreadResultMeta>
          <Badge appearance="solid" variant="default">
            <MessageSquare aria-hidden size={11} /> Thread
          </Badge>
          <span className="normal-case">
            {channel?.kind === "dm" ? "@" : "#"}
            {channel?.name ?? "unknown"}
          </span>
          <span>{messages.length} hits</span>
          <SearchThreadResultTimestamp>
            {latest ? formatTimestamp(latest.createdAt) : ""}
          </SearchThreadResultTimestamp>
        </SearchThreadResultMeta>
        <SearchThreadResultTitle>{title || "Thread discussion"}</SearchThreadResultTitle>
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
            setResultRef={setResultRef}
            onOpen={onOpenMessage}
          />
        ))}
      </SearchThreadResultMessages>
    </SearchThreadResult>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index}>
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
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateTitle>Search failed</EmptyStateTitle>
        <EmptyStateDescription>
          The last search request failed. Existing results are preserved when possible, but this
          query needs a retry.
        </EmptyStateDescription>
      </EmptyStateContent>
      <EmptyStateActions>
        <Button type="button" variant="danger-outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </EmptyStateActions>
    </EmptyState>
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
