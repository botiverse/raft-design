import { Link } from "@tanstack/react-router";
import {
  ArrowDownUp,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Lock,
  MessageSquare,
  MessageSquarePlus,
  PenOff,
  Pin,
  Search,
  SearchX,
  Users,
  X,
} from "lucide-react";
import { useDeferredValue, useState } from "react";
import {
  AvatarGroup,
  AvatarGroupCount,
  Badge,
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  BrutalOnly,
  Button,
  ConversationPanelBody,
  ConversationPanelContent,
  ConversationPanelRoot,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  PanelAction,
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeading,
  PanelMeta,
  PanelScrollContent,
  PanelScrollViewport,
  PanelStatus,
  PanelTitle,
  PickerTriggerButton,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "raft-ui";
import {
  FilterChip,
  TopicList,
  TopicListGroup,
  TopicListGroupLabel,
  TopicListItem,
  TopicListItemAside,
  TopicListItemAuthor,
  TopicListItemAvatar,
  TopicListItemContent,
  TopicListItemExcerpt,
  TopicListItemHeading,
  TopicListItemReplies,
  TopicListItemStats,
  TopicListItemTime,
  TopicListItemTitle,
  TopicListItemTrigger,
} from "raft-ui/wip";

import { Markdown } from "#/lib/markdown/markdown.tsx";

import {
  formatPlaygroundTopicAge,
  getPlaygroundActor,
  getPlaygroundTopicExcerpt,
} from "../mock/index.ts";
import type { PlaygroundTopicChannelRecord, PlaygroundTopic } from "../mock/index.ts";
import { PlaygroundTopicActorAvatar } from "./topic-actor-avatar.tsx";
import { getTopicChannelIcon } from "./topic-channel-icon.ts";
import { PlaygroundNewTopicComposer } from "./new-topic-composer.tsx";
import {
  groupTopics,
  isTopicUnread,
  matchesTopicFilters,
  matchesTopicSearch,
} from "./topic-queries.ts";
import type { TopicFilter, TopicSort } from "./topic-queries.ts";
import {
  usePlaygroundChannelTopics,
  usePlaygroundTopicState,
} from "./use-playground-topic-state.ts";

const SORT_OPTIONS = [
  { value: "activity", label: "Recent activity" },
  { value: "newest", label: "Newest" },
  { value: "replies", label: "Most replies" },
] as const satisfies readonly { value: TopicSort; label: string }[];

const FILTER_CHIPS = [
  { value: "unread", label: "Unread" },
  { value: "unanswered", label: "No replies" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "mine", label: "My topics" },
] as const satisfies readonly { value: TopicFilter; label: string }[];

/** Open and Resolved split the same set, so pressing one releases the other. */
const EXCLUSIVE_FILTERS: Partial<Record<TopicFilter, TopicFilter>> = {
  open: "resolved",
  resolved: "open",
};

const MAX_PARTICIPANT_AVATARS = 3;

export function PlaygroundTopicChannelPanel({
  activeTopicId,
  channel,
}: {
  activeTopicId?: string;
  channel: PlaygroundTopicChannelRecord;
}) {
  const [composing, setComposing] = useState<{ title: string } | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ReadonlySet<TopicFilter>>(() => new Set());
  const [sort, setSort] = useState<TopicSort>("activity");
  const deferredQuery = useDeferredValue(query);
  const { hiddenGuidelines, markChannelRead, setGuidelinesHidden } = usePlaygroundTopicState();
  const topics = usePlaygroundChannelTopics(channel.id);
  const canStartTopic = !channel.postingRestriction;
  const guidelinesOpen = Boolean(channel.guidelines) && !hiddenGuidelines.has(channel.id);
  const unreadCount = topics.filter(isTopicUnread).length;
  const searchedTopics = topics.filter((topic) => matchesTopicSearch(topic, deferredQuery));
  const visibleTopics = searchedTopics.filter((topic) => matchesTopicFilters(topic, filters));
  const groups = groupTopics(visibleTopics, sort);

  function startTopic() {
    if (!canStartTopic) return;
    setComposing({ title: query.trim() });
  }

  function toggleFilter(filter: TopicFilter, pressed: boolean) {
    setFilters((current) => {
      const next = new Set(current);
      if (pressed) {
        next.add(filter);
        const exclusive = EXCLUSIVE_FILTERS[filter];
        if (exclusive) next.delete(exclusive);
      } else {
        next.delete(filter);
      }
      return next;
    });
  }

  return (
    <ConversationPanelRoot edge="inset">
      <PlaygroundTopicChannelHeader
        channel={channel}
        topicCount={topics.length}
        unreadCount={unreadCount}
        onMarkAllRead={() => markChannelRead(channel.id)}
      />
      <ConversationPanelContent>
        <ConversationPanelBody>
          <PanelScrollViewport>
            <PanelScrollContent className="flex flex-col gap-4 p-3 md:p-4">
              {composing ? (
                <PlaygroundNewTopicComposer
                  channel={channel}
                  guidelinesOpen={guidelinesOpen}
                  initialTitle={composing.title}
                  onClose={() => {
                    setComposing(null);
                    setQuery("");
                  }}
                  onToggleGuidelines={
                    channel.guidelines
                      ? () => setGuidelinesHidden(channel.id, guidelinesOpen)
                      : undefined
                  }
                />
              ) : (
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="search"
                    aria-label={
                      canStartTopic
                        ? `Search or start a topic in #${channel.name}`
                        : `Search topics in #${channel.name}`
                    }
                    placeholder={canStartTopic ? "Search or start a topic…" : "Search topics…"}
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                      if (!query.trim()) return;
                      event.preventDefault();
                      startTopic();
                    }}
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      variant="accent"
                      size="sm"
                      disabled={!canStartTopic}
                      title={channel.postingRestriction}
                      onClick={startTopic}
                    >
                      <MessageSquarePlus aria-hidden />
                      <span className="max-sm:sr-only">New topic</span>
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              )}

              {guidelinesOpen && channel.guidelines ? (
                <Banner status="info" size="sm">
                  <ClipboardList />
                  <BannerTitle>Guidelines</BannerTitle>
                  <BannerDescription>
                    <Markdown>{channel.guidelines}</Markdown>
                  </BannerDescription>
                  <BannerAction>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Hide guidelines"
                      onClick={() => setGuidelinesHidden(channel.id, true)}
                    >
                      <X />
                    </Button>
                  </BannerAction>
                </Banner>
              ) : null}

              <PlaygroundTopicFilterBar
                filters={filters}
                showGuidelinesToggle={Boolean(channel.guidelines) && !guidelinesOpen}
                sort={sort}
                onFilterChange={toggleFilter}
                onShowGuidelines={() => setGuidelinesHidden(channel.id, false)}
                onSortChange={setSort}
              />

              {groups.length === 0 ? (
                <PlaygroundTopicEmptyState
                  channel={channel}
                  hasTopics={topics.length > 0}
                  hasQuery={canStartTopic && Boolean(query.trim())}
                  onClear={() => {
                    setQuery("");
                    setFilters(new Set());
                  }}
                />
              ) : (
                groups.map((group) => (
                  <TopicListGroup key={group.id}>
                    <TopicListGroupLabel id={`topic-group-${group.id}`}>
                      {group.label}
                    </TopicListGroupLabel>
                    <TopicList aria-labelledby={`topic-group-${group.id}`}>
                      {group.topics.map((topic) => (
                        <PlaygroundTopicRow
                          key={topic.id}
                          active={topic.id === activeTopicId}
                          channel={channel}
                          topic={topic}
                        />
                      ))}
                    </TopicList>
                  </TopicListGroup>
                ))
              )}
            </PanelScrollContent>
          </PanelScrollViewport>
        </ConversationPanelBody>
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}

