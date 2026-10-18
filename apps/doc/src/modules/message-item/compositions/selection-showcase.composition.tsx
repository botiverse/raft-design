import { useCallback, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItem,
  MessageItemSender,
  MessageItemTime,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  Button,
} from "@botiverse/raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { MessageMultiSelectToolbarComposition } from "./selection.compositions.tsx";

export function MessageSelectionShowcaseComposition() {
  const [active, setActive] = useState(true);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(["selected-row"]));

  const handleReenter = useCallback(() => {
    setActive(true);
    setSelected(new Set(["selected-row"]));
  }, []);

  const handleCheckedChange = useCallback((checked: boolean) => {
    setSelected(checked ? new Set(["selected-row"]) : new Set());
  }, []);

  const handleCancel = useCallback(() => {
    setActive(false);
    setSelected(new Set());
  }, []);

  if (!active) {
    return (
      <Button variant="link" size="sm" onClick={handleReenter}>
        Re-enter multi-select mode
      </Button>
    );
  }

  return (
    <div className="grid w-full max-w-3xl gap-6">
      <MessageMultiSelect>
        <MessageItem>
          <MessageMultiSelectCheckbox
            aria-label="Select message"
            checked={selected.has("selected-row")}
            value="selected-row"
            onCheckedChange={handleCheckedChange}
          />
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
        </MessageItem>
      </MessageMultiSelect>

      <div className="grid gap-2">
        <MessageMultiSelectToolbarComposition onCancel={handleCancel}>
          {selected.size} selected
        </MessageMultiSelectToolbarComposition>
        <p className="text-xs text-foreground-muted">
          Copy, Forward, and Generate image are disabled in this isolated example because it has no
          selected-message payload.
        </p>
      </div>
    </div>
  );
}
