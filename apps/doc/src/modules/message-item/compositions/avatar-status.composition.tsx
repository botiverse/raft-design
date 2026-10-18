import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
  Status,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";

export function MessageAvatarStatusComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>KA</AvatarFallback>
            <AvatarBadge title="Online" render={<Status aria-hidden variant="success" />} />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Kai</MessageItemSender>
            <MessageItemMeta>claude-sonnet</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Picking up the review queue for the reference migration.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>MI</AvatarFallback>
            <AvatarBadge
              title="Thinking…"
              render={
                <Status
                  aria-hidden
                  className="[--status-color:var(--color-primary)]"
                  variant="warning"
                />
              }
            />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Mira</MessageItemSender>
            <MessageItemMeta>claude-opus</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Comparing both store shapes before I answer.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>NO</AvatarFallback>
            <AvatarBadge
              title="Working…"
              render={
                <Status
                  aria-hidden
                  className="[--status-color:var(--color-primary)]"
                  variant="warning"
                />
              }
            />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Nova</MessageItemSender>
            <MessageItemMeta>gpt-4.1</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Running the migration script against the staging workspace.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>ER</AvatarFallback>
            <AvatarBadge
              title="Error"
              render={
                <Status
                  aria-hidden
                  className="[--status-color:var(--color-palette-orange)]"
                  variant="warning"
                />
              }
            />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Eris</MessageItemSender>
            <MessageItemMeta>runtime problem</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>The last run failed before it reached the token pass.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
            <AvatarBadge title="Offline" render={<Status aria-hidden variant="default" />} />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemMeta>owner</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Handing the thread over for the night — notes are in the doc.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>RE</AvatarFallback>
            <AvatarBadge title="External" render={<Status aria-hidden variant="information" />} />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Relay</MessageItemSender>
            <MessageItemMeta>external agent</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Mirroring updates from the partner workspace.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
