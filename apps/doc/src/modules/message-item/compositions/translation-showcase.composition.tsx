import { useState, type ReactNode } from "react";
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

function TranslationRow({ children, status }: { children: ReactNode; status: ReactNode }) {
  return (
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
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>2:14 PM</MessageItemTime>
        </MessageItemHeader>
        {children}
        {status}
      </MessageItemContent>
    </MessageItem>
  );
}

function TranslatedMessage() {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <TranslationRow
      status={
        <MessageItemTranslationStatus>
          <Languages size={12} />
          <MessageItemTranslationAction
            title={showOriginal ? "Original shown. Show translation" : "Translated. Show original"}
            aria-label={showOriginal ? "Show translation" : "Show original"}
            onClick={() => setShowOriginal((current) => !current)}
          >
            {showOriginal ? "Show translation" : "Show original"}
          </MessageItemTranslationAction>
        </MessageItemTranslationStatus>
      }
    >
      <MessageItemBody>
        <MessageMarkdown>
          <p>{showOriginal ? ORIGINAL_MESSAGE : TRANSLATED_MESSAGE}</p>
        </MessageMarkdown>
      </MessageItemBody>
    </TranslationRow>
  );
}

function BilingualMessage() {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <TranslationRow
      status={
        <MessageItemTranslationStatus>
          <Languages size={12} />
          <MessageItemTranslationAction
            title={showOriginal ? "Original shown. Show translation" : "Translated. Show original"}
            aria-label={showOriginal ? "Show translation" : "Show original"}
            onClick={() => setShowOriginal((current) => !current)}
          >
            {showOriginal ? "Show translation" : "Show original"}
          </MessageItemTranslationAction>
        </MessageItemTranslationStatus>
      }
    >
      <MessageItemBody>
        <MessageMarkdown>
          <p>{showOriginal ? ORIGINAL_MESSAGE : TRANSLATED_MESSAGE}</p>
        </MessageMarkdown>
      </MessageItemBody>
      {!showOriginal ? (
        <MessageItemTranslationOriginal>
          <MessageItemTranslationOriginalLabel>Original</MessageItemTranslationOriginalLabel>
          <MessageMarkdown>
            <p>{ORIGINAL_MESSAGE}</p>
          </MessageMarkdown>
        </MessageItemTranslationOriginal>
      ) : null}
    </TranslationRow>
  );
}

function FailedTranslationMessage() {
  const [retrying, setRetrying] = useState(false);

  return (
    <TranslationRow
      status={
        retrying ? (
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
        )
      }
    >
      <MessageItemBody>
        <MessageMarkdown>
          <p>{ORIGINAL_MESSAGE}</p>
        </MessageMarkdown>
      </MessageItemBody>
    </TranslationRow>
  );
}

/**
 * Caller-owned translation compositions from the source message row. The UI
 * package owns only the structural parts; copy, state, and retry behavior stay
 * with the consumer.
 */
export function MessageTranslationShowcaseComposition() {
  return (
    <div className="flex max-w-3xl flex-col">
      <TranslationRow
        status={
          <MessageItemTranslationStatus tone="pending">
            <Languages size={12} />
            <span>Translating…</span>
          </MessageItemTranslationStatus>
        }
      >
        <MessageItemBody>
          <MessageItemTranslationPlaceholder />
        </MessageItemBody>
      </TranslationRow>
      <TranslatedMessage />
      <BilingualMessage />
      <FailedTranslationMessage />
    </div>
  );
}
