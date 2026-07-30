import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSelection,
  MessageItemSender,
  MessageItemTime,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { MessageMultiSelectToolbarComposition } from "./selection.compositions.tsx";

export function MessageSelectionShowcaseComposition() {
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
    <div className="grid w-full max-w-3xl gap-6">
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

      <div className="grid gap-2">
        <MessageMultiSelectToolbarComposition onCancel={() => setActive(false)}>
          3 selected
        </MessageMultiSelectToolbarComposition>
        <p className="text-xs text-foreground-muted">
          Copy, Forward, and Generate image are disabled in this isolated example because it has no
          selected-message payload.
        </p>
      </div>
    </div>
  );
}
