import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { messageItem, type DataAttributes } from "./recipe";
import { REACTION_SPRITE_DATA_URI } from "./reaction-sprite";

export const MESSAGE_QUICK_REACTIONS = ["👍", "❤️", "🎉", "👀", "🔥", "😂", "✅"] as const;

const REACTION_SPRITE_PATH = REACTION_SPRITE_DATA_URI;
const REACTION_SPRITE_WIDTH = 168;
const REACTION_SPRITE_HEIGHT = 24;
const REACTION_SPRITE_ITEMS = {
  "👍": { id: "thumbs_up", x: 0, y: 0, width: 24, height: 24 },
  "❤️": { id: "heart", x: 24, y: 0, width: 24, height: 24 },
  "❤": { id: "heart", x: 24, y: 0, width: 24, height: 24 },
  "🎉": { id: "party_popper", x: 48, y: 0, width: 24, height: 24 },
  "👀": { id: "eyes", x: 72, y: 0, width: 24, height: 24 },
  "🔥": { id: "fire", x: 96, y: 0, width: 24, height: 24 },
  "😂": { id: "joy", x: 120, y: 0, width: 24, height: 24 },
  "✅": { id: "check_mark", x: 144, y: 0, width: 24, height: 24 },
} as const;

export type MessageReactionChipProps = useRender.ComponentProps<"button"> & {
  reacted?: boolean;
  failed?: boolean;
};

export function MessageReactionChip({
  reacted,
  failed,
  className,
  render,
  ...props
}: MessageReactionChipProps) {
  const { reactionChip } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-reacted": reacted ? "true" : undefined,
    "data-failed": failed ? "true" : undefined,
    className: reactionChip({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-reaction-chip",
    },
  });
}

export type MessageReactionGlyphProps = useRender.ComponentProps<"span"> & {
  emoji?: string;
  size?: number;
  spritePath?: string;
};

export function MessageReactionGlyph({
  children,
  className,
  emoji,
  render,
  size = 15,
  spritePath = REACTION_SPRITE_PATH,
  style,
  ...props
}: MessageReactionGlyphProps) {
  const { reactionGlyph } = messageItem();
  const glyph = emoji ?? (typeof children === "string" ? children : undefined);
  const spriteItem = glyph
    ? REACTION_SPRITE_ITEMS[glyph as keyof typeof REACTION_SPRITE_ITEMS]
    : undefined;
  const spriteScale = spriteItem ? size / spriteItem.width : 1;
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-label": spriteItem ? glyph : undefined,
    "data-emoji": glyph ? "true" : undefined,
    "data-reaction-glyph": spriteItem?.id,
    "data-reaction-sprite-path": spriteItem ? spritePath : undefined,
    children: spriteItem ? undefined : (glyph ?? children),
    className: reactionGlyph({ className }),
    role: spriteItem ? "img" : undefined,
    style: glyph
      ? {
          backgroundImage: spriteItem ? `url(${spritePath})` : undefined,
          backgroundPosition: spriteItem
            ? `${-spriteItem.x * spriteScale}px ${-spriteItem.y * spriteScale}px`
            : undefined,
          backgroundRepeat: spriteItem ? "no-repeat" : undefined,
          backgroundSize: spriteItem
            ? `${REACTION_SPRITE_WIDTH * spriteScale}px ${REACTION_SPRITE_HEIGHT * spriteScale}px`
            : undefined,
          fontSize: size,
          height: size,
          lineHeight: 1,
          width: size,
          ...style,
        }
      : style,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-glyph",
    },
  });
}

export type MessageReactionCountProps = useRender.ComponentProps<"span">;

export function MessageReactionCount({ className, render, ...props }: MessageReactionCountProps) {
  const { reactionCount } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: reactionCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-count",
    },
  });
}

export type MessageReactionAddButtonProps = useRender.ComponentProps<"button">;

export function MessageReactionAddButton({
  className,
  render,
  ...props
}: MessageReactionAddButtonProps) {
  const { reactionAddButton } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: reactionAddButton({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-reaction-add-button",
    },
  });
}

export type MessageReactionQuickRowProps = useRender.ComponentProps<"div">;

export function MessageReactionQuickRow({
  className,
  render,
  ...props
}: MessageReactionQuickRowProps) {
  const { reactionQuickRow } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: reactionQuickRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-reaction-quick-row",
    },
  });
}

export type MessageReactionQuickButtonProps = useRender.ComponentProps<"button">;

export function MessageReactionQuickButton({
  className,
  render,
  ...props
}: MessageReactionQuickButtonProps) {
  const { reactionQuickButton } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: reactionQuickButton({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-reaction-quick-button",
    },
  });
}

export type MessageReactionPickerProps = useRender.ComponentProps<"div">;

export function MessageReactionPicker({ className, render, ...props }: MessageReactionPickerProps) {
  const { reactionPicker } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: reactionPicker({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-reaction-picker",
    },
  });
}

export type MessageReactionPopoverProps = useRender.ComponentProps<"div">;

export function MessageReactionPopover({
  className,
  render,
  ...props
}: MessageReactionPopoverProps) {
  const { reactionPopover } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: reactionPopover({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-reaction-popover",
    },
  });
}

export type MessageReactionPopoverNamesProps = useRender.ComponentProps<"div">;

export function MessageReactionPopoverNames({
  className,
  render,
  ...props
}: MessageReactionPopoverNamesProps) {
  const { reactionPopoverNames } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: reactionPopoverNames({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-reaction-popover-names",
    },
  });
}

export type MessageReactionPopoverNameProps = useRender.ComponentProps<"span">;

export function MessageReactionPopoverName({
  className,
  render,
  ...props
}: MessageReactionPopoverNameProps) {
  const { reactionPopoverName } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: reactionPopoverName({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-popover-name",
    },
  });
}

export type MessageReactionPopoverNameTextProps = useRender.ComponentProps<"span">;

export function MessageReactionPopoverNameText({
  className,
  render,
  ...props
}: MessageReactionPopoverNameTextProps) {
  const { reactionPopoverNameText } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: reactionPopoverNameText({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-popover-name-text",
    },
  });
}

export type MessageReactionPopoverSeparatorProps = useRender.ComponentProps<"span">;

export function MessageReactionPopoverSeparator({
  className,
  render,
  ...props
}: MessageReactionPopoverSeparatorProps) {
  const { reactionPopoverSeparator } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: reactionPopoverSeparator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-popover-separator",
    },
  });
}
