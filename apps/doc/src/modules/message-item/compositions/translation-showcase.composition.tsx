import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import { AlertTriangle, Languages } from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
  MessageItemTranslationAction,
  MessageItemTranslationOriginal,
  MessageItemTranslationOriginalLabel,
  MessageItemTranslationPlaceholder,
  MessageItemTranslationStatus,
  MessageMarkdown,
} from "raft-ui/wip";

const ORIGINAL_MESSAGE = "Keep this original message available for the team.";
const TRANSLATED_MESSAGE = "让团队保留这条原始消息。";

/**
 * Caller-owned translation compositions from the source message row. The UI
 * package owns only the structural parts; copy, state, and retry behavior stay
 * with the consumer.
 */
export function MessageTranslationShowcaseComposition() {
  const [showTranslatedOriginal, setShowTranslatedOriginal] = useState(false);
  const [showBilingualOriginal, setShowBilingualOriginal] = useState(false);
  const [retrying, setRetrying] = useState(false);

  return (
    <div className="flex max-w-3xl flex-col">
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
            <MessageItemTranslationPlaceholder />
          </MessageItemBody>
          <MessageItemTranslationStatus tone="pending">
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
            <MessageMarkdown>
              <p>{showTranslatedOriginal ? ORIGINAL_MESSAGE : TRANSLATED_MESSAGE}</p>
            </MessageMarkdown>
          </MessageItemBody>
          <MessageItemTranslationStatus>
            <Languages size={12} />
            <MessageItemTranslationAction
              title={
                showTranslatedOriginal
                  ? "Original shown. Show translation"
                  : "Translated. Show original"
              }
              aria-label={showTranslatedOriginal ? "Show translation" : "Show original"}
              onClick={() => setShowTranslatedOriginal((current) => !current)}
            >
              {showTranslatedOriginal ? "Show translation" : "Show original"}
            </MessageItemTranslationAction>
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
            <MessageMarkdown>
              <p>{showBilingualOriginal ? ORIGINAL_MESSAGE : TRANSLATED_MESSAGE}</p>
            </MessageMarkdown>
          </MessageItemBody>
          {!showBilingualOriginal ? (
            <MessageItemTranslationOriginal>
              <MessageItemTranslationOriginalLabel>Original</MessageItemTranslationOriginalLabel>
              <MessageMarkdown>
                <p>{ORIGINAL_MESSAGE}</p>
              </MessageMarkdown>
            </MessageItemTranslationOriginal>
          ) : null}
          <MessageItemTranslationStatus>
            <Languages size={12} />
            <MessageItemTranslationAction
              title={
                showBilingualOriginal
                  ? "Original shown. Show translation"
                  : "Translated. Show original"
              }
              aria-label={showBilingualOriginal ? "Show translation" : "Show original"}
              onClick={() => setShowBilingualOriginal((current) => !current)}
            >
              {showBilingualOriginal ? "Show translation" : "Show original"}
            </MessageItemTranslationAction>
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
            <MessageMarkdown>
              <p>{ORIGINAL_MESSAGE}</p>
            </MessageMarkdown>
          </MessageItemBody>
          {retrying ? (
            <MessageItemTranslationStatus tone="pending">
              <Languages size={12} />
              <span>Translating…</span>
            </MessageItemTranslationStatus>
          ) : (
            <MessageItemTranslationStatus tone="failed">
              <AlertTriangle size={12} />
              <span>Translation unavailable</span>
              <span aria-hidden>·</span>
              <MessageItemTranslationAction
                tone="failed"
                title="Translation unavailable"
                aria-label="Retry"
                onClick={() => setRetrying(true)}
              >
                Retry
              </MessageItemTranslationAction>
            </MessageItemTranslationStatus>
          )}
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
