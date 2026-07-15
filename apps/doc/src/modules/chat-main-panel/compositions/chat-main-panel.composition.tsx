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
  Checkbox,
  Kbd,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsIndicator,
  TabsLabel,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import {
  ChatMainPanelBody,
  ChatMainPanelContent,
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
  ComposerToolbarLabelText,
  ChatMainPanelFooter,
  ChatMainPanelJumpToLatest,
  ChatMainPanelJumpToLatestLayout,
  ChatMainPanelMessageList,
  ChatMainPanelRoot,
  ChatMainPanelTabs,
  ChatMainPanelTimeline,
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
  MessageTimelineDateDivider,
  MessageTimelineNotice,
} from "raft-ui/wip";
import { ChatMainPanelHeaderComposition } from "./chat-main-panel-header.composition.tsx";

export type ChatMainPanelCompositionProps = {
  conversation?: "channel" | "dm";
  muted?: boolean;
  notificationError?: string | null;
  newMessageCount?: number;
};

export function ChatMainPanelComposition({
  conversation = "channel",
  muted: mutedProp = false,
  notificationError = null,
  newMessageCount = 0,
}: ChatMainPanelCompositionProps = {}) {
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
    <ChatMainPanelRoot>
      <ChatMainPanelHeaderComposition
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
      <ChatMainPanelContent>
        <ChatMainPanelTabs render={<Tabs value="chat" />}>
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
        </ChatMainPanelTabs>
        <ChatMainPanelBody>
          <ChatMainPanelTimeline ref={timelineRef}>
            <ChatMainPanelMessageList>
              <div className="px-3 pt-3">
                <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
              </div>
              <div className="h-px" aria-hidden />
              <div className="flex-1" aria-hidden />
              <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>
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
                        Rail and sidebar own navigation. The main panel owns the active conversation
                        chrome.
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
                        Message rows, composer behavior, route sync, and realtime data stay
                        app-owned.
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
              <div className="h-px" aria-hidden />
              <div className="px-3 pb-3">
                <div className="h-3" />
              </div>
            </ChatMainPanelMessageList>
          </ChatMainPanelTimeline>
          {newMessageCount > 0 ? (
            <ChatMainPanelJumpToLatestLayout>
              <ChatMainPanelJumpToLatest onClick={handleJump}>
                <ArrowDown />
                {newMessageCount} new messages
              </ChatMainPanelJumpToLatest>
            </ChatMainPanelJumpToLatestLayout>
          ) : null}
        </ChatMainPanelBody>
        <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
          <ComposerRoot>
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
                  <TooltipProvider delay={300}>
                    <Tooltip>
                      <TooltipTrigger render={<ComposerToolbarLabel />}>
                        <Checkbox size="sm" aria-label="Send as task" />
                        <ComposerToolbarLabelText>As Task</ComposerToolbarLabelText>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Send as task
                        <Kbd>Cmd Shift Enter</Kbd>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ComposerSubmit aria-label="Send" disabled>
                    <span>Send</span>
                    <Send />
                  </ComposerSubmit>
                </ComposerMeta>
              </ComposerToolbar>
            </Composer>
          </ComposerRoot>
        </ChatMainPanelFooter>
      </ChatMainPanelContent>
    </ChatMainPanelRoot>
  );
}
