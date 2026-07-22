import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageInteractiveSenderComposition() {
  const [pressed, setPressed] = useState(false);
  const [mentioned, setMentioned] = useState(false);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageItem>
        <MessageItemAvatarSlot
          pressed={pressed}
          render={
            <button
              type="button"
              aria-label="Atlas avatar"
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              onPointerCancel={() => setPressed(false)}
            />
          }
        >
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender
              interactive
              render={<button type="button" onClick={() => setMentioned(true)} />}
              title="Mention @Atlas"
            >
              Atlas
            </MessageItemSender>
            <MessageItemTime>2:20 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Interactive sender underline and avatar pressed scale are additive. Hold the avatar to
            preview the long-press treatment.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      {mentioned ? (
        <p className="text-xs text-foreground-muted" role="status">
          Sender mention action fired.
        </p>
      ) : null}
    </div>
  );
}