function PlaygroundTopicChannelHeader({
  channel,
  topicCount,
  unreadCount,
  onMarkAllRead,
}: {
  channel: PlaygroundTopicChannelRecord;
  topicCount: number;
  unreadCount: number;
  onMarkAllRead: () => void;
}) {
  const ChannelIcon = getTopicChannelIcon(channel);

  return (
    <PanelHeader>
      <Button
        render={<Link to="/playground/topics" search={{}} />}
        nativeButton={false}
        variant="outline"
        size="icon-sm"
        className="mr-1 max-md:self-center md:hidden"
        aria-label="Back to topic channels"
      >
        <ChevronLeft aria-hidden />
      </Button>
      <PanelHeaderIcon>
        <ChannelIcon className="size-3.5 in-data-[theme=elegant]:stroke-[2.5]" />
      </PanelHeaderIcon>
      <PanelHeaderContent>
        <PanelHeading>
          <PanelTitle>{channel.name}</PanelTitle>
          {channel.access?.kind === "private" ? (
            <PanelStatus title="Private channel. Only invited members can see these topics.">
              <Lock />
              <BrutalOnly>Private</BrutalOnly>
            </PanelStatus>
          ) : null}
          {channel.access?.kind === "shared" ? (
            <PanelStatus
              title={`Shared with ${channel.access.partner}. Everyone there can read and reply.`}
            >
              <Users />
              <BrutalOnly>Shared</BrutalOnly>
            </PanelStatus>
          ) : null}
          {channel.postingRestriction ? (
            <PanelStatus title={channel.postingRestriction}>
              <PenOff />
              <BrutalOnly>Read-only</BrutalOnly>
            </PanelStatus>
          ) : null}
        </PanelHeading>
        <PanelMeta>
          {`${topicCount} ${topicCount === 1 ? "topic" : "topics"} · ${channel.description}`}
        </PanelMeta>
      </PanelHeaderContent>
      <PanelActions>
        <PanelAction
          aria-label={`Mark all topics in #${channel.name} as read`}
          disabled={unreadCount === 0}
          onClick={onMarkAllRead}
        >
          <CheckCheck />
        </PanelAction>
      </PanelActions>
    </PanelHeader>
  );
}

