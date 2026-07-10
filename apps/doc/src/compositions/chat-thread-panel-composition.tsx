import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Avatar, useThemeFamily } from "raft-ui";
import { tv } from "tailwind-variants/lite";
import {
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
  PanelIconButton,
} from "raft-ui/wip";

const threadReplyCard = tv({
  base: ["border-2 p-3 text-sm shadow-xs"],
  variants: {
    theme: {
      brutal: "border-line-strong",
      elegant: "rounded-md border-line-subtle",
    },
    tone: {
      default: "bg-layer-panel",
      highlighted: "bg-primary-400/25",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

function ThreadReplyCard({ children, tone }: { children: ReactNode; tone?: "highlighted" }) {
  const theme = useThemeFamily();

  return (
    <div data-slot="thread-reply-card" className={threadReplyCard({ theme, tone })}>
      {children}
    </div>
  );
}

export function ChatThreadPanelComposition() {
  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>Thread</ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <PanelIconButton aria-label="Close thread">
            <X />
          </PanelIconButton>
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
        <PanelIconButton aria-label="Previous match">
          <ChevronUp />
        </PanelIconButton>
        <PanelIconButton aria-label="Next match">
          <ChevronDown />
        </PanelIconButton>
        <PanelIconButton aria-label="Close thread search">
          <X />
        </PanelIconButton>
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
          <ThreadReplyCard>
            <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">Cindy</div>
            <div className="leading-relaxed text-foreground-strong">
              SideThreadColumn owns persisted width and desktop resize chrome.
            </div>
          </ThreadReplyCard>
          <ThreadReplyCard tone="highlighted">
            <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">Atlas</div>
            <div className="leading-relaxed text-foreground-strong">
              ThreadPanel now owns the right-panel header, body, action, and footer chrome.
            </div>
          </ThreadReplyCard>
        </div>
      </ChatThreadPanelBody>
      <ChatThreadPanelFooter>Reply composer slot</ChatThreadPanelFooter>
    </ChatThreadPanelRoot>
  );
}
