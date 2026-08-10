import { Link } from "@tanstack/react-router";
import { Bookmark, ChevronLeft, MessageSquare, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ConversationPanelContent,
  ConversationPanelRoot,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InboxItem,
  InboxItemActions,
  InboxItemContent,
  InboxItemContext,
  InboxItemMessage,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTrailing,
  InboxItemTrigger,
  PanelHeader,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeading,
  PanelMeta,
  PanelToggleAction,
  PanelTitle,
} from "raft-ui";

import {
  getPlaygroundActor,
  getPlaygroundMessageContext,
  PLAYGROUND_SERVER_SLUG,
} from "../mock/index.ts";
import type { PlaygroundSavedMessageState } from "../message/playground-message-workflow-context.ts";
import { usePlaygroundSavedMessages } from "../message/use-playground-message-workflow.ts";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";

export function PlaygroundSavedPanel() {
  const { savedMessagesById } = usePlaygroundSavedMessages();
  const savedMessages = [...savedMessagesById.values()].sort(
    (left, right) => Date.parse(right.savedAtDateTime) - Date.parse(left.savedAtDateTime),
  );
  const countLabel = `${savedMessages.length} saved ${savedMessages.length === 1 ? "message" : "messages"}`;

  return (
    <ConversationPanelRoot>
      <PanelHeader>
        <Button
          variant="outline"
          size="icon-sm"
          className="md:hidden"
          aria-label="Back to Chat"
          render={
            <Link
              to="/playground/s/$serverSlug"
              params={{ serverSlug: PLAYGROUND_SERVER_SLUG }}
              search={{}}
            />
          }
        >
          <ChevronLeft aria-hidden />
        </Button>
        <PanelHeaderIcon className="max-md:hidden in-data-[theme=elegant]:dark:bg-layer-card">
          <Bookmark
            aria-hidden
            className="size-4.5 in-data-[theme=elegant]:size-3.5 in-data-[theme=elegant]:stroke-[2.5]"
          />
        </PanelHeaderIcon>
        <PanelHeaderContent className="max-md:col-start-2 max-md:col-span-2">
          <PanelHeading>
            <PanelTitle render={<h2 aria-label="Saved" />}>Saved</PanelTitle>
          </PanelHeading>
          <PanelMeta render={<p />}>{countLabel}</PanelMeta>
        </PanelHeaderContent>
      </PanelHeader>

      <ConversationPanelContent>
        <div className="flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          {savedMessages.length ? (
            <div className="flex flex-col gap-2 in-data-[theme=elegant]:gap-2.5 in-data-[theme=elegant]:rounded-[10px] in-data-[theme=elegant]:bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] in-data-[theme=elegant]:p-3 in-data-[theme=elegant]:shadow-raft-xs in-data-[theme=elegant]:dark:bg-layer-card">
              {savedMessages.map((savedMessage) => (
                <PlaygroundSavedItem key={savedMessage.message.id} savedMessage={savedMessage} />
              ))}
            </div>
          ) : (
            <EmptyState className="min-h-full">
              <EmptyStateContent>
                <EmptyStateIcon>
                  <Bookmark />
                </EmptyStateIcon>
                <EmptyStateTitle>No saved messages</EmptyStateTitle>
                <EmptyStateDescription>
                  Messages you save in this Playground will appear here.
                </EmptyStateDescription>
              </EmptyStateContent>
            </EmptyState>
          )}
        </div>
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}

function PlaygroundSavedItem({ savedMessage }: { savedMessage: PlaygroundSavedMessageState }) {
  const { setMessageSaved } = usePlaygroundSavedMessages();
  const { message, surface, threadId } = savedMessage;
  const context = getPlaygroundMessageContext(message.id);
  if (!context) return null;

  const { channel } = context;
  const actor = getPlaygroundActor(message.senderId);
  const channelLabel = channel.kind === "dm" ? `@${actor.name}` : `#${channel.name}`;

  function removeSavedMessage() {
    setMessageSaved(message, false, surface, threadId);
  }

  return (
    <InboxItem>
      <InboxItemTrigger
        aria-label={`Open saved message from ${actor.name}`}
        render={
          <PlaygroundConversationLink
            conversation={channel}
            search={threadId ? { thread: threadId } : {}}
            hash={`${threadId ? "thread-message" : "message"}-${message.id}`}
          />
        }
      />
      <InboxItemContent>
        <InboxItemContext>
          <span className="min-w-0 truncate">{channelLabel}</span>
          {threadId ? (
            <span className="inline-flex shrink-0 items-center gap-1">
              <MessageSquare className="size-2.5" aria-hidden />
              Thread
            </span>
          ) : null}
          <InboxItemSender className="inline-flex min-w-0 items-center gap-1">
            <Avatar size="3xs" type={actor.type}>
              {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
              <AvatarFallback>
                {actor.type === "human" ? (
                  <User aria-hidden />
                ) : (
                  <span className="text-[8px] font-bold in-data-[theme=elegant]:text-[10px] in-data-[theme=elegant]:font-medium">
                    {actor.fallback ?? actor.name.slice(0, 2)}
                  </span>
                )}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{actor.name}</span>
          </InboxItemSender>
        </InboxItemContext>
        <InboxItemMessage>{message.content}</InboxItemMessage>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>
          {formatSavedRelativeTime(message.createdAtDateTime)}
        </InboxItemTimestamp>
        <InboxItemActions>
          <PanelToggleAction
            pressed
            onPressedChange={removeSavedMessage}
            onClick={(event) => event.stopPropagation()}
            title="Remove from Saved"
            aria-label="Remove from Saved"
          >
            <Bookmark fill="currentColor" aria-hidden />
          </PanelToggleAction>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>
  );
}

const SAVED_RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatSavedRelativeTime(value: string | undefined) {
  if (!value) return "";
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";
  const diffMs = time - Date.now();
  const absoluteMs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absoluteMs < hour) {
    return SAVED_RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / minute), "minute");
  }
  if (absoluteMs < day) {
    return SAVED_RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / hour), "hour");
  }
  return SAVED_RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / day), "day");
}