function PlaygroundTopicEmptyState({
  channel,
  hasQuery,
  hasTopics,
  onClear,
}: {
  channel: PlaygroundTopicChannelRecord;
  hasQuery: boolean;
  hasTopics: boolean;
  onClear: () => void;
}) {
  const ChannelIcon = getTopicChannelIcon(channel);

  return (
    <EmptyState className="py-10">
      <EmptyStateContent>
        <EmptyStateIcon>{hasTopics ? <SearchX /> : <ChannelIcon />}</EmptyStateIcon>
        <EmptyStateTitle>{hasTopics ? "No matching topics" : "No topics yet"}</EmptyStateTitle>
        <EmptyStateDescription>
          {hasTopics
            ? hasQuery
              ? "Press Enter to start a topic with this title."
              : "Try another search or filter."
            : `Start the first discussion in #${channel.name}.`}
        </EmptyStateDescription>
        {hasTopics ? (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear search and filters
          </Button>
        ) : null}
      </EmptyStateContent>
    </EmptyState>
  );
}

function PlaygroundTopicFilterBar({
  filters,
  showGuidelinesToggle,
  sort,
  onFilterChange,
  onShowGuidelines,
  onSortChange,
}: {
  filters: ReadonlySet<TopicFilter>;
  showGuidelinesToggle: boolean;
  sort: TopicSort;
  onFilterChange: (filter: TopicFilter, pressed: boolean) => void;
  onShowGuidelines: () => void;
  onSortChange: (sort: TopicSort) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Select
        value={sort}
        items={SORT_OPTIONS}
        modal={false}
        onValueChange={(value) => {
          if (value) onSortChange(value);
        }}
      >
        <SelectTrigger render={<PickerTriggerButton />} aria-label="Sort topics">
          <ArrowDownUp aria-hidden className="size-3.5" />
          <SelectValue />
          <SelectIcon>
            <ChevronDown aria-hidden className="size-3" />
          </SelectIcon>
        </SelectTrigger>
        <SelectContent align="start" className="w-44">
          <SelectList>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
      <div
        role="group"
        aria-label="Filter topics"
        className="-my-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1"
      >
        {FILTER_CHIPS.map((chip) => (
          <FilterChip
            key={chip.value}
            pressed={filters.has(chip.value)}
            onPressedChange={(pressed) => onFilterChange(chip.value, pressed)}
          >
            {chip.label}
          </FilterChip>
        ))}
      </div>
      {showGuidelinesToggle ? (
        <Button variant="ghost" size="sm" onClick={onShowGuidelines}>
          <ClipboardList aria-hidden />
          Guidelines
        </Button>
      ) : null}
    </div>
  );
}

