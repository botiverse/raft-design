import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

export function MessageItemPersonAndAgentContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Martin</MessageItemSender>
            <MessageItemTime>10:42</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Can someone take the onboarding copy before Thursday? It still says "workspace" in two
            places.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarBadge presence="busy" role="img" aria-label="Working" />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Bugen</MessageItemSender>
            <MessageItemTime>10:44</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>I'll take it. Claiming #25 and opening a branch now.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
