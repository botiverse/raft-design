import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItemActive,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemTime,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
} from "raft-ui/wip";

import { MessageMultiSelectToolbarComposition } from "./selection.compositions.tsx";

// @docs-source-strip-start
function MessageSelectionToolbarShowcase() {
  const [active, setActive] = useState(true);

  if (!active) {
    return (
      <button
        type="button"
        className="text-xs font-bold underline underline-offset-2"
        onClick={() => setActive(true)}
      >
        Re-enter multi-select mode
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <MessageMultiSelectToolbarComposition onCancel={() => setActive(false)}>
        3 selected
      </MessageMultiSelectToolbarComposition>
      <p className="text-xs text-foreground-muted">
        Copy, Forward, and Generate image are disabled in this isolated chrome example because it
        has no selected-message payload.
      </p>
    </div>
  );
}
// @docs-source-strip-end

export function MessageRowChromeComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-6">
      <div className="flex flex-col gap-3">
        <MessageItemActive>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Active anchor</MessageItemSender>
              <MessageItemTime>3:19 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              Used for menu anchor, current row, or permalink focus.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItemActive>

        <MessageItemSearchMatch>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>SR</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Search result</MessageItemSender>
              <MessageItemTime>3:20 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              Search jump highlight keeps the cyan source treatment.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItemSearchMatch>

        <MessageMultiSelect defaultActive defaultSelected={new Set(["selected-row"])}>
          <MessageItemSelection>
            <MessageMultiSelectCheckbox value="selected-row" aria-label="Select message" />
            <MessageItemAvatarSlot>
              <Avatar size="md" type="agent">
                <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
                <AvatarFallback>AT</AvatarFallback>
              </Avatar>
            </MessageItemAvatarSlot>
            <MessageItemContent>
              <MessageItemHeader>
                <MessageItemSender>Selected row</MessageItemSender>
                <MessageItemTime>3:18 PM</MessageItemTime>
              </MessageItemHeader>
              <MessageItemBody>Selection is represented by a real checkbox.</MessageItemBody>
            </MessageItemContent>
          </MessageItemSelection>
        </MessageMultiSelect>
      </div>
      {/* @docs-source-strip-start */}
      <MessageSelectionToolbarShowcase />
      {/* @docs-source-strip-end */}
    </div>
  );
}
