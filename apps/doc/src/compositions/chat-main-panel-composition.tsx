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
  BrutalOnly,
  Checkbox,
  ElegantOnly,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsIndicator,
  TabsLabel,
} from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelBody,
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ComposerTaskLabel,
  ComposerTaskToggle,
  ChatMainPanelFooter,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelMessageList,
  ChatMainPanelRoot,
  ChatMainPanelSubtitle,
  ChatMainPanelSurfaceInset,
  ChatMainPanelSurfaceShadow,
  ChatMainPanelSurface,
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
          <PanelIconButton
            aria-label="Channel options"
            className="[[data-preview-theme=elegant]_&]:hidden"
          >
            <Settings />
          </PanelIconButton>
          <PanelIconButton
            aria-label="Channel members"
            className="[[data-preview-theme=elegant]_&]:hidden"
          >
            <Users />
          </PanelIconButton>
          <PanelIconButton
            aria-label="View participants"
            className="hidden [[data-preview-theme=elegant]_&]:inline-flex [[data-preview-theme=elegant]_&]:size-auto [[data-preview-theme=elegant]_&]:h-7 [[data-preview-theme=elegant]_&]:gap-1 [[data-preview-theme=elegant]_&]:px-3 [[data-preview-theme=elegant]_&]:py-1.5 [[data-preview-theme=elegant]_&]:text-sm [[data-preview-theme=elegant]_&]:font-medium"
          >
            <Users />
            <span>13</span>
          </PanelIconButton>
          <PanelIconButton
            aria-label="Channel options"
            className="hidden [[data-preview-theme=elegant]_&]:inline-flex"
          >
            <Settings />
          </PanelIconButton>
        </ChatMainPanelActions>
      </ChatMainPanelHeader>
      <ChatMainPanelSurfaceInset>
        <ChatMainPanelSurfaceShadow>
          <ChatMainPanelSurface>
            <ChatMainPanelTabs render={<Tabs value="chat" />}>
              <SortableTabsList
                value={["chat", "tasks", "files"]}
                onReorder={() => undefined}
                variant="underline"
                className="[[data-preview-theme=brutal]_&]:max-w-none [[data-preview-theme=brutal]_&]:border-y-0 [[data-preview-theme=brutal]_&]:border-l-0 [[data-preview-theme=brutal]_&]:border-r-2 [[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-white"
              >
                <SortableTabsTab
                  value="chat"
                  className="!cursor-default [[data-preview-theme=brutal]_&]:bg-soft-signal [[data-preview-theme=brutal]_&]:text-black [[data-preview-theme=brutal]_&]:data-[active]:bg-soft-signal [[data-preview-theme=brutal]_&]:data-[active]:hover:bg-soft-signal [[data-preview-theme=brutal]_&]:[&+&]:before:bg-black"
                >
                  <MessageSquare />
                  <TabsLabel>Chat</TabsLabel>
                </SortableTabsTab>
                <SortableTabsTab
                  value="tasks"
                  className="!cursor-default [[data-preview-theme=brutal]_&]:bg-white [[data-preview-theme=brutal]_&]:text-black [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=brutal]_&]:[&+&]:before:bg-black"
                >
                  <ListTodo />
                  <TabsLabel>Tasks</TabsLabel>
                </SortableTabsTab>
                <SortableTabsTab
                  value="files"
                  className="!cursor-default [[data-preview-theme=brutal]_&]:bg-white [[data-preview-theme=brutal]_&]:text-black [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=brutal]_&]:[&+&]:before:bg-black"
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
                  <MessageTimelineDateDivider className="hidden [[data-preview-theme=elegant]_&]:flex">
                    Today
                  </MessageTimelineDateDivider>
                  <div data-index="0" data-message-id="preview-cindy">
                    <div style={{ contain: "layout style", overflow: "clip visible" }}>
                      <MessageItem className="[[data-preview-theme=brutal]_&]:transition-none">
                        <MessageItemAvatarSlot>
                          <Avatar
                            size="md"
                            type="human"
                            className="[[data-preview-theme=brutal]_&]:bg-brutal-lavender"
                          />
                        </MessageItemAvatarSlot>
                        <MessageItemContent>
                          <MessageItemHeader>
                            <MessageItemSender>Cindy</MessageItemSender>
                            <MessageItemTime>10:42</MessageItemTime>
                          </MessageItemHeader>
                          <MessageItemBody>
                            Rail and sidebar own navigation. The main panel owns the active
                            conversation chrome.
                          </MessageItemBody>
                          <MessageItemFooter className="hidden [[data-preview-theme=elegant]_&]:flex">
                            <MessageItemBadge>2 replies</MessageItemBadge>
                            <MessageItemBadge tone="cyan">1 new</MessageItemBadge>
                          </MessageItemFooter>
                        </MessageItemContent>
                        <MessageItemToolbar className="[[data-preview-theme=brutal]_&]:!hidden">
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
                      <MessageItem className="[[data-preview-theme=brutal]_&]:transition-none">
                        <MessageItemAvatarSlot>
                          <Avatar
                            size="md"
                            type="agent"
                            className="[[data-preview-theme=brutal]_&]:bg-brutal-cyan"
                          />
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
                        <MessageItemToolbar className="[[data-preview-theme=brutal]_&]:!hidden">
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
                    className="hidden [[data-preview-theme=elegant]_&]:block"
                    data-index="2"
                    data-message-id="preview-atlas-cont"
                  >
                    <div style={{ contain: "layout style", overflow: "clip visible" }}>
                      <MessageItem compact>
                        <MessageItemGutter />
                        <MessageItemContent>
                          <MessageItemBody>
                            Continuation lines stack under the sender with no repeated avatar or
                            header.
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
                      <span>Send</span>
                      <BrutalOnly>
                        <Send />
                      </BrutalOnly>
                      <ElegantOnly>
                        <ArrowUp />
                      </ElegantOnly>
                    </ChatMainPanelComposerSubmit>
                  </ChatMainPanelComposerMeta>
                </ChatMainPanelComposerToolbar>
              </ChatMainPanelComposer>
            </ChatMainPanelFooter>
          </ChatMainPanelSurface>
        </ChatMainPanelSurfaceShadow>
      </ChatMainPanelSurfaceInset>
    </ChatMainPanelRoot>
  );
}
