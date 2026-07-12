import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { DropdownMenuContent, type DropdownMenuContentProps } from "../dropdown-menu/index";
import { TooltipContent, type TooltipContentProps } from "../tooltip/index";
import { messageReaction } from "./message-reaction.recipe";
import { type DataAttributes } from "../../lib/data-attributes";

export type MessageReactionChipProps = useRender.ComponentProps<"button">;

export function MessageReactionChip({ className, render, ...props }: MessageReactionChipProps) {
  const theme = useThemeFamily();
  const { chip } = messageReaction({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: chip({ className }),
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

export type MessageReactionErrorIndicatorProps = useRender.ComponentProps<"span">;

export function MessageReactionErrorIndicator({
  className,
  render,
  ...props
}: MessageReactionErrorIndicatorProps) {
  const { errorIndicator } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: errorIndicator({ className }),
    role: "status",
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-error-indicator",
    },
  });
}

export type MessageReactionGlyphProps = useRender.ComponentProps<"span"> & {
  emoji?: string;
  size?: number;
};

export function MessageReactionGlyph({
  children,
  className,
  emoji,
  render,
  size = 15,
  style,
  ...props
}: MessageReactionGlyphProps) {
  const { glyph: glyphSlot } = messageReaction();
  const glyph = emoji ?? (typeof children === "string" ? children : undefined);
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-label": glyph,
    "data-emoji": glyph ? "true" : undefined,
    children: glyph ?? children,
    className: glyphSlot({ className }),
    role: glyph ? "img" : undefined,
    style: glyph
      ? {
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
  const { count } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: count({ className }),
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
  const theme = useThemeFamily();
  const { addButton } = messageReaction({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: addButton({ className }),
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
  const theme = useThemeFamily();
  const { quickRow } = messageReaction({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: quickRow({ className }),
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
  const theme = useThemeFamily();
  const { quickButton } = messageReaction({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: quickButton({ className }),
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

export type MessageReactionPickerPanelProps = useRender.ComponentProps<"div">;

export function MessageReactionPickerPanel({
  className,
  render,
  ...props
}: MessageReactionPickerPanelProps) {
  const theme = useThemeFamily();
  const { pickerSurface } = messageReaction({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: pickerSurface({ className }),
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

export type MessageReactionPickerContentProps = DropdownMenuContentProps;

export function MessageReactionPickerContent({
  className,
  ...props
}: MessageReactionPickerContentProps) {
  const theme = useThemeFamily();
  const { pickerSurface } = messageReaction({ theme });

  return (
    <DropdownMenuContent
      data-slot="message-reaction-picker"
      className={pickerSurface({ className })}
      {...props}
    />
  );
}

export type MessageReactionTooltipContentProps = TooltipContentProps;

export function MessageReactionTooltipContent({
  className,
  ...props
}: MessageReactionTooltipContentProps) {
  const theme = useThemeFamily();
  const { tooltip } = messageReaction({ theme });
  return <TooltipContent className={tooltip({ className })} {...props} />;
}

export type MessageReactionTooltipNamesProps = useRender.ComponentProps<"span">;

export function MessageReactionTooltipNames({
  className,
  render,
  ...props
}: MessageReactionTooltipNamesProps) {
  const { tooltipNames } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: tooltipNames({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-tooltip-names",
    },
  });
}

export type MessageReactionTooltipNameProps = useRender.ComponentProps<"span">;

export function MessageReactionTooltipName({
  className,
  render,
  ...props
}: MessageReactionTooltipNameProps) {
  const { tooltipName } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: tooltipName({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-tooltip-name",
    },
  });
}

export type MessageReactionTooltipNameTextProps = useRender.ComponentProps<"span">;

export function MessageReactionTooltipNameText({
  className,
  render,
  ...props
}: MessageReactionTooltipNameTextProps) {
  const { tooltipNameText } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: tooltipNameText({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-tooltip-name-text",
    },
  });
}

export type MessageReactionTooltipSeparatorProps = useRender.ComponentProps<"span">;

export function MessageReactionTooltipSeparator({
  className,
  render,
  ...props
}: MessageReactionTooltipSeparatorProps) {
  const { tooltipSeparator } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: tooltipSeparator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-tooltip-separator",
    },
  });
}

export type MessageReactionTooltipMetaProps = useRender.ComponentProps<"span">;

export function MessageReactionTooltipMeta({
  className,
  render,
  ...props
}: MessageReactionTooltipMetaProps) {
  const { tooltipMeta } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: tooltipMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reaction-tooltip-meta",
    },
  });
}
