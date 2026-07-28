import { useRef, useState } from "react";
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
  Button,
  Checkbox,
  ConversationPanelBody,
  ConversationPanelContent,
  ConversationPanelFooter,
  ConversationPanelRoot,
  ConversationPanelTabs,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsIndicator,
  TabsLabel,
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
} from "raft-ui";
import {
  MessageList,
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
  MessageListDateDivider,
  MessageListNotice,
} from "raft-ui/wip";
import {
  Composer,
  ComposerInput,
  ComposerToolbar,
} from "#/modules/chat-composer/composer-responsive.tsx";
import { ConversationPanelHeaderComposition } from "./conversation-panel-header.composition.tsx";

export type ConversationPanelCompositionProps = {
  conversation?: "channel" | "dm";
  muted?: boolean;
  notificationError?: string | null;
  newMessageCount?: number;
};

export function ConversationPanelComposition({
  conversation = "channel",
  muted: mutedProp = false,
  notificationError = null,
  newMessageCount = 0,
}: ConversationPanelCompositionProps = {}) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(mutedProp);
  const [lastMutedProp, setLastMutedProp] = useState(mutedProp);
  // Sync the local mute demo state when the controlled prop (playground control) changes.
  if (mutedProp !== lastMutedProp) {
    setLastMutedProp(mutedProp);
    setMuted(mutedProp);
  }

  const handleJump = () => {
    const el = timelineRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  return (
    <ConversationPanelRoot>
      <ConversationPanelHeaderComposition
        conversation={conversation}
        muted={muted}
        onMutedChange={setMuted}
      />
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
          <SortableTabsList
            value={["chat", "tasks", "files"]}
            onReorder={() => undefined}
            variant="underline"
          >
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
            <TabsIndicator />
          </SortableTabsList>
        </ConversationPanelTabs>
        <ConversationPanelBody>
          <MessageList ref={timelineRef}>
            <div className="px-3 pt-3">
              <MessageListNotice>Beginning of messages</MessageListNotice>
            </div>
            <div className="h-px" aria-hidden />
            <div className="flex-1" aria-hidden />
            <MessageListDateDivider>Today</MessageListDateDivider>
            <div data-index="0" data-message-id="preview-cindy">
              <div>
                <MessageItem>
                  <MessageItemAvatarSlot>
                    <Avatar size="md" type="human" />
                  </MessageItemAvatarSlot>
                  <MessageItemContent>
                    <MessageItemHeader>
                      <MessageItemSender>Cindy</MessageItemSender>
                      <MessageItemTime>10:42</MessageItemTime>
                    </MessageItemHeader>
                    <MessageItemBody>
                      Rail and sidebar own navigation. The conversation panel owns the active
                      conversation chrome.
                    </MessageItemBody>
                    <MessageItemFooter>
                      <MessageItemBadge status="unread">
                        2 replies
                        <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>1 new
                      </MessageItemBadge>
                    </MessageItemFooter>
                  </MessageItemContent>
                  <MessageItemToolbar>
                    <MessageItemToolbarButton aria-label="Reply in thread">
                      <MessageSquare />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Add reaction">
                      <SmilePlus />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Save message">
                      <Bookmark />
                    </MessageItemToolbarButton>
                  </MessageItemToolbar>
                </MessageItem>
              </div>
            </div>
            <div data-index="1" data-message-id="preview-atlas">
              <div>
                <MessageItem>
                  <MessageItemAvatarSlot>
                    <Avatar size="md" type="agent" />
                  </MessageItemAvatarSlot>
                  <MessageItemContent>
                    <MessageItemHeader>
                      <MessageItemSender>Atlas</MessageItemSender>
                      <MessageItemTime>10:44</MessageItemTime>
                    </MessageItemHeader>
                    <MessageItemBody>
                      Message rows, composer behavior, route sync, and realtime data stay app-owned.
                    </MessageItemBody>
                  </MessageItemContent>
                  <MessageItemToolbar>
                    <MessageItemToolbarButton aria-label="Reply in thread">
                      <MessageSquare />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Add reaction">
                      <SmilePlus />
                    </MessageItemToolbarButton>
                    <MessageItemToolbarButton aria-label="Save message">
                      <Bookmark />
                    </MessageItemToolbarButton>
                  </MessageItemToolbar>
                </MessageItem>
              </div>
            </div>
            <div data-index="2" data-message-id="preview-atlas-cont">
              <div>
                <MessageItem compact>
                  <MessageItemGutter>
                    <MessageItemContinuationTime>10:45</MessageItemContinuationTime>
                  </MessageItemGutter>
                  <MessageItemContent>
                    <MessageItemBody>
                      Continuation lines stack under the sender with no repeated avatar or header.
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
                        <MessageItemSender>{index % 2 === 0 ? "Cindy" : "Atlas"}</MessageItemSender>
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
            <div className="px-3 pb-3">
              <div className="h-3" />
            </div>
          </MessageList>
          {newMessageCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 [[data-theme=elegant]_&]:md:bottom-40"
              onClick={handleJump}
            >
              <ArrowDown />
              {newMessageCount} new messages
            </Button>
          ) : null}
        </ConversationPanelBody>
        <ConversationPanelFooter>
          <ComposerRoot onSubmit={(event) => event.preventDefault()}>
            <Composer>
              <ComposerInput
                aria-label="Message #proj-uiux"
                placeholder="Message #proj-uiux"
                readOnly
              />
              <ComposerToolbar>
                <ComposerActions>
                  <ComposerIconButton aria-label="Attach image" disabled>
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton aria-label="Attach file" disabled>
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerToolbarLabel>
                    <Checkbox size="sm" aria-label="Send as task" />
                    As Task
                  </ComposerToolbarLabel>
                  <ComposerSubmit aria-label="Send" disabled>
                    <span>Send</span>
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
