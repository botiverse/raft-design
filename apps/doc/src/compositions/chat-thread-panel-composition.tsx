import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Avatar } from "raft-ui";
import {
  ChatThreadPanelAction,
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelFooter,
  ChatThreadPanelHeader,
  ChatThreadPanelParent,
  ChatThreadPanelReplyCount,
  ChatThreadPanelRoot,
  ChatThreadPanelSearch,
  ChatThreadPanelSearchCount,
  ChatThreadPanelSearchInput,
  ChatThreadPanelTitle,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageTimelineDateDivider,
  MessageTimelineNotice,
} from "raft-ui/wip";

export function ChatThreadPanelComposition() {
  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>Thread</ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <ChatThreadPanelAction aria-label="Close thread">
            <X />
          </ChatThreadPanelAction>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      <ChatThreadPanelSearch>
        <Search className="size-3.5" />
        <ChatThreadPanelSearchInput
          aria-label="Search in thread"
          placeholder="Search in thread"
          readOnly
          value="chrome"
        />
        <ChatThreadPanelSearchCount>1/2</ChatThreadPanelSearchCount>
        <ChatThreadPanelAction aria-label="Previous match">
          <ChevronUp />
        </ChatThreadPanelAction>
        <ChatThreadPanelAction aria-label="Next match">
          <ChevronDown />
        </ChatThreadPanelAction>
        <ChatThreadPanelAction aria-label="Close thread search">
          <X />
        </ChatThreadPanelAction>
      </ChatThreadPanelSearch>
      <ChatThreadPanelParent>
        <MessageItem>
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
                10:08
              </MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody className="[[data-preview-theme=brutal]_&]:text-black">
              Should ThreadPanel own the right-panel chrome?
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </ChatThreadPanelParent>
      <ChatThreadPanelBody>
        <div className="px-3 pt-2">
          <MessageTimelineNotice>Beginning of replies</MessageTimelineNotice>
          <ChatThreadPanelReplyCount>2 replies</ChatThreadPanelReplyCount>
        </div>
        <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>
        <div className="space-y-3 px-3 pb-3">
          <div className="border-2 border-line-strong bg-layer-panel p-3 text-sm shadow-xs [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle">
            <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">Cindy</div>
            <div className="leading-relaxed text-foreground-strong">
              SideThreadColumn owns persisted width and desktop resize chrome.
            </div>
          </div>
          <div className="border-2 border-line-strong bg-primary-400/25 p-3 text-sm shadow-xs [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle">
            <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">Atlas</div>
            <div className="leading-relaxed text-foreground-strong">
              ThreadPanel now owns the right-panel header, body, action, and footer chrome.
            </div>
          </div>
        </div>
      </ChatThreadPanelBody>
      <ChatThreadPanelFooter>Reply composer slot</ChatThreadPanelFooter>
    </ChatThreadPanelRoot>
  );
}
