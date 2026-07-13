import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarFallback } from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemTime,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import { MessageRowToolbar } from "./row-toolbar.composition.tsx";

export type MessageItemPreviewChrome = "default" | "active" | "search-match" | "selected";

export type MessageItemPreviewProps = {
  chrome?: MessageItemPreviewChrome;
  saved?: boolean;
  reactions?: boolean;
  toolbar?: boolean;
};

const ROW_CHROME = {
  default: MessageItem,
  active: MessageItemActive,
  "search-match": MessageItemSearchMatch,
};

/**
 * Configurable authored row for the docs playground. Row chrome, the saved
 * indicator, reactions, and the hover toolbar are driven by controls; business
 * state and copy stay caller-owned like every other composition.
 */
export function MessageItemPreview({
  chrome = "default",
  saved = false,
  reactions = false,
  toolbar = false,
}: MessageItemPreviewProps) {
  // The Saved control is the source of truth; footer and toolbar share one state
  // so the in-preview save button and the control never diverge. Re-sync on the
  // render pass where the control prop changes (no effect needed).
  const [isSaved, setIsSaved] = useState(saved);
  const [savedControl, setSavedControl] = useState(saved);
  if (saved !== savedControl) {
    setSavedControl(saved);
    setIsSaved(saved);
  }
  const [reaction, setReaction] = useState<string>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  const footer =
    isSaved || reactions ? (
      <MessageItemFooter>
        {isSaved ? (
          <MessageItemSavedIndicator
            aria-label="Remove from Saved"
            render={<button type="button" onClick={() => setIsSaved(false)} />}
          >
            <Bookmark fill="currentColor" />
            <span>Saved</span>
          </MessageItemSavedIndicator>
        ) : null}
        {reactions ? (
          <>
            <MessageReactionComposition emoji="👍" count={3} reacted />
            <MessageReactionComposition emoji="🔥" count={1} />
          </>
        ) : null}
      </MessageItemFooter>
    ) : null;

  const content = (
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender>Atlas</MessageItemSender>
        <MessageItemMeta>claude-opus</MessageItemMeta>
        <MessageItemTime>2:14 PM</MessageItemTime>
      </MessageItemHeader>
      <MessageItemBody>
        Toggle the controls to preview row chrome, the saved indicator, reactions, and the hover
        toolbar. Markdown, mentions, and links stay caller-owned.
      </MessageItemBody>
      {footer}
    </MessageItemContent>
  );

  if (chrome === "selected") {
    return (
      <MessageMultiSelect defaultActive defaultSelected={new Set(["preview"])}>
        <MessageItemSelection>
          <MessageMultiSelectCheckbox value="preview" aria-label="Select message" />
          {content}
        </MessageItemSelection>
      </MessageMultiSelect>
    );
  }

  const RowChrome = ROW_CHROME[chrome];

  return (
    <div ref={setPortalContainer} style={{ contain: "layout style", overflow: "clip visible" }}>
      <RowChrome>
        <MessageItemAvatarSlot>
          <Avatar size="sm" type="agent">
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        {content}
        {toolbar ? (
          <MessageRowToolbar
            saved={isSaved}
            visible
            portalContainer={portalContainer}
            onReact={setReaction}
            onSavedChange={setIsSaved}
          />
        ) : null}
      </RowChrome>
      {reaction ? (
        <span className="sr-only" role="status">
          Reacted with {reaction}
        </span>
      ) : null}
    </div>
  );
}
