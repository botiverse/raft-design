import { useCallback, useMemo } from "react";
import type { MouseEventHandler, ReactElement } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MessageReactionPickerContent,
  MessageReactionQuickButton,
} from "raft-ui";

import { MESSAGE_QUICK_REACTIONS } from "#/modules/message-item/message-item.fixtures.ts";
import { MessageReactionGlyphComposition } from "./reaction-glyph.composition.tsx";

const COLLISION_AVOIDANCE = { side: "flip", align: "shift", fallbackAxisSide: "none" } as const;

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
  const portalProps = useMemo(
    () => (portalContainer ? { container: portalContainer } : undefined),
    [portalContainer],
  );

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={trigger} />
      <MessageReactionPickerContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionAvoidance={COLLISION_AVOIDANCE}
        collisionPadding={8}
        portalProps={portalProps}
        onMouseEnter={contentOnMouseEnter}
        onMouseLeave={contentOnMouseLeave}
      >
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <QuickReactionItem
            key={emoji}
            emoji={emoji}
            onOpenChange={onOpenChange}
            onReact={onReact}
          />
        ))}
      </MessageReactionPickerContent>
    </DropdownMenu>
  );
}

function QuickReactionItem({
  emoji,
  onOpenChange,
  onReact,
}: {
  emoji: string;
  onOpenChange: (open: boolean) => void;
  onReact: (emoji: string) => void;
}) {
  const handleClick = useCallback(() => {
    onReact(emoji);
    onOpenChange(false);
  }, [emoji, onOpenChange, onReact]);

  return (
    <DropdownMenuItem
      nativeButton
      render={
        <MessageReactionQuickButton
          title={`React with ${emoji}`}
          aria-label={`React with ${emoji}`}
        />
      }
      onClick={handleClick}
    >
      <MessageReactionGlyphComposition emoji={emoji} size={18} />
    </DropdownMenuItem>
  );
}
