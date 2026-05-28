import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CalendarRange, ChevronDown, Hash, MessageSquare, Search, UserCircle2, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import { useChannelStore } from "../../store/channelStore";
import { useAgentStore } from "../../store/agentStore";
import { useThreadStore } from "../../store/threadStore";
import { useMobileBack } from "../../hooks/useAppNavigate";
import AgentActivityDot from "../agent/AgentActivityDot";
import PanelHeader from "../ui/PanelHeader";
import SectionEyebrow from "../ui/SectionEyebrow";
import AvatarSlot from "../ui/AvatarSlot";
import SegmentedControl from "../ui/SegmentedControl";
import SelectionPopover from "../ui/SelectionPopover";
import { buildSearchEntityResults, type SearchEntityResult } from "./searchEntities";
import { resolveMessageSenderMemberFromList } from "../../utils/messageSenderMember";
import {
  buildTimeRangeParams,
  formatSearchRelativeTime,
  getEffectiveMessageSearchSort,
  groupMessageSearchResults,
  hasMeaningfulMessageSearchFilter,
  normalizeSearchSort,
  normalizeSearchTimeRange,
  type SearchSort,
  type SearchTimeRange,
} from "./searchGrouping";
import { getCommittedSearchQuery } from "./searchComposition";
import { buildSearchRetryReset } from "./searchRetry";

const MAX_ENTITY_RESULTS = 5;
const PAGE_SIZE = 20;

interface MessageSearchResult {
  id: string;
  channelId: string;
  threadId: string | null;
  parentMessageId: string | null;
  parentMessageContent: string | null;
  parentChannelId: string;
  parentChannelName: string;
  parentChannelType: "channel" | "private" | "joint" | "dm" | "thread";
  parentChannelArchivedAt: string | null;
  senderId: string;
  senderType: "user" | "agent";
  senderName: string;
  channelName: string;
  channelType: "channel" | "private" | "joint" | "dm" | "thread";
  channelArchivedAt: string | null;
  content: string;
  snippet: string;
  createdAt: string;
}

interface SenderFilterOption {
  key: string;
  id: string;
  type: "user" | "agent";
  label: string;
  handle: string;
  isSelf?: boolean;
  avatarUrl?: string | null;
  gravatarHash?: string | null;
  email?: string | null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTimeRangeLabel(range: SearchTimeRange): string {
  switch (range) {
    case "today":
      return "Today";
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    default:
      return "Any time";
  }
}

function SearchHighlight({ text, query }: { text: string; query: string }) {
  const tokens = useMemo(() => {
    const parts = query
      .trim()
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : query.trim() ? [query.trim()] : [];
  }, [query]);

  const parts = useMemo(() => {
    if (tokens.length === 0) return [text];
    const re = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig");
    return text.split(re);
  }, [text, tokens]);

  if (tokens.length === 0) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        const matched = tokens.some((token) => token.toLowerCase() === part.toLowerCase());
        return matched ? (
          <mark key={`${part}-${index}`} className="bg-brutal-yellow px-0.5 font-bold text-black">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </>
  );
}

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="animate-pulse border-2 border-black/30 bg-white p-3">
          <div className="mb-2 flex gap-2">
            <div className="h-3 w-24 bg-black/10" />
            <div className="h-3 w-20 bg-black/10" />
            <div className="h-3 w-16 bg-black/10" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-black/10" />
            <div className="h-3 w-4/5 bg-black/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SearchResultsBoundaryProps {
  resetKey: string;
  onRetry: () => void;
  children: ReactNode;
}

interface SearchResultsBoundaryState {
  hasError: boolean;
}

