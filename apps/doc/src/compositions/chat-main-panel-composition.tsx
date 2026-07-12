import {
  Bell,
  Bookmark,
  Hash,
  ImagePlus,
  ListTodo,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Settings,
  SmilePlus,
  Square,
  Users,
} from "lucide-react";
import {
  Avatar,
  Checkbox,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsIndicator,
  TabsLabel,
} from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelBody,
  ChatMainPanelContent,
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ComposerRoot,
  ComposerToolbarOption,
  ComposerToolbarOptionLabel,
  ChatMainPanelFooter,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelMessageList,
  ChatMainPanelRoot,
  ChatMainPanelSubtitle,
  ChatMainPanelTabs,
  ChatMainPanelTimeline,
  ChatMainPanelTitle,
  ChatMainPanelTitleBlock,
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
  PanelButton,
  PanelButtonCount,
  PanelButtonIcon,
  PanelToggleButton,
} from "raft-ui/wip";

export function ChatMainPanelComposition() {
  return (
    <ChatMainPanelRoot>
      <ChatMainPanelHeader>
        <ChatMainPanelHeaderIcon>
          <Hash className="size-[18px]" />
        </ChatMainPanelHeaderIcon>
        <ChatMainPanelTitleBlock>
          <ChatMainPanelTitle>proj-uiux</ChatMainPanelTitle>
          <ChatMainPanelSubtitle>Design system migration</ChatMainPanelSubtitle>
        </ChatMainPanelTitleBlock>
        <ChatMainPanelActions>
          <PanelButton aria-label="Search conversation">
            <PanelButtonIcon>
              <Search />
            </PanelButtonIcon>
          </PanelButton>
          <PanelToggleButton aria-label="Mute channel activity">
            <PanelButtonIcon>
              <Bell />
            </PanelButtonIcon>
          </PanelToggleButton>
          <PanelButton aria-label="Stop all agents in this channel">
            <PanelButtonIcon>
              <Square />
            </PanelButtonIcon>
          </PanelButton>
          <PanelButton aria-label="View participants">
            <PanelButtonIcon>
              <Users />
            </PanelButtonIcon>
            <PanelButtonCount>13</PanelButtonCount>
          </PanelButton>
          <PanelButton aria-label="Channel options">
            <PanelButtonIcon>
              <Settings />
            </PanelButtonIcon>
          </PanelButton>
        </ChatMainPanelActions>
      </ChatMainPanelHeader>
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
          <ChatMainPanelTimeline>
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
        </ChatMainPanelBody>
        <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
          <ComposerRoot>
            <ChatMainPanelComposer>
              <ChatMainPanelComposerInput
                aria-label="Message #proj-uiux"
                placeholder="Message #proj-uiux"
                readOnly
              />
              <ChatMainPanelComposerToolbar>
                <ChatMainPanelComposerActions>
                  <ChatMainPanelComposerIconButton aria-label="Attach image">
                    <ImagePlus />
                  </ChatMainPanelComposerIconButton>
                  <ChatMainPanelComposerIconButton aria-label="Attach file">
                    <Paperclip />
                  </ChatMainPanelComposerIconButton>
                </ChatMainPanelComposerActions>
                <ChatMainPanelComposerMeta>
                  <ComposerToolbarOption>
                    <Checkbox size="sm" aria-label="Send as task" />
                    <ComposerToolbarOptionLabel>As Task</ComposerToolbarOptionLabel>
                  </ComposerToolbarOption>
                  <ChatMainPanelComposerSubmit aria-label="Send">
                    <span>Send</span>
                    <Send />
                  </ChatMainPanelComposerSubmit>
                </ChatMainPanelComposerMeta>
              </ChatMainPanelComposerToolbar>
            </ChatMainPanelComposer>
          </ComposerRoot>
        </ChatMainPanelFooter>
      </ChatMainPanelContent>
    </ChatMainPanelRoot>
  );
}
