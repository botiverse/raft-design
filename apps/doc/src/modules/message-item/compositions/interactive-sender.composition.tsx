import { useCallback, useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSenderButton,
  MessageItemTime,
} from "raft-ui";

export function MessageInteractiveSenderComposition() {
  const [action, setAction] = useState<"mention" | "profile" | null>(null);

  const handleOpenProfile = useCallback(() => setAction("profile"), []);
  const handleMention = useCallback(() => setAction("mention"), []);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageItem>
        <MessageItemAvatarSlot>
          <button
            type="button"
            aria-label="Open Atlas profile"
            className="block cursor-pointer border-0 bg-transparent p-0 transition-[filter,transform] duration-75 hover:brightness-90"
            onClick={handleOpenProfile}
          >
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
          </button>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderButton onClick={handleMention} title="Mention @Atlas">
              Atlas
            </MessageItemSenderButton>
            <MessageItemTime>2:20 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Please add the owner to the release review thread.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      {action ? (
        <p className="text-xs text-foreground-muted" role="status">
          {action === "mention" ? "Mentioned @Atlas." : "Opened Atlas profile."}
        </p>
      ) : null}
    </div>
  );
}
