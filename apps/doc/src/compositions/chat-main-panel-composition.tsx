import {
  ArrowUp,
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
  ComposerTaskLabel,
  ComposerTaskToggle,
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
  PanelIconButton,
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
          <PanelIconButton aria-label="Search conversation">
            <Search />
          </PanelIconButton>
          <PanelIconButton aria-label="Mute channel activity">
            <Bell />
          </PanelIconButton>
          <PanelIconButton aria-label="Stop all agents in this channel">
            <Square />
          </PanelIconButton>
          <PanelIconButton aria-label="Channel options" className="[[data-theme=elegant]_&]:hidden">
            <Settings />
          </PanelIconButton>
          <PanelIconButton aria-label="Channel members" className="[[data-theme=elegant]_&]:hidden">
            <Users />
          </PanelIconButton>
          <PanelIconButton
            aria-label="View participants"
            className="hidden [[data-theme=elegant]_&]:inline-flex [[data-theme=elegant]_&]:size-auto [[data-theme=elegant]_&]:h-7 [[data-theme=elegant]_&]:gap-1 [[data-theme=elegant]_&]:px-3 [[data-theme=elegant]_&]:py-1.5 [[data-theme=elegant]_&]:text-sm [[data-theme=elegant]_&]:font-medium"
          >
            <Users />
            <span>13</span>
          </PanelIconButton>
          <PanelIconButton
            aria-label="Channel options"
            className="hidden [[data-theme=elegant]_&]:inline-flex"
          >
            <Settings />
          </PanelIconButton>
        </ChatMainPanelActions>
      </ChatMainPanelHeader>
      <ChatMainPanelContent>
        <ChatMainPanelTabs render={<Tabs value="chat" />}>
          <SortableTabsList
            value={["chat", "tasks", "files"]}
            onReorder={() => undefined}
            variant="underline"
            className="[[data-theme=brutal]_&]:max-w-none [[data-theme=brutal]_&]:border-y-0 [[data-theme=brutal]_&]:border-l-0 [[data-theme=brutal]_&]:border-r-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-white"
          >
            <SortableTabsTab
              value="chat"
              className="!cursor-default [[data-theme=brutal]_&]:bg-soft-signal [[data-theme=brutal]_&]:text-black [[data-theme=brutal]_&]:data-[active]:bg-soft-signal [[data-theme=brutal]_&]:data-[active]:hover:bg-soft-signal [[data-theme=brutal]_&]:[&+&]:before:bg-black"
            >
              <MessageSquare />
              <TabsLabel>Chat</TabsLabel>
            </SortableTabsTab>
            <SortableTabsTab
              value="tasks"
              className="!cursor-default [[data-theme=brutal]_&]:bg-white [[data-theme=brutal]_&]:text-black [[data-theme=brutal]_&]:hover:bg-white [[data-theme=brutal]_&]:[&+&]:before:bg-black"
            >
              <ListTodo />
              <TabsLabel>Tasks</TabsLabel>
            </SortableTabsTab>
            <SortableTabsTab
              value="files"
              className="!cursor-default [[data-theme=brutal]_&]:bg-white [[data-theme=brutal]_&]:text-black [[data-theme=brutal]_&]:hover:bg-white [[data-theme=brutal]_&]:[&+&]:before:bg-black"
            >
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
              <MessageTimelineDateDivider className="hidden [[data-theme=elegant]_&]:flex">
                Today
              </MessageTimelineDateDivider>
              <div data-index="0" data-message-id="preview-cindy">
                <div style={{ contain: "layout style", overflow: "clip visible" }}>
                  <MessageItem className="[[data-theme=brutal]_&]:transition-none">
                    <MessageItemAvatarSlot>
                      <Avatar size="md" type="human" />
                    </MessageItemAvatarSlot>
                    <MessageItemContent>
                      <MessageItemHeader>
                        <MessageItemSender className="[[data-theme=brutal]_&]:text-black">
                          Cindy
                        </MessageItemSender>
                        <MessageItemTime className="[[data-theme=brutal]_&]:text-black/40">
                          10:42
                        </MessageItemTime>
                      </MessageItemHeader>
                      <MessageItemBody className="[[data-theme=brutal]_&]:text-black">
                        Rail and sidebar own navigation. The main panel owns the active conversation
                        chrome.
                      </MessageItemBody>
                      <MessageItemFooter className="hidden [[data-theme=elegant]_&]:flex">
                        <MessageItemBadge>2 replies</MessageItemBadge>
                        <MessageItemBadge tone="cyan">1 new</MessageItemBadge>
                      </MessageItemFooter>
                    </MessageItemContent>
                    <MessageItemToolbar className="[[data-theme=brutal]_&]:!hidden">
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
                <div style={{ contain: "layout style", overflow: "clip visible" }}>
                  <MessageItem className="[[data-theme=brutal]_&]:transition-none">
                    <MessageItemAvatarSlot>
                      <Avatar size="md" type="agent" />
                    </MessageItemAvatarSlot>
                    <MessageItemContent>
                      <MessageItemHeader>
                        <MessageItemSender className="[[data-theme=brutal]_&]:text-black">
                          Atlas
                        </MessageItemSender>
                        <MessageItemTime className="[[data-theme=brutal]_&]:text-black/40">
                          10:44
                        </MessageItemTime>
                      </MessageItemHeader>
                      <MessageItemBody className="[[data-theme=brutal]_&]:text-black">
                        Message rows, composer behavior, route sync, and realtime data stay
                        app-owned.
                      </MessageItemBody>
                    </MessageItemContent>
                    <MessageItemToolbar className="[[data-theme=brutal]_&]:!hidden">
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
              <div
                className="hidden [[data-theme=elegant]_&]:block"
                data-index="2"
                data-message-id="preview-atlas-cont"
              >
                <div style={{ contain: "layout style", overflow: "clip visible" }}>
                  <MessageItem compact>
                    <MessageItemGutter />
                    <MessageItemContent>
                      <MessageItemBody>
                        Continuation lines stack under the sender with no repeated avatar or header.
                      </MessageItemBody>
                    </MessageItemContent>
                    <MessageItemContinuationTime>10:45</MessageItemContinuationTime>
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
                  <ComposerTaskToggle>
                    <Checkbox size="sm" aria-label="Send as task" />
                    <ComposerTaskLabel>As Task</ComposerTaskLabel>
                  </ComposerTaskToggle>
                  <ChatMainPanelComposerSubmit aria-label="Send">
                    <Send className="[[data-theme=elegant]_&]:hidden" />
                    <span className="hidden [[data-theme=elegant]_&]:inline">Send</span>
                    <ArrowUp className="hidden [[data-theme=elegant]_&]:inline-block" />
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
