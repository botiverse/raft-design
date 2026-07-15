import { useState } from "react";

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

export function BrutalSearchResults({
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

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white">
      {!hasIntent ? (
        <SearchEmpty />
      ) : (
        <div className="p-4">
          <div className="mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-black/60">
              {view === "loading" ? "Searching…" : `${totalResults} results`}
            </span>
          </div>

          {view === "loading" ? (
            <>
              <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
                Messages
              </div>
              <SearchSkeleton />
            </>
          ) : showError ? (
            <SearchError onRetry={() => setRecovered(true)} />
          ) : totalResults === 0 ? (
            <SearchEmpty query={query.trim()} filtered={hasActiveFilters} />
          ) : (
            <>
              {entities.length > 0 ? (
                <div className="mb-3">
                  <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
                    Server entities
                  </div>
                  <div className="flex flex-col gap-2">
                    {entities.map((entity) => {
                      const key = entity.key;
                      return (
                        <EntityResult
                          key={key}
                          entity={entity}
                          selected={selectedKey === key}
                          buttonRef={(element) => setResultRef(key, element)}
                          onOpen={() => onOpenEntity(entity)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {groups.length > 0 ? (
                <div>
                  <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
                    Messages
                  </div>
                  <div className="flex flex-col gap-2">
                    {groups.map((group) =>
                      group.kind === "message" ? (
                        <MessageResult
                          key={group.message.id}
                          message={group.message}
                          sender={senders.find((item) => item.id === group.message.senderId)}
                          channel={channels.find((item) => item.id === group.message.channelId)}
                          query={query}
                          selected={selectedKey === `message:${group.message.id}`}
                          buttonRef={(element) =>
                            setResultRef(`message:${group.message.id}`, element)
                          }
                          onOpen={() => onOpenMessage(group.message)}
                        />
                      ) : (
                        <ThreadResult
                          key={group.key}
                          title={group.title}
                          messages={group.messages}
                          query={query}
                          selectedKey={selectedKey}
                          getSender={(id) => senders.find((item) => item.id === id)}
                          getChannel={(id) => channels.find((item) => item.id === id)}
                          setResultRef={setResultRef}
                          onOpenMessage={onOpenMessage}
                        />
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              {messages.length < messageCount ? (
                <div className="flex justify-center py-4">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="btn-brutal-sm bg-white px-4 py-1.5 text-xs"
                  >
                    Load More
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
