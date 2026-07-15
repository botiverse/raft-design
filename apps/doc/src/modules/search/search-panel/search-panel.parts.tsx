import type { KeyboardEvent, ReactNode, Ref } from "react";
import { Check, Hash, MessageSquare, Monitor, Search, User, X } from "lucide-react";
import { Kbd, Skeleton } from "raft-ui";

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

const SEARCH_RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const PIXEL_PALETTE = {
  _: "transparent",
  K: "#141111",
  W: "white",
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
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white" onKeyDown={onKeyDown}>
      {children}
    </div>
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
  return (
    <div className="flex h-panel-header items-center gap-3 border-b-2 border-black bg-white px-5">
      <button
        type="button"
        onClick={onBack}
        title="Back"
        aria-label="Back"
        className="btn-brutal-sm inline-flex size-7 shrink-0 items-center justify-center bg-white font-bold leading-none text-black md:hidden"
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
          <div className="flex size-icon-header shrink-0 items-center justify-center border-2 border-black bg-soft-signal">
            <Search aria-hidden size={18} />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-brutal-sm focus-within:shadow-brutal">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={(event) => onCompositionEnd(event.currentTarget.value)}
              placeholder="Search channels, DMs, messages…   ⌘K"
              aria-label="Search channels, DMs, people, agents, and messages"
              className="min-w-0 flex-1 bg-transparent text-sm font-display font-medium outline-none placeholder:text-black/40"
            />
            {query ? (
              <button
                type="button"
                onClick={onClear}
                className="btn-brutal-sm bg-white p-1"
                aria-label="Clear search"
              >
                <X aria-hidden size={12} />
              </button>
            ) : null}
            <Kbd className="hidden text-[10px] font-bold uppercase text-black/50 sm:inline">
              Esc
            </Kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export type SelectionOption = {
  key: string;
  checked: boolean;
  label: string;
  onClick: () => void;
  leading?: ReactNode;
  reserveLeadingSlot?: boolean;
};

export function BrutalSelectionPopover({
  title,
  options,
  search,
  onSearchChange,
  onSearchKeyDown,
  showClear = false,
  onClear,
}: {
  title: string;
  options: readonly SelectionOption[];
  search?: string;
  onSearchChange?: (value: string) => void;
  onSearchKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  showClear?: boolean;
  onClear?: () => void;
}) {
  return (
    <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[220px] border-2 border-black bg-white shadow-brutal">
      <div className="flex items-center justify-between border-b border-black px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-black/60">{title}</span>
        {showClear && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-bold tracking-wide text-black/50 hover:text-black"
          >
            Clear
          </button>
        ) : null}
      </div>
      {search !== undefined && onSearchChange ? (
        <div className="border-b border-black px-2 py-2">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            onKeyDown={(event) => {
              event.stopPropagation();
              onSearchKeyDown?.(event);
            }}
            placeholder="Search…"
            aria-label={title}
            className="input-brutal w-full px-2 py-1 text-xs font-mono"
          />
        </div>
      ) : null}
      <div className="max-h-64 overflow-y-auto">
        {options.length === 0 ? (
          <div className="px-3 py-3 text-center text-[11px] font-mono text-black/40">
            No matches
          </div>
        ) : (
          options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={option.onClick}
              className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden border-b border-black/10 bg-white px-3 text-left text-xs font-bold text-black last:border-b-0 hover:bg-soft-signal/30"
            >
              <span className="flex min-w-0 items-center gap-2">
                {option.reserveLeadingSlot || option.leading ? (
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    {option.leading}
                  </span>
                ) : null}
                <span className="truncate leading-6">{option.label}</span>
              </span>
              {option.checked ? <Check aria-hidden size={12} className="shrink-0" /> : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function FilterChip({
  active = false,
  disabled = false,
  children,
  onClick,
  ariaLabel,
}: {
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-black bg-soft-signal text-black shadow-brutal-sm"
          : "border-black/30 bg-white text-black/70 hover:border-black"
      }`}
    >
      {children}
    </button>
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
    <div
      className={`flex w-full items-stretch border-2 bg-white text-left transition-colors ${
        selected
          ? "border-black shadow-brutal-sm"
          : "border-black/30 hover:border-black hover:shadow-brutal-sm active:border-black active:shadow-brutal-sm"
      }`}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 p-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex shrink-0">
            {entity.type === "channel" || entity.type === "computer" ? (
              <div
                className={`flex size-8 items-center justify-center overflow-hidden border-2 ${
                  isArchivedChannel
                    ? "border-black/40 bg-black/5 text-black/45"
                    : entity.type === "channel"
                      ? "border-black bg-soft-signal text-black"
                      : "border-black bg-brutal-lime"
                }`}
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
              <span
                aria-label="Active"
                className="absolute -right-0.5 -bottom-0.5 inline-block size-2.5 shrink-0 rounded-full border border-black bg-brutal-lime"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`truncate text-sm font-bold ${isArchivedChannel ? "text-black/45" : "text-black"}`}
              >
                {entity.title}
              </span>
              <span
                className={
                  isArchivedChannel
                    ? "border border-black/40 bg-black/5 px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black/45"
                    : "border border-black bg-white px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black/60"
                }
              >
                {typeLabel}
              </span>
              {entity.archivedAt ? (
                <span
                  className={
                    isArchivedChannel
                      ? "border border-black/40 bg-black/5 px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black/45"
                      : "border border-black bg-brutal-orange/30 px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black"
                  }
                >
                  Archived
                </span>
              ) : null}
            </div>
            <div
              className={`block truncate text-xs ${isArchivedChannel ? "text-black/30" : "text-black/50"}`}
            >
              {formatEntitySubtitle(entity.subtitle)}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function SearchHighlight({ text, query }: { text: string; query: string }) {
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
          <mark key={`${part}-${index}`} className="bg-soft-signal px-0.5 font-bold text-black">
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
  const resultTone = nested
    ? `border-t-2 px-3 py-3 ${selected ? "border-black bg-[#fff4bf]" : "border-black/10 hover:bg-black/[0.03]"}`
    : `border-2 p-3 ${selected ? "border-black shadow-brutal-sm" : "border-black/30 hover:border-black hover:shadow-brutal-sm active:border-black active:shadow-brutal-sm"}`;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onOpen}
      className={`w-full bg-white text-left transition-colors ${resultTone}`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-black/50">
          {channel?.kind === "dm" ? "@" : "#"}
          {channel?.name ?? "unknown"}
        </span>
        {message.threadId ? (
          <span className="inline-flex items-center gap-1 font-bold text-black/40">
            <MessageSquare aria-hidden size={10} /> thread
          </span>
        ) : null}
        {channel?.archivedAt ? (
          <span className="inline-flex items-center gap-1 border border-black bg-brutal-orange/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            Archived
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 font-bold text-black">
          <SourceIdentityAvatar
            context="preview-mini"
            type={sender?.kind ?? "human"}
            avatar={sender?.avatar}
          />
          <span>{sender?.label ?? "Unknown"}</span>
        </span>
        <span className="font-mono text-black/40">{formatTimestamp(message.createdAt)}</span>
      </div>
      <div className="line-clamp-2 text-sm leading-relaxed text-black/70">
        <SearchHighlight text={message.content} query={query} />
      </div>
    </button>
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
  const first = messages[0];
  const latest = messages.reduce<SearchMessageFixture | undefined>((current, message) => {
    if (!current) return message;
    return Date.parse(message.createdAt) > Date.parse(current.createdAt) ? message : current;
  }, undefined);
  const channel = first ? getChannel(first.channelId) : undefined;
  const hasSelected = messages.some((message) => selectedKey === `message:${message.id}`);
  return (
    <div
      className={`overflow-hidden border-2 bg-white transition-colors ${hasSelected ? "border-black shadow-brutal-sm" : "border-black/30 hover:border-black hover:shadow-brutal-sm"}`}
    >
      <div className="border-b-2 border-black bg-[#ffeefb] px-3 py-2">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-black/70">
          <span className="inline-flex items-center gap-1 border border-black bg-white px-1.5 py-0.5">
            <MessageSquare aria-hidden size={11} /> Thread
          </span>
          <span className="normal-case">
            {channel?.kind === "dm" ? "@" : "#"}
            {channel?.name ?? "unknown"}
          </span>
          <span>{messages.length} hits</span>
          <span className="font-mono normal-case text-black/50">
            {latest ? formatTimestamp(latest.createdAt) : ""}
          </span>
        </div>
        <div className="text-sm font-bold text-black">{title || "Thread discussion"}</div>
      </div>
      <div className="flex flex-col [&>*:first-child]:border-t-0">
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
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="border-2 border-black/30 bg-white p-3">
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
    <div
      className={`flex flex-col items-center justify-center text-center ${hasIntent ? "py-20" : "h-full"}`}
    >
      <Search aria-hidden size={48} className="mb-3 text-black/20" />
      <p className="text-sm font-bold text-black/50">
        {hasIntent
          ? query
            ? `No results for "${query}"`
            : "No matching messages"
          : "Search everything"}
      </p>
      <p className="mt-1 text-xs text-black/40">
        {hasIntent
          ? query
            ? "Try different keywords or a shorter phrase."
            : "Try a different filter set."
          : "Search channels, DMs, people, agents, and message history."}
      </p>
    </div>
  );
}

export function SearchError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-2 border-black bg-white p-4 shadow-brutal-sm">
      <div className="mb-2 text-sm font-bold text-black">Search failed</div>
      <div className="mb-3 text-xs text-black/60">
        The last search request failed. Existing results are preserved when possible, but this query
        needs a retry.
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="btn-brutal-sm bg-white px-3 py-1.5 text-xs"
      >
        Retry
      </button>
    </div>
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
  const boxClass =
    context === "surface-list"
      ? "size-8 border-2"
      : context === "compact-list"
        ? "size-5 border"
        : "size-[14px] border";
  const fallbackClass = type === "agent" ? "bg-brutal-cyan" : "bg-brutal-lavender text-black";

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border-black ${boxClass} ${fallbackClass}`}
    >
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