function PlaygroundTopicRow({
  active,
  channel,
  topic,
}: {
  active: boolean;
  channel: PlaygroundTopicChannelRecord;
  topic: PlaygroundTopic;
}) {
  const author = getPlaygroundActor(topic.opening.senderId);
  const replyCount = topic.replies.length;
  const participantIds = [
    ...new Set(topic.replies.map((reply) => reply.senderId).filter((id) => id !== author.id)),
  ];
  const unread = isTopicUnread(topic);
  const description = [
    topic.pinned ? "Pinned topic" : "Topic",
    topic.title,
    topic.resolved ? "resolved" : undefined,
    topic.unread
      ? "new"
      : topic.unreadReplyCount
        ? `${topic.unreadReplyCount} new replies`
        : undefined,
    replyCount === 1 ? "1 reply" : `${replyCount} replies`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <TopicListItem unread={unread}>
      <TopicListItemTrigger
        aria-label={description}
        aria-current={active ? "page" : undefined}
        render={
          <Link
            to="/playground/topics/$channelId"
            params={{ channelId: channel.id }}
            search={{ topic: topic.id }}
          />
        }
      />
      <TopicListItemAvatar>
        <PlaygroundTopicActorAvatar actorId={topic.opening.senderId} size="sm" />
      </TopicListItemAvatar>
      <TopicListItemContent>
        <TopicListItemHeading>
          <TopicListItemTitle>
            {topic.pinned ? <Pin aria-hidden /> : null}
            {topic.title}
          </TopicListItemTitle>
          {topic.resolved ? (
            <Badge variant="success" appearance="soft">
              <CheckCircle2 aria-hidden />
              Resolved
            </Badge>
          ) : null}
          {topic.unread ? <Badge variant="information">New</Badge> : null}
        </TopicListItemHeading>
        <TopicListItemExcerpt>
          <TopicListItemAuthor>{author.name}</TopicListItemAuthor>
          {` · ${getPlaygroundTopicExcerpt(topic.opening.content)}`}
        </TopicListItemExcerpt>
      </TopicListItemContent>
      <TopicListItemAside>
        <TopicListItemTime dateTime={topic.lastActivityDateTime}>
          {formatPlaygroundTopicAge(topic.lastActivityDateTime)}
        </TopicListItemTime>
        <TopicListItemStats>
          {participantIds.length ? (
            <AvatarGroup>
              {participantIds.slice(0, MAX_PARTICIPANT_AVATARS).map((actorId) => (
                <PlaygroundTopicActorAvatar key={actorId} actorId={actorId} size="xs" />
              ))}
              {participantIds.length > MAX_PARTICIPANT_AVATARS ? (
                <AvatarGroupCount size="xs">
                  +{participantIds.length - MAX_PARTICIPANT_AVATARS}
                </AvatarGroupCount>
              ) : null}
            </AvatarGroup>
          ) : null}
          {!topic.unread && topic.unreadReplyCount ? (
            <Badge variant="information">{topic.unreadReplyCount} new</Badge>
          ) : null}
          <TopicListItemReplies>
            <MessageSquare aria-hidden />
            {replyCount}
          </TopicListItemReplies>
        </TopicListItemStats>
      </TopicListItemAside>
    </TopicListItem>
  );
}
