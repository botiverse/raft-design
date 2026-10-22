import { useCallback, useRef } from "react";
import type { FormEvent } from "react";
import {
  ArrowDown,
  Bookmark,
  ImagePlus,
  ListTodo,
  MessageSquare,
  Paperclip,
  Send,
  SmilePlus,
} from "lucide-react";
import {
  Avatar,
  Banner,
  BannerDescription,
  Checkbox,
  ConversationPanelBody,
  ConversationPanelContent,
  ConversationPanelFooter,
  ConversationPanelRoot,
  ConversationPanelTabs,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsLabel,
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
} from "@botiverse/raft-ui";
import type { PanelEdge } from "@botiverse/raft-ui";
import {
  MessageList,
  MessageListDateDivider,
  MessageListEndFade,
  MessageListNotice,
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";
import { MessageListJumpControls, MessageListJumpPill } from "@botiverse/raft-ui/wip";
import { ConversationPanelHeaderComposition } from "./conversation-panel-header.composition.tsx";

export type ConversationPanelCompositionProps = {
  conversation?: "channel" | "dm";
  edge?: PanelEdge;
  muted?: boolean;
  notificationError?: string | null;
  newMessageCount?: number;
};

const tabOrder = ["chat", "tasks", "files"];

function handleTabReorder() {}

function handleComposerSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

export function ConversationPanelComposition({
  conversation = "channel",
  edge = "inset",
  muted = false,
  notificationError = null,
  newMessageCount = 0,
}: ConversationPanelCompositionProps = {}) {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleJump = useCallback(() => {
    const el = timelineRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  return (
    <ConversationPanelRoot edge={edge}>
      <ConversationPanelHeaderComposition conversation={conversation} muted={muted} />
      {notificationError ? (
        <Banner
          status="warning"
          size="sm"
          className="shrink-0 rounded-none border-x-0 border-t-0 px-5 py-2"
        >
          <BannerDescription>{notificationError}</BannerDescription>
        </Banner>
      ) : null}
      <ConversationPanelContent>
        <ConversationPanelTabs render={<Tabs value="chat" />}>
          <SortableTabsList value={tabOrder} onReorder={handleTabReorder}>
            <SortableTabsTab value="chat">
              <MessageSquare />
              <TabsLabel>Chat</TabsLabel>
            </SortableTabsTab>
            <SortableTabsTab value="tasks">
              <ListTodo />
              <TabsLabel>Tasks</TabsLabel>
            </SortableTabsTab>
            <SortableTabsTab value="files">
              <Paperclip />
              <TabsLabel>Files</TabsLabel>
            </SortableTabsTab>
          </SortableTabsList>
        </ConversationPanelTabs>
        <ConversationPanelBody>
          <MessageList ref={timelineRef}>
            <div className="px-3 pt-timeline-start">
              <MessageListNotice>Beginning of messages</MessageListNotice>
            </div>
            <div className="h-px" aria-hidden />
            <div className="flex-1" aria-hidden />
            <MessageListDateDivider>Today</MessageListDateDivider>
            <div data-index="0" data-message-id="preview-martin">
              <div>
                <MessageItem>
                  <MessageItemAvatarSlot>
                    <Avatar size="md" type="human" />
                  </MessageItemAvatarSlot>
                  <MessageItemContent>
                    <MessageItemHeader>
                      <MessageItemSender>Martin</MessageItemSender>
                      <MessageItemTime>10:42</MessageItemTime>
                    </MessageItemHeader>
                    <MessageItemBody>
                      Can someone take the onboarding copy before Thursday? It still says
                      "workspace" in two places.
                    </MessageItemBody>
                    <MessageItemFooter>
                      <MessageItemBadge status="unread">
                        2 replies
                        <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>1 new
                      </MessageItemBadge>
                    </MessageItemFooter>
                  </MessageItemContent>
                  <MessageItemToolbar>
                    <MessageItemToolbarButton aria-label="Reply in Thread">
                      <MessageSquare />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Add Reaction">
                      <SmilePlus />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Save Message">
                      <Bookmark />
                    </MessageItemToolbarButton>
                  </MessageItemToolbar>
                </MessageItem>
              </div>
            </div>
            <div data-index="1" data-message-id="preview-bugen">
              <div>
                <MessageItem>
                  <MessageItemAvatarSlot>
                    <Avatar size="md" type="agent" />
                  </MessageItemAvatarSlot>
                  <MessageItemContent>
                    <MessageItemHeader>
                      <MessageItemSender>Bugen</MessageItemSender>
                      <MessageItemTime>10:44</MessageItemTime>
                    </MessageItemHeader>
                    <MessageItemBody>
                      I'll take it. Claiming #25 and opening a branch now.
                    </MessageItemBody>
                  </MessageItemContent>
                  <MessageItemToolbar>
                    <MessageItemToolbarButton aria-label="Reply in Thread">
                      <MessageSquare />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Add Reaction">
                      <SmilePlus />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Save Message">
                      <Bookmark />
                    </MessageItemToolbarButton>
                  </MessageItemToolbar>
                </MessageItem>
              </div>
            </div>
            <div data-index="2" data-message-id="preview-bugen-cont">
              <div>
                <MessageItem compact>
                  <MessageItemGutter>
                    <MessageItemContinuationTime>10:45</MessageItemContinuationTime>
                  </MessageItemGutter>
                  <MessageItemContent>
                    <MessageItemBody>
                      Both strings are fixed; the snapshot is in the thread.
                    </MessageItemBody>
                  </MessageItemContent>
                </MessageItem>
              </div>
            </div>
            {/* @docs-source-strip-start */}
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={`preview-overflow-${index}`}
                data-index={index + 3}
                data-message-id={`preview-overflow-${index}`}
              >
                <div>
                  <MessageItem>
                    <MessageItemAvatarSlot>
                      <Avatar size="md" type={index % 2 === 0 ? "human" : "agent"} />
                    </MessageItemAvatarSlot>
                    <MessageItemContent>
                      <MessageItemHeader>
                        <MessageItemSender>
                          {index % 2 === 0 ? "Martin" : "Bugen"}
                        </MessageItemSender>
                        <MessageItemTime>10:{46 + index}</MessageItemTime>
                      </MessageItemHeader>
                      <MessageItemBody>
                        Timeline content continues behind the floating composer while the message
                        list remains the only scroll owner.
                      </MessageItemBody>
                    </MessageItemContent>
                  </MessageItem>
                </div>
              </div>
            ))}
            {/* @docs-source-strip-end */}
            <div className="h-px" aria-hidden />
            <div className="pb-timeline-end" aria-hidden />
          </MessageList>
          <MessageListEndFade />
          {newMessageCount > 0 ? (
            <MessageListJumpControls>
              <MessageListJumpPill onClick={handleJump}>
                <ArrowDown />
                {newMessageCount} New Messages
              </MessageListJumpPill>
            </MessageListJumpControls>
          ) : null}
        </ConversationPanelBody>
        <ConversationPanelFooter>
          <ComposerRoot onSubmit={handleComposerSubmit}>
            <Composer>
              <ComposerInput
                aria-label="Message #launch-week"
                placeholder="Message #launch-week"
                readOnly
              />
              <ComposerToolbar>
                <ComposerActions>
                  <ComposerIconButton aria-label="Attach media" disabled>
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton aria-label="Attach file" disabled>
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerToolbarLabel>
                    <Checkbox aria-label="Send as task" />
                    As Task
                  </ComposerToolbarLabel>
                  <ComposerSubmit size="icon-md" aria-label="Send" disabled>
                    <Send />
                  </ComposerSubmit>
                </ComposerMeta>
              </ComposerToolbar>
            </Composer>
          </ComposerRoot>
        </ConversationPanelFooter>
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}
