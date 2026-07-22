import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Bookmark, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, ContextMenu, ContextMenuTrigger } from "raft-ui";
import {
  MessageItemActive,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import {
  MessageContextMenuComposition,
  type MessageTaskState,
} from "./context-menu.composition.tsx";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import { MessageRowToolbarFixture } from "./row-toolbar.composition.tsx";

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
          <ContextMenuTrigger render={<MessageItemActive />}>
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
                  <MessageSquare />4 replies
                </MessageItemBadge>
                <MessageReactionComposition emoji={reaction} count={2} reacted />
              </MessageItemFooter>
            </MessageItemContent>
            <MessageRowToolbarFixture />
          </ContextMenuTrigger>
          <MessageContextMenuComposition
            followed={followed}
            onCopyLink={() => {
              void navigator.clipboard?.writeText(window.location.href);
            }}
            onCopyMarkdown={() => {
              void navigator.clipboard?.writeText(
                "Right-click opens the shared ContextMenu composition.",
              );
            }}
            onFollowChange={setFollowed}
            onOpenThread={() => {}}
            onQuickReact={setReaction}
            onSavedChange={setSaved}
            onTaskChange={setTask}
            portalContainer={portalContainer}
            saved={saved}
            task={task}
          />
        </ContextMenu>
      </div>
    </div>
  );
}
