import { useCallback, useState } from "react";
import { Languages } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";
import { MessageItemTranslationAction, MessageItemTranslationStatus } from "@botiverse/raft-ui";

import { Markdown } from "#/lib/markdown/markdown.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

const ORIGINAL_MESSAGE = "Keep this original message available for the team.";
const TRANSLATED_MESSAGE = "让团队保留这条原始消息。";

export function MessageTranslationTranslatedComposition() {
  const [showOriginal, setShowOriginal] = useState(false);

  const handleToggleOriginal = useCallback(() => setShowOriginal((current) => !current), []);

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
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:14 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <Markdown>{showOriginal ? ORIGINAL_MESSAGE : TRANSLATED_MESSAGE}</Markdown>
        </MessageItemBody>
        <MessageItemTranslationStatus>
          <Languages size={12} />
          <MessageItemTranslationAction
            title={showOriginal ? "Original shown. Show translation" : "Translated. Show original"}
            aria-label={showOriginal ? "Show translation" : "Show original"}
            onClick={handleToggleOriginal}
          >
            {showOriginal ? "Show translation" : "Show original"}
          </MessageItemTranslationAction>
        </MessageItemTranslationStatus>
      </MessageItemContent>
    </MessageItem>
  );
}
