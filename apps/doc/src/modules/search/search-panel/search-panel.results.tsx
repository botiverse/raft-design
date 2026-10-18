import { useCallback, useState } from "react";
import {
  Button,
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchResultsSummary,
  SearchShellViewport,
} from "@botiverse/raft-ui";

import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchMessageFixture,
  SearchSenderFixture,
} from "../search.fixtures.ts";
import {
  EntityResult,
  MessageResult,
  SearchEmpty,
  SearchError,
  SearchSkeleton,
  ThreadResult,
} from "./search-panel.parts.tsx";

type MessageGroup =
  | { kind: "message"; message: SearchMessageFixture }
  | { kind: "thread"; key: string; title: string; messages: SearchMessageFixture[] };

function groupMessages(messages: readonly SearchMessageFixture[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  const threads = new Map<string, Extract<MessageGroup, { kind: "thread" }>>();
  for (const message of messages) {
    if (!message.threadId || !message.parentMessageId) {
      groups.push({ kind: "message", message });
      continue;
    }
    const existing = threads.get(message.threadId);
    if (existing) {
      existing.messages.push(message);
      continue;
    }
    const group: Extract<MessageGroup, { kind: "thread" }> = {
      kind: "thread",
      key: message.threadId,
      title: truncateThreadTitle(message.parentMessageContent ?? ""),
      messages: [message],
    };
    threads.set(group.key, group);
    groups.push(group);
  }
  return groups;
}

function truncateThreadTitle(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact;
}

export function SearchResults({
  entities,
  messages,
  messageCount,
  senders,
  channels,
  query,
  selectedKey,
  hasIntent,
  hasActiveFilters,
  view,
  setResultRef,
  onOpenEntity,
  onOpenMessage,
  onLoadMore,
}: {
  entities: readonly SearchEntityFixture[];
  messages: readonly SearchMessageFixture[];
  messageCount: number;
  senders: readonly SearchSenderFixture[];
  channels: readonly SearchChannelFixture[];
  query: string;
  selectedKey: string | null;
  hasIntent: boolean;
  hasActiveFilters: boolean;
  view: "ready" | "loading" | "error";
  setResultRef: (key: string, element: HTMLButtonElement | null) => void;
  onOpenEntity: (entity: SearchEntityFixture) => void;
  onOpenMessage: (message: SearchMessageFixture) => void;
  onLoadMore: () => void;
}) {
  const [recovered, setRecovered] = useState(false);
  const groups = groupMessages(messages);
  const totalResults = entities.length + messageCount;
  const showError = view === "error" && !recovered;

  const handleRetry = useCallback(() => setRecovered(true), []);
  const getSender = useCallback((id: string) => senders.find((item) => item.id === id), [senders]);
  const getChannel = useCallback(
    (id: string) => channels.find((item) => item.id === id),
    [channels],
  );

  return (
    <SearchShellViewport>
      {!hasIntent ? (
        <SearchEmpty />
      ) : (
        <>
          <SearchResultsSummary>
            {view === "loading" ? "Searching…" : `${totalResults} results`}
          </SearchResultsSummary>

          {view === "loading" ? (
            <SearchResultsSection>
              <SearchResultsSectionHeading>Messages</SearchResultsSectionHeading>
              <SearchSkeleton />
            </SearchResultsSection>
          ) : showError ? (
            <SearchError onRetry={handleRetry} />
          ) : totalResults === 0 ? (
            <SearchEmpty query={query.trim()} filtered={hasActiveFilters} />
          ) : (
            <>
              {entities.length > 0 ? (
                <SearchResultsSection>
                  <SearchResultsSectionHeading>Server entities</SearchResultsSectionHeading>
                  <SearchResultsList>
                    {entities.map((entity) => (
                      <EntityResult
                        key={entity.key}
                        entity={entity}
                        selected={selectedKey === entity.key}
                        setResultRef={setResultRef}
                        onOpen={onOpenEntity}
                      />
                    ))}
                  </SearchResultsList>
                </SearchResultsSection>
              ) : null}

              {groups.length > 0 ? (
                <SearchResultsSection className="mb-0">
                  <SearchResultsSectionHeading>Messages</SearchResultsSectionHeading>
                  <SearchResultsList>
                    {groups.map((group) =>
                      group.kind === "message" ? (
                        <MessageResult
                          key={group.message.id}
                          message={group.message}
                          sender={getSender(group.message.senderId)}
                          channel={getChannel(group.message.channelId)}
                          query={query}
                          selected={selectedKey === `message:${group.message.id}`}
                          setResultRef={setResultRef}
                          onOpen={onOpenMessage}
                        />
                      ) : (
                        <ThreadResult
                          key={group.key}
                          title={group.title}
                          messages={group.messages}
                          query={query}
                          selectedKey={selectedKey}
                          getSender={getSender}
                          getChannel={getChannel}
                          setResultRef={setResultRef}
                          onOpenMessage={onOpenMessage}
                        />
                      ),
                    )}
                  </SearchResultsList>
                </SearchResultsSection>
              ) : null}

              {messages.length < messageCount ? (
                <div className="flex justify-center py-4">
                  <Button type="button" variant="outline" size="xs" onClick={onLoadMore}>
                    Load More
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </SearchShellViewport>
  );
}
