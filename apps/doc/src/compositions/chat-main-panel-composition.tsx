import {
  Bell,
  Hash,
  ImagePlus,
  ListTodo,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Settings,
  Square,
  Users,
} from "lucide-react";
import { Avatar, Checkbox, SortableTabsList, SortableTabsTab, Tabs, TabsLabel } from "raft-ui";
import {
  ChatMainPanelAction,
  ChatMainPanelActions,
  ChatMainPanelBody,
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
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
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
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
          <ChatMainPanelAction aria-label="Search conversation">
            <Search />
          </ChatMainPanelAction>
          <ChatMainPanelAction aria-label="Mute channel activity">
            <Bell />
          </ChatMainPanelAction>
          <ChatMainPanelAction aria-label="Stop all agents in this channel">
            <Square />
          </ChatMainPanelAction>
          <ChatMainPanelAction aria-label="Channel options">
            <Settings />
          </ChatMainPanelAction>
          <ChatMainPanelAction aria-label="Channel members">
            <Users />
          </ChatMainPanelAction>
        </ChatMainPanelActions>
      </ChatMainPanelHeader>
      <ChatMainPanelTabs render={<Tabs value="chat" />}>
        <SortableTabsList
          value={["chat", "tasks", "files"]}
          onReorder={() => undefined}
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
        </SortableTabsList>
      </ChatMainPanelTabs>
      <ChatMainPanelBody>
        <ChatMainPanelTimeline>
          <ChatMainPanelMessageList>
            <div className="px-3 pt-3">
              <div className="pb-2 text-center font-mono text-xs text-foreground/40 [[data-preview-theme=brutal]_&]:text-black/40">
                Beginning of messages
              </div>
            </div>
            <div className="h-px" aria-hidden />
            <div className="flex-1" aria-hidden />
            <div data-index="0" data-message-id="preview-cindy">
              <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
                <MessageItem className="[[data-preview-theme=brutal]_&]:transition-none">
                  <MessageItemAvatarSlot>
                    <Avatar
                      size="md"
                      type="human"
                      className="[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-lavender [[data-preview-theme=brutal]_&]:text-black"
                    />
                  </MessageItemAvatarSlot>
                  <MessageItemContent>
                    <MessageItemHeader>
                      <MessageItemSender className="[[data-preview-theme=brutal]_&]:text-black">
                        Cindy
                      </MessageItemSender>
                      <MessageItemTime className="[[data-preview-theme=brutal]_&]:text-black/40">
                        10:42
                      </MessageItemTime>
                    </MessageItemHeader>
                    <MessageItemBody className="[[data-preview-theme=brutal]_&]:text-black">
                      Rail and sidebar own navigation. The main panel owns the active conversation
                      chrome.
                    </MessageItemBody>
                  </MessageItemContent>
                </MessageItem>
              </div>
            </div>
            <div data-index="1" data-message-id="preview-atlas">
              <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
                <MessageItem className="[[data-preview-theme=brutal]_&]:transition-none">
                  <MessageItemAvatarSlot>
                    <Avatar
                      size="md"
                      type="agent"
                      className="[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-cyan [[data-preview-theme=brutal]_&]:text-black"
                    />
                  </MessageItemAvatarSlot>
                  <MessageItemContent>
                    <MessageItemHeader>
                      <MessageItemSender className="[[data-preview-theme=brutal]_&]:text-black">
                        Atlas
                      </MessageItemSender>
                      <MessageItemTime className="[[data-preview-theme=brutal]_&]:text-black/40">
                        10:44
                      </MessageItemTime>
                    </MessageItemHeader>
                    <MessageItemBody className="[[data-preview-theme=brutal]_&]:text-black">
                      Message rows, composer behavior, route sync, and realtime data stay app-owned.
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
              <label className="inline-flex select-none items-center gap-1.5">
                <Checkbox size="sm" aria-label="Send as task" />
                <span className="text-xs font-bold text-foreground-muted [[data-preview-theme=brutal]_&]:text-black/60">
                  As Task
                </span>
              </label>
              <ChatMainPanelComposerSubmit aria-label="Send">
                <Send />
              </ChatMainPanelComposerSubmit>
            </ChatMainPanelComposerMeta>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </ChatMainPanelFooter>
    </ChatMainPanelRoot>
  );
}
