import { useState } from "react";
import { AlertTriangle, Languages, RotateCcw } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Progress,
  ProgressIndicator,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";
import {
  MessageItemTranslationFailedStatus,
  MessageItemTranslationProgressTrack,
  MessageItemTranslationRetryAction,
  MessageItemTranslationStatus,
} from "raft-ui/wip";

import { Markdown } from "#/lib/markdown/markdown.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

const ORIGINAL_MESSAGE = "Keep this original message available for the team.";

export function MessageTranslationStatesComposition() {
  const [retrying, setRetrying] = useState(false);

  return (
    <div className="flex flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemMeta>owner</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <Progress
              value={null}
              size="sm"
              aria-label="Translating message"
              className="w-44 max-w-full"
            >
              <MessageItemTranslationProgressTrack>
                <ProgressIndicator />
              </MessageItemTranslationProgressTrack>
            </Progress>
          </MessageItemBody>
          <MessageItemTranslationStatus>
            <Languages size={12} />
            <span>Translating…</span>
          </MessageItemTranslationStatus>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemMeta>owner</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <Markdown>{ORIGINAL_MESSAGE}</Markdown>
          </MessageItemBody>
          {retrying ? (
            <MessageItemTranslationStatus aria-live="polite">
              <Languages size={12} />
              <span>Translating…</span>
            </MessageItemTranslationStatus>
          ) : (
            <MessageItemTranslationFailedStatus aria-live="polite">
              <AlertTriangle size={12} />
              <span>Translation unavailable</span>
              <span aria-hidden>·</span>
              <MessageItemTranslationRetryAction
                title="Translation unavailable"
                aria-label="Retry"
                onClick={() => setRetrying(true)}
              >
                <RotateCcw size={12} aria-hidden />
                Retry
              </MessageItemTranslationRetryAction>
            </MessageItemTranslationFailedStatus>
          )}
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
