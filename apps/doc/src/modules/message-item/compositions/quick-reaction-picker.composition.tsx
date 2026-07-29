import type { MouseEventHandler, ReactElement } from "react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "raft-ui";
import { MessageReactionPickerContent, MessageReactionQuickButton } from "raft-ui/wip";
import { MESSAGE_QUICK_REACTIONS } from "#/modules/message-item/message-item.fixtures.ts";
import { MessageReactionGlyphComposition } from "./reaction-glyph.composition.tsx";

export type MessageQuickReactionPickerProps = {
  align: "center" | "end" | "start";
  contentOnMouseEnter?: MouseEventHandler<HTMLDivElement>;
  contentOnMouseLeave?: MouseEventHandler<HTMLDivElement>;
  onOpenChange: (open: boolean) => void;
  onReact: (emoji: string) => void;
  open: boolean;
  portalContainer?: HTMLElement | null;
  side: "bottom" | "top";
  sideOffset?: number;
  trigger: ReactElement;
};

export function MessageQuickReactionPicker({
  align,
  contentOnMouseEnter,
  contentOnMouseLeave,
  onOpenChange,
  onReact,
  open,
  portalContainer,
  side,
  sideOffset,
  trigger,
}: MessageQuickReactionPickerProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={trigger} />
      <MessageReactionPickerContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "none" }}
        collisionPadding={8}
        portalProps={portalContainer ? { container: portalContainer } : undefined}
        onMouseEnter={contentOnMouseEnter}
        onMouseLeave={contentOnMouseLeave}
      >
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <DropdownMenuItem
            key={emoji}
            nativeButton
            render={
              <MessageReactionQuickButton
                title={`React with ${emoji}`}
                aria-label={`React with ${emoji}`}
              />
            }
            onClick={() => {
              onReact(emoji);
              onOpenChange(false);
            }}
          >
            <MessageReactionGlyphComposition emoji={emoji} size={18} />
          </DropdownMenuItem>
        ))}
      </MessageReactionPickerContent>
    </DropdownMenu>
  );
}
