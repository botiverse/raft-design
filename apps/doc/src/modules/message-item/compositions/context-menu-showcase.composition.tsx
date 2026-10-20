import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC, MESSAGE_PLAYGROUND_URLS } from "../message-item.fixtures.ts";
import { Bookmark, MessageSquare } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ContextMenu,
  ContextMenuTrigger,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

import { MessageContextMenuComposition } from "./context-menu.composition.tsx";
import type { MessageTaskState } from "./context-menu.composition.tsx";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import { MessageRowToolbarFixture } from "./row-toolbar.composition.tsx";

function copyMessageLink() {
  const permalink = new URL(MESSAGE_PLAYGROUND_URLS.apiDocsMessage, window.location.origin);
  void navigator.clipboard?.writeText(permalink.href);
}

function copyMessageMarkdown() {
  void navigator.clipboard?.writeText("Right-click opens the shared ContextMenu composition.");
}

export function MessageContextMenuShowcaseComposition() {
  const [followed, setFollowed] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [reaction, setReaction] = useState("✅");
  const [saved, setSaved] = useState(false);
  const [task, setTask] = useState<MessageTaskState>("none");

  return (
    <div className="w-full max-w-3xl">
      <div ref={setPortalContainer} className="relative w-full">
        <ContextMenu>
          <ContextMenuTrigger render={<MessageItem />}>
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
                <MessageItemTime dateTime="2026-10-20T14:14:00Z">2:14 PM</MessageItemTime>
              </MessageItemHeader>
              <MessageItemBody>
                Right-click opens the shared ContextMenu composition.
              </MessageItemBody>
              <MessageItemFooter>
                {saved ? (
                  <MessageItemSavedIndicator>
                    <Bookmark fill="currentColor" />
                    <span>Saved</span>
                  </MessageItemSavedIndicator>
                ) : null}
                <MessageItemBadge status="unread">
                  <MessageSquare />
                  <span>4 replies</span>
                  <MessageItemBadgeSeparator />
                  <span>1 new</span>
                </MessageItemBadge>
                <MessageReactionComposition emoji={reaction} count={2} reacted />
              </MessageItemFooter>
            </MessageItemContent>
            <MessageRowToolbarFixture />
          </ContextMenuTrigger>
          <MessageContextMenuComposition
            followed={followed}
            onCopyLink={copyMessageLink}
            onCopyMarkdown={copyMessageMarkdown}
            onFollowChange={setFollowed}
            onQuickReact={setReaction}
            onSavedChange={setSaved}
            onTaskChange={setTask}
            portalContainer={portalContainer}
            saved={saved}
            sentAt={<time dateTime="2026-10-20T14:14:00Z">Tuesday, October 20 at 2:14 PM</time>}
            task={task}
          />
        </ContextMenu>
      </div>
    </div>
  );
}