class SearchResultsBoundary extends Component<SearchResultsBoundaryProps, SearchResultsBoundaryState> {
  state: SearchResultsBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SearchResultsBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[Search] render failed", error);
  }

  componentDidUpdate(prevProps: SearchResultsBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-2 border-black bg-white p-4 text-left shadow-brutal-sm">
          <div className="mb-2 text-sm font-bold text-black">Search results failed to render</div>
          <div className="mb-3 text-xs text-black/60">
            This should not blank the whole search page. Retry the search, and if it happens again we should inspect the failing result shape.
          </div>
          <button
            type="button"
            onClick={this.props.onRetry}
            className="btn-brutal-sm bg-white px-3 py-1.5 text-xs"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function MessageSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = useServerStore((s) => s.current?.slug);
  const channels = useChannelStore((s) => s.channels);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const openDM = useChannelStore((s) => s.openDM);
  const openUserDM = useChannelStore((s) => s.openUserDM);
  const members = useServerStore((s) => s.members);
  const agents = useAgentStore((s) => s.agents);
  const currentUser = useAuthStore((s) => s.user);
  const openThread = useThreadStore((s) => s.openThread);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeMenuRef = useRef<HTMLDivElement>(null);
  const channelMenuRef = useRef<HTMLDivElement>(null);
  const senderMenuRef = useRef<HTMLDivElement>(null);

  const initialQuery = searchParams.get("q") ?? "";
  const senderIdParam = searchParams.get("senderId") ?? "";
  const channelIdParam = searchParams.get("channelId") ?? "";
  const timeRange = normalizeSearchTimeRange(searchParams.get("range"));
  const sort = normalizeSearchSort(searchParams.get("sort"));
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchNonce, setSearchNonce] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);
  const [channelMenuOpen, setChannelMenuOpen] = useState(false);
  const [senderMenuOpen, setSenderMenuOpen] = useState(false);
  const [channelFilterQuery, setChannelFilterQuery] = useState("");
  const [senderFilterQuery, setSenderFilterQuery] = useState("");

  const queryParam = searchParams.get("q") ?? "";
  const hasActiveFilters = hasMeaningfulMessageSearchFilter({
    senderId: senderIdParam,
    channelId: channelIdParam,
    timeRange,
  });
  const hasSearchIntent = Boolean(query.trim() || hasActiveFilters);
  const effectiveSort = getEffectiveMessageSearchSort(query, sort);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!timeMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!timeMenuRef.current?.contains(event.target as Node)) {
        setTimeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [timeMenuOpen]);

  useEffect(() => {
    if (!channelMenuOpen) return;
    setChannelFilterQuery("");
    const onPointerDown = (event: MouseEvent) => {
      if (!channelMenuRef.current?.contains(event.target as Node)) {
        setChannelMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [channelMenuOpen]);

  useEffect(() => {
    if (!senderMenuOpen) return;
    setSenderFilterQuery("");
    const onPointerDown = (event: MouseEvent) => {
      if (!senderMenuRef.current?.contains(event.target as Node)) {
        setSenderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [senderMenuOpen]);

  const updateSearchParam = useCallback((key: string, value?: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value == null || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("senderId");
    next.delete("range");
    next.delete("channelId");
    setSearchParams(next, { replace: true });
    setTimeMenuOpen(false);
    setSenderMenuOpen(false);
  }, [searchParams, setSearchParams]);

  const entityResults = useMemo(
    () =>
      buildSearchEntityResults({
        query,
        channels,
        members,
        agents,
        currentUser,
        dmChannels,
      }).slice(0, MAX_ENTITY_RESULTS),
    [agents, channels, currentUser, dmChannels, members, query]
  );
  const resolveUserMember = useCallback((userId: string | null) => (
    userId
      ? resolveMessageSenderMemberFromList({ senderType: "user", senderId: userId }, members, currentUser)
      : undefined
  ), [currentUser, members]);

  const filteredChannels = useMemo(() => {
    const normalizedQuery = channelFilterQuery.trim().toLowerCase();
    if (!normalizedQuery) return channels;
    return channels.filter((channel) => {
      const haystack = `${channel.name} ${channel.description ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [channelFilterQuery, channels]);

  const senderOptions = useMemo<SenderFilterOption[]>(() => {
    const humans = members.map<SenderFilterOption>((member) => ({
      key: `user:${member.userId}`,
      id: member.userId,
      type: "user",
      label: member.displayName || member.name,
      handle: member.name,
      isSelf: currentUser?.id === member.userId,
      avatarUrl: member.avatarUrl,
      gravatarHash: member.gravatarHash,
      email: member.email,
    }));
    const hasCurrentUser = Boolean(currentUser?.id && humans.some((option) => option.id === currentUser.id));
    const withCurrentUser = currentUser?.id && !hasCurrentUser
      ? [
          {
            key: `user:${currentUser.id}`,
            id: currentUser.id,
            type: "user" as const,
            label: currentUser.displayName || currentUser.name || currentUser.email,
            handle: currentUser.name || currentUser.email,
            isSelf: true,
            avatarUrl: currentUser.avatarUrl,
            email: currentUser.email,
          },
          ...humans,
        ]
      : humans;
    const agentOptions = agents
      .filter((agent) => !agent.deletedAt)
      .map<SenderFilterOption>((agent) => ({
        key: `agent:${agent.id}`,
        id: agent.id,
        type: "agent",
        label: agent.displayName || agent.name,
        handle: agent.name,
        avatarUrl: agent.avatarUrl,
      }));
    return [...withCurrentUser, ...agentOptions].sort((a, b) => {
      if (a.isSelf && !b.isSelf) return -1;
      if (!a.isSelf && b.isSelf) return 1;
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    });
  }, [agents, currentUser, members]);

  const filteredSenderOptions = useMemo(() => {
    const needle = senderFilterQuery.trim().toLowerCase();
    if (!needle) return senderOptions;
    return senderOptions.filter((option) => {
      const haystack = `${option.label} ${option.handle}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [senderFilterQuery, senderOptions]);

  const selectedSender = useMemo(
    () => senderOptions.find((option) => option.id === senderIdParam) ?? null,
    [senderIdParam, senderOptions],
  );

  useEffect(() => {
    const trimmed = getCommittedSearchQuery(query, isComposing);
    if (trimmed === null && isComposing) return;
    if (trimmed === queryParam) return;
    const next = new URLSearchParams(searchParams);
    if (trimmed) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  }, [isComposing, query, queryParam, searchParams, setSearchParams]);

  const buildMessageSearchParams = useCallback((offset: number) => {
    const trimmed = getCommittedSearchQuery(query, isComposing);
    if (trimmed === null) return null;
    const hasFilters = hasMeaningfulMessageSearchFilter({
      senderId: senderIdParam,
      channelId: channelIdParam,
      timeRange,
    });
    if (!trimmed && !hasFilters) return null;

    const params: Record<string, string | number> = {
      q: trimmed,
      limit: PAGE_SIZE,
      offset,
    };
    const requestSort = getEffectiveMessageSearchSort(trimmed, sort);
    if (trimmed && requestSort === "recent") {
      params.sort = sort;
    }

    if (senderIdParam) {
      params.senderId = senderIdParam;
    }

    if (channelIdParam) {
      params.channelId = channelIdParam;
    }

    const timeRangeParams = buildTimeRangeParams(timeRange);
    if (timeRangeParams.after) params.after = timeRangeParams.after;
    if (timeRangeParams.before) params.before = timeRangeParams.before;

    return params;
  }, [channelIdParam, isComposing, query, senderIdParam, sort, timeRange]);

  useEffect(() => {
    const params = buildMessageSearchParams(0);
    if (!params) {
      setResults([]);
      setLoading(false);
      setLoadingMore(false);
      setHasMore(false);
      setSearchError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setLoadingMore(false);
      setSearchError(null);
      try {
        const { data } = await api.get("/messages/search", { params, signal: controller.signal });
        if (!cancelled) {
          setResults(Array.isArray(data.results) ? data.results : []);
          setHasMore(Boolean(data.hasMore));
        }
      } catch (error: any) {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
          return;
        }
        if (!cancelled) {
          setHasMore(false);
          setSearchError("Search request failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [buildMessageSearchParams, searchNonce]);

  const handleBack = useMobileBack(slug ? `/s/${slug}` : "/");

  const openResult = useCallback(async (result: MessageSearchResult) => {
    if (!slug) return;
    if (result.channelType === "thread" && result.parentMessageId) {
      navigate(`/s/${slug}/channel/${result.parentChannelId}?msg=${result.parentMessageId}`);
      void openThread(result.parentChannelId, result.parentMessageId, result.id);
      return;
    }
    navigate(`/s/${slug}/channel/${result.channelId}?msg=${result.id}`);
  }, [navigate, openThread, slug]);

  const openEntityResult = useCallback(async (result: SearchEntityResult) => {
    if (!slug) return;
    if (result.type === "channel" && result.channelId) {
      navigate(`/s/${slug}/channel/${result.channelId}`);
      return;
    }
    try {
      if (result.type === "agentDm" && result.agentId) {
        const dmChannel = result.channelId
          ? { id: result.channelId }
          : await openDM(result.agentId);
        // DMs use the /dm/<id> route (DmRoute), not /channel/. Routing as a
        // channel makes the sidebar's DM list unable to highlight the
        // active conversation, since `isDmSelected` keys on /dm/<id>.
        navigate(`/s/${slug}/dm/${dmChannel.id}`);
        return;
      }
      if (result.type === "humanDm" && result.userId) {
        const dmChannel = result.channelId
          ? { id: result.channelId }
          : await openUserDM(result.userId);
        navigate(`/s/${slug}/dm/${dmChannel.id}`);
      }
    } catch {
      if (result.type === "agentDm" && result.agentId) {
        navigate(`/s/${slug}/agent/${result.agentId}`);
        return;
      }
      if (result.type === "humanDm" && result.userId) {
        navigate(`/s/${slug}/human/${result.userId}`);
      }
    }
  }, [navigate, openDM, openUserDM, slug]);

  const groupedMessageResults = useMemo(
    () => groupMessageSearchResults(results),
    [results]
  );
  const retrySearch = useCallback(() => {
    // Retry must clear the last crashing result set before the debounced fetch starts,
    // otherwise the boundary can immediately trip again on the same data.
    const reset = buildSearchRetryReset();
    setResults(reset.results);
    setLoading(reset.loading);
    setLoadingMore(reset.loadingMore);
    setHasMore(reset.hasMore);
    setSearchError(reset.searchError);
    setSearchNonce((prev) => prev + 1);
  }, []);

  const selectableResults = useMemo(
    () => [
      ...entityResults.map((result) => ({ key: result.key, kind: "entity" as const, result })),
      ...results.map((result) => ({ key: `message:${result.id}`, kind: "message" as const, result })),
    ],
    [entityResults, results]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectableResults]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && channelMenuOpen) {
        event.preventDefault();
        setChannelMenuOpen(false);
        return;
      }
      if (event.key === "Escape" && senderMenuOpen) {
        event.preventDefault();
        setSenderMenuOpen(false);
        return;
      }
      if (event.key === "Escape" && timeMenuOpen) {
        event.preventDefault();
        setTimeMenuOpen(false);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        handleBack();
        return;
      }
      if (!selectableResults.length) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, selectableResults.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        const selected = selectableResults[selectedIndex];
        if (selected) {
          event.preventDefault();
          if (selected.kind === "entity") {
            void openEntityResult(selected.result);
          } else {
            void openResult(selected.result);
          }
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleBack, openEntityResult, openResult, selectableResults, selectedIndex, timeMenuOpen, channelMenuOpen, senderMenuOpen]);

  const selectedResultKey = selectableResults[selectedIndex]?.key;
  const totalResults = entityResults.length + results.length;
  const boundaryKey = `${queryParam}|${senderIdParam}|${timeRange}|${sort}|${searchNonce}|${channelIdParam}`;
  const showInitialSkeleton = loading && entityResults.length === 0 && results.length === 0 && !searchError;

  const getSourceLabel = useCallback((result: MessageSearchResult) => {
    const isDm = result.channelType === "thread"
      ? result.parentChannelType === "dm"
      : result.channelType === "dm";
    const sourceChannelId = result.channelType === "thread"
      ? result.parentChannelId
      : result.channelId;
    const rawName = result.channelType === "thread"
      ? result.parentChannelName
      : result.channelName;
    const dmPeer = isDm
      ? dmChannels.find((channel) => channel.id === sourceChannelId)
      : null;
    const displayName = dmPeer
      ? (dmPeer.peerDisplayName || dmPeer.peerName || rawName)
      : rawName;
    return isDm ? `@${displayName}` : `#${displayName}`;
  }, [dmChannels]);

  const renderMessageHit = useCallback((result: MessageSearchResult, nested = false) => {
    const agent = result.senderType === "agent"
      ? agents.find((entry) => entry.id === result.senderId)
      : null;
    const member = result.senderType === "user"
      ? resolveMessageSenderMemberFromList(result, members, currentUser)
      : null;
    const sourceLabel = getSourceLabel(result);
    const resultKey = `message:${result.id}`;

    return (
      <button
        key={result.id}
        type="button"
        onClick={() => { void openResult(result); }}
        className={`w-full text-left transition-colors bg-white ${
          nested
            ? `border-t-2 px-3 py-3 ${selectedResultKey === resultKey ? "border-black bg-[#fff4bf]" : "border-black/10 hover:bg-black/[0.03]"}`
            : `border-2 p-3 ${selectedResultKey === resultKey ? "border-black shadow-brutal-sm" : "border-black/30 hover:border-black hover:shadow-brutal-sm active:border-black active:shadow-brutal-sm"}`
        }`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-black/50">{sourceLabel}</span>
          {result.channelType === "thread" && (
            <span className="inline-flex items-center gap-1 font-bold text-black/40">
              <MessageSquare size={10} />
              thread
            </span>
          )}
          {(result.channelType === "thread"
            ? result.parentChannelArchivedAt
            : result.channelArchivedAt) && (
            <span className="inline-flex items-center gap-1 border border-black bg-brutal-orange/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Archived
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-bold text-black">
            {result.senderType === "agent" ? (
              <AvatarSlot context="preview-mini" type="agent" agentAvatarUrl={agent?.avatarUrl ?? null} />
            ) : (
              <AvatarSlot context="preview-mini" type="human" humanAvatarUrl={member?.avatarUrl} gravatarHash={member?.gravatarHash} />
            )}
            <span>{result.senderName}</span>
          </span>
          <span className="font-mono text-black/40">{formatSearchRelativeTime(result.createdAt)}</span>
        </div>
        <div className="line-clamp-2 text-sm leading-relaxed text-black/70">
          <SearchHighlight text={result.snippet} query={query} />
        </div>
      </button>
    );
  }, [agents, currentUser, getSourceLabel, members, openResult, query, selectedResultKey]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <PanelHeader
        onMobileBack={handleBack}
        titleSlot={
          <div className="flex items-center gap-3">
            {/* Search icon — always visible on this surface (unlike other
                panel headers where icon is desktop-only) since search
                identity matters at every viewport. */}
            <div className="flex size-icon-header shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow">
              <Search size={18} />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-brutal-sm">
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                onCompositionStart={() => {
                  setIsComposing(true);
                }}
                onCompositionEnd={(event) => {
                  setQuery(event.currentTarget.value);
                  setIsComposing(false);
                }}
                placeholder="Search channels, DMs, messages…"
                className="min-w-0 flex-1 bg-transparent text-sm font-display font-medium outline-none placeholder:text-black/40"
              />
              <button type="button" onClick={() => setQuery("")} className={`btn-brutal-sm bg-white p-1 ${query ? '' : 'invisible'}`} aria-label="Clear search">
                <X size={12} />
              </button>
              <span className="hidden sm:inline border border-black px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-black/50">
                ESC
              </span>
            </div>
          </div>
        }
      />

      <div className="shrink-0 border-b-2 border-black bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div ref={senderMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setSenderMenuOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                senderIdParam
                  ? "border-black bg-brutal-yellow text-black shadow-brutal-sm"
                  : "border-black/30 bg-white text-black/70 hover:border-black"
              }`}
            >
              <UserCircle2 size={14} />
              <span>{selectedSender ? `From: ${selectedSender.isSelf ? "Me" : selectedSender.label}` : "From"}</span>
              <ChevronDown size={12} />
            </button>

            {senderMenuOpen && (
              <SelectionPopover
                title="From"
                searchable
                search={senderFilterQuery}
                onSearchChange={setSenderFilterQuery}
                options={filteredSenderOptions.map((sender) => ({
                  key: sender.key,
                  checked: sender.id === senderIdParam,
                  onClick: () => {
                    updateSearchParam("senderId", sender.id);
                    setSenderMenuOpen(false);
                  },
                  label: sender.isSelf ? "Me" : sender.label,
                  reserveLeadingSlot: true,
                  avatar: (
                    <AvatarSlot
                      context="compact-list"
                      type={sender.type === "agent" ? "agent" : "human"}
                      agentAvatarUrl={sender.type === "agent" ? sender.avatarUrl ?? null : null}
                      humanAvatarUrl={sender.type === "user" ? sender.avatarUrl ?? null : null}
                      gravatarHash={sender.type === "user" ? sender.gravatarHash ?? null : null}
                      email={sender.type === "user" ? sender.email ?? null : null}
                    />
                  ),
                }))}
                showClear={Boolean(senderIdParam)}
                onClear={() => {
                  updateSearchParam("senderId", null);
                  setSenderMenuOpen(false);
                }}
                onInputKeyDown={(event, options) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setSenderMenuOpen(false);
                    return;
                  }
                  if (event.key === "Enter" && options[0]) {
                    event.preventDefault();
                    options[0].onClick();
                  }
                }}
              />
            )}
          </div>

          {channelIdParam && (() => {
            const ch = channels.find((c) => c.id === channelIdParam) ?? dmChannels.find((c) => c.id === channelIdParam);
            const label = ch ? `#${ch.name}` : "#channel";
            return (
              <button
                type="button"
                onClick={() => updateSearchParam("channelId", null)}
                className="inline-flex items-center gap-2 border-2 border-black bg-brutal-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-brutal-sm"
              >
                <Hash size={12} />
                {label}
                <X size={10} />
              </button>
            );
          })()}

          {!channelIdParam && (
            <div ref={channelMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setChannelMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors border-black/30 bg-white text-black/70 hover:border-black`}
              >
                <Hash size={14} />
                <span>Channel</span>
                <ChevronDown size={12} />
              </button>

              {channelMenuOpen && (
                <SelectionPopover
                  title="Channels"
                  searchable
                  search={channelFilterQuery}
                  onSearchChange={setChannelFilterQuery}
                  options={filteredChannels.map((ch) => ({
                    key: ch.id,
                    checked: false,
                    onClick: () => {
                      updateSearchParam("channelId", ch.id);
                      setChannelMenuOpen(false);
                    },
                    label: `#${ch.name}`,
                    leading: <Hash size={12} className="text-black/50" />,
                  }))}
                  onInputKeyDown={(event, options) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      setChannelMenuOpen(false);
                      return;
                    }
                    if (event.key === "Enter" && options[0]) {
                      event.preventDefault();
                      options[0].onClick();
                    }
                  }}
                />
              )}
            </div>
          )}

          <div ref={timeMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setTimeMenuOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                timeRange !== "any"
                  ? "border-black bg-brutal-yellow text-black shadow-brutal-sm"
                  : "border-black/30 bg-white text-black/70 hover:border-black"
              }`}
            >
              <CalendarRange size={14} />
              <span>{getTimeRangeLabel(timeRange)}</span>
              <ChevronDown size={12} />
            </button>

            {timeMenuOpen && (
              <SelectionPopover
                title="Time"
                options={(["any", "today", "7d", "30d"] as SearchTimeRange[]).map((range) => ({
                  key: range,
                  checked: timeRange === range,
                  label: getTimeRangeLabel(range),
                  onClick: () => {
                    updateSearchParam("range", range === "any" ? null : range);
                    setTimeMenuOpen(false);
                  },
                }))}
              />
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 border border-black bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black/60 hover:text-black"
            >
              Clear All
            </button>
          )}

          <SegmentedControl<SearchSort>
            value={effectiveSort}
            ariaLabel="Sort search results"
            onChange={(mode) => updateSearchParam("sort", mode === "relevance" ? null : mode)}
            disabled={!query.trim()}
            className="ml-auto"
            options={[
              { value: "relevance", label: "Relevant", testId: "search-sort-relevance" },
              { value: "recent", label: "Recent", testId: "search-sort-recent" },
            ]}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        {!hasSearchIntent && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Search size={48} className="mb-3 text-black/20" />
            <p className="text-sm font-bold text-black/50">Search everything</p>
            <p className="mt-1 text-xs text-black/40">
              Search channels, DMs, people, agents, and message history.
            </p>
          </div>
        )}

        {hasSearchIntent && (
          <div className="p-4">
            <div className="mb-3 px-1">
              <SectionEyebrow>
                {loading ? "Searching…" : `${totalResults} results`}
              </SectionEyebrow>
            </div>

            {!loading && totalResults === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search size={48} className="mb-3 text-black/20" />
                <p className="text-sm font-bold text-black/50">
                  {query.trim() ? `No results for "${query.trim()}"` : "No matching messages"}
                </p>
                <p className="mt-1 text-xs text-black/40">
                  {query.trim() ? "Try different keywords or a shorter phrase." : "Try a different filter set."}
                </p>
              </div>
            ) : (
              <>
                {entityResults.length > 0 && (
                  <div className="mb-3">
                    <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
                      Channels & DMs
                    </div>
                    <div className="flex flex-col gap-2">
                      {entityResults.map((result) => (
                        <button
                          key={result.key}
                          type="button"
                          onClick={() => { void openEntityResult(result); }}
                          className={`w-full border-2 bg-white p-3 text-left transition-colors ${
                            selectedResultKey === result.key
                              ? "border-black shadow-brutal-sm"
                              : "border-black/30 hover:border-black hover:shadow-brutal-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative flex shrink-0">
                              {result.type === "channel" ? (
                                <div className="flex size-8 items-center justify-center overflow-hidden border-2 border-black bg-brutal-yellow">
                                  <Hash size={14} />
                                </div>
                              ) : result.type === "agentDm" ? (
                                result.agentId ? (
                                  <AvatarSlot
                                    context="surface-list"
                                    type="agent"
                                    agentAvatarUrl={agents.find((entry) => entry.id === result.agentId)?.avatarUrl ?? null}
                                  />
                                ) : (
                                  <AvatarSlot context="surface-list" type="agent" agentAvatarUrl={null} />
                                )
                              ) : result.userId ? (
                                (() => {
                                  const member = resolveUserMember(result.userId);
                                  return (
                                    <AvatarSlot
                                      context="surface-list"
                                      type="human"
                                      humanAvatarUrl={member?.avatarUrl}
                                      gravatarHash={member?.gravatarHash}
                                    />
                                  );
                                })()
                              ) : (
                                <AvatarSlot context="surface-list" type="human" humanPlaceholder />
                              )}
                              {result.type === "agentDm" && result.agentId ? (
                                <AgentActivityDot
                                  agentId={result.agentId}
                                  className="absolute -bottom-0.5 -right-0.5 size-2.5"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-bold text-black">{result.title}</span>
                                <span className="border border-black bg-white px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black/60">
                                  {result.type === "channel" ? "Channel" : "DM"}
                                </span>
                                {result.archivedAt && (
                                  <span className="border border-black bg-brutal-orange/30 px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black">
                                    Archived
                                  </span>
                                )}
                              </div>
                              <div className="truncate text-xs text-black/50">{result.subtitle}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  {((loading && !searchError) || groupedMessageResults.length > 0) && (
                    <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
                      Messages
                    </div>
                  )}
                  {showInitialSkeleton ? (
                    <SearchSkeleton />
                  ) : searchError && totalResults === 0 ? (
                    <div className="border-2 border-black bg-white p-4 shadow-brutal-sm">
                      <div className="mb-2 text-sm font-bold text-black">Search failed</div>
                      <div className="mb-3 text-xs text-black/60">
                        The last search request failed. Existing results are preserved when possible, but this query needs a retry.
                      </div>
                      <button
                        type="button"
                        onClick={retrySearch}
                        className="btn-brutal-sm bg-white px-3 py-1.5 text-xs"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <SearchResultsBoundary
                      resetKey={boundaryKey}
                      onRetry={retrySearch}
                    >
                      <div className="flex flex-col gap-2">
                        {groupedMessageResults.map((group) => {
                          if (group.kind === "message") {
                            return renderMessageHit(group.result);
                          }

                          const firstResult = group.results[0];
                          const sourceLabel = firstResult ? getSourceLabel(firstResult) : "#unknown";

                          return (
                            <div key={group.key} className="overflow-hidden border-2 border-black bg-white shadow-brutal-sm">
                              <div className="border-b-2 border-black bg-[#ffeefb] px-3 py-2">
                                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-black/70">
                                  <span className="inline-flex items-center gap-1 border border-black bg-white px-1.5 py-0.5">
                                    <MessageSquare size={11} />
                                    Thread
                                  </span>
                                  <span>{sourceLabel}</span>
                                  <span>{group.hitCount} hits</span>
                                  <span className="font-mono normal-case text-black/50">{formatSearchRelativeTime(group.latestCreatedAt)}</span>
                                </div>
                                <div className="text-sm font-bold text-black">{group.title}</div>
                              </div>
                              <div className="flex flex-col">
                                {group.results.map((result) => renderMessageHit(result, true))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </SearchResultsBoundary>
                  )}
                </div>

                {hasMore && (
                  <div className="flex justify-center py-4">
                    <button
                      type="button"
                      onClick={async () => {
                        if (loadingMore) return;
                        const params = buildMessageSearchParams(results.length);
                        if (!params) return;
                        setLoadingMore(true);
                        try {
                          const { data } = await api.get("/messages/search", { params });
                          const nextResults = Array.isArray(data.results) ? data.results as MessageSearchResult[] : [];
                          setResults((prev) => [...prev, ...nextResults]);
                          setHasMore(Boolean(data.hasMore));
                        } catch {
                          // Keep the current page visible; failing to load more should not reset the list.
                        } finally {
                          setLoadingMore(false);
                        }
                      }}
                      className="btn-brutal-sm bg-white px-4 py-1.5 text-xs"
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading…" : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
