import { Link } from "@tanstack/react-router";
import { Bookmark, CheckCircle2, ChevronLeft, ExternalLink, Send, X } from "lucide-react";
import { Fragment, useState } from "react";
import {
  Button,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  MessageItem,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSavedIndicator,
  MessageItemSender,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageList,
  MessageListDateDivider,
  MessageListNotice,
  PanelAction,
  PanelToggleAction,
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
  ThreadPanelFooter,
  ThreadPanelHeader,
  ThreadPanelOriginalMessage,
  ThreadPanelReplyCount,
  ThreadPanelReplySummary,
  ThreadPanelRoot,
  ThreadPanelTitle,
  ThreadPanelTitleMeta,
} from "raft-ui";

import {
  Composer,
  ComposerInput,
  ComposerToolbar,
} from "#/modules/chat-composer/composer-responsive.tsx";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import { PlaygroundMessageAvatar } from "../message/playground-message-avatar.tsx";
import { usePlaygroundSavedMessages } from "../message/use-playground-message-workflow.ts";
import { getPlaygroundActor } from "../mock/index.ts";
import type {
  PlaygroundChatMessage,
  PlaygroundTopicChannelRecord,
  PlaygroundTopic,
} from "../mock/index.ts";
import { usePlaygroundTopicState } from "./use-playground-topic-state.ts";

export function PlaygroundTopicPanel({
  channel,
  onClose,
  topic,
}: {
  channel: PlaygroundTopicChannelRecord;
  /** Set when the panel is hosted outside Topics, e.g. in Activity. */
  onClose?: () => void;
  topic: PlaygroundTopic;
}) {
  const { addReply, setResolved } = usePlaygroundTopicState();
  const [draft, setDraft] = useState("");
  // Captured on open: the shell marks the topic read right after mount.
  const [firstUnreadReplyIndex] = useState(() =>
    topic.unread || topic.unreadReplyCount === 0
      ? undefined
      : topic.replies.length - topic.unreadReplyCount,
  );
  const channelLink = (
    <Link to="/playground/topics/$channelId" params={{ channelId: channel.id }} search={{}} />
  );

  return (
    <ThreadPanelRoot>
      <ThreadPanelHeader>
        <Button
          className="mr-1 lg:hidden"
          variant="outline"
          size="icon-sm"
          nativeButton={onClose ? undefined : false}
          aria-label={onClose ? "Back" : `Back to #${channel.name}`}
          render={onClose ? undefined : channelLink}
          onClick={onClose}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <ThreadPanelTitle>
          {topic.title}
          <ThreadPanelTitleMeta>{` — #${channel.name}`}</ThreadPanelTitleMeta>
        </ThreadPanelTitle>
        <ThreadPanelActions>
          <PanelToggleAction
            pressed={Boolean(topic.resolved)}
            onPressedChange={(pressed) => setResolved(topic.id, pressed)}
            aria-label="Mark topic as resolved"
          >
            <CheckCircle2 />
            <span className="hidden whitespace-nowrap font-medium leading-none md:inline">
              Resolved
            </span>
          </PanelToggleAction>
          {onClose ? (
            <PanelAction
              nativeButton={false}
              aria-label="View in Topics"
              render={
                <Link
                  to="/playground/topics/$channelId"
                  params={{ channelId: channel.id }}
                  search={{ topic: topic.id }}
                />
              }
            >
              <ExternalLink />
              <span className="hidden whitespace-nowrap font-medium leading-none md:inline">
                View in Topics
              </span>
            </PanelAction>
          ) : null}
          <PanelAction
            className="max-lg:hidden"
            nativeButton={onClose ? undefined : false}
            aria-label="Close topic"
            render={onClose ? undefined : channelLink}
            onClick={onClose}
          >
            <X />
          </PanelAction>
        </ThreadPanelActions>
      </ThreadPanelHeader>
      <ThreadPanelContent>
        <ThreadPanelOriginalMessage>
          <PlaygroundTopicMessage message={topic.opening} topicId={topic.id} />
        </ThreadPanelOriginalMessage>
        <ThreadPanelBody>
          <MessageList>
            <ThreadPanelReplySummary>
              <MessageListNotice>
                {topic.replies.length ? "Beginning of replies" : "No replies yet"}
              </MessageListNotice>
              <ThreadPanelReplyCount>
                {topic.replies.length === 1 ? "1 reply" : `${topic.replies.length} replies`}
              </ThreadPanelReplyCount>
            </ThreadPanelReplySummary>
            {topic.replies.map((reply, index) => (
              <Fragment key={reply.id}>
                {index === firstUnreadReplyIndex ? (
                  <MessageListDateDivider>New replies</MessageListDateDivider>
                ) : null}
                <PlaygroundTopicMessage message={reply} topicId={topic.id} />
              </Fragment>
            ))}
            <div className="h-6" aria-hidden />
          </MessageList>
        </ThreadPanelBody>
        <ThreadPanelFooter>
          <ComposerRoot
            onSubmit={(event) => {
              event.preventDefault();
              const content = draft.trim();
              if (!content) return;
              addReply(topic.id, content);
              setDraft("");
            }}
          >
            <Composer>
              <ComposerInput
                aria-label="Reply to topic"
                placeholder="Reply to topic"
                value={draft}
                onChange={(event) => setDraft(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
                    return;
                  }
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }}
              />
              <ComposerToolbar>
                <ComposerMeta>
                  <ComposerSubmit aria-label="Send reply" disabled={!draft.trim()}>
                    <span>Send</span>
                    <Send />
                  </ComposerSubmit>
                </ComposerMeta>
              </ComposerToolbar>
            </Composer>
          </ComposerRoot>
        </ThreadPanelFooter>
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );
}

function PlaygroundTopicMessage({
  message,
  topicId,
}: {
  message: PlaygroundChatMessage;
  topicId: string;
}) {
  const sender = getPlaygroundActor(message.senderId);
  const { savedMessagesById, setTopicMessageSaved } = usePlaygroundSavedMessages();
  const saved = savedMessagesById.has(message.id);

  return (
    <MessageItem>
      <PlaygroundMessageAvatar actorId={message.senderId} />
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>{sender.name}</MessageItemSender>
          <MessageItemTime
            render={
              message.createdAtDateTime ? <time dateTime={message.createdAtDateTime} /> : undefined
            }
          >
            {message.createdAt}
          </MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <Markdown>{message.content}</Markdown>
        </MessageItemBody>
        {saved ? (
          <MessageItemFooter>
            <MessageItemSavedIndicator
              aria-label="Remove from Saved"
              render={
                <button
                  type="button"
                  onClick={() => setTopicMessageSaved(message, topicId, false)}
                />
              }
            >
              <Bookmark fill="currentColor" />
              <span>Saved</span>
            </MessageItemSavedIndicator>
          </MessageItemFooter>
        ) : null}
      </MessageItemContent>
      <MessageItemToolbar>
        <MessageItemToolbarButton
          active={saved}
          aria-label={saved ? "Remove from Saved" : "Save message"}
          aria-pressed={saved}
          onClick={() => setTopicMessageSaved(message, topicId, !saved)}
        >
          <Bookmark fill={saved ? "currentColor" : "none"} />
        </MessageItemToolbarButton>
      </MessageItemToolbar>
    </MessageItem>
  );
}
