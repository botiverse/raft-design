import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useRender } from "@base-ui/react/use-render";
import { useEffect, useRef } from "react";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { DropdownMenuContent } from "../dropdown-menu/index";
import type { DropdownMenuContentProps } from "../dropdown-menu/index";
import { TooltipContent } from "../tooltip/index";
import type { TooltipContentProps } from "../tooltip/index";
import {
  messageReaction,
  reactionCountKeyframes,
  reactionCountTiming,
} from "./message-reaction.recipe";

export type MessageReactionChipProps = Omit<StyledProps<BaseToggle.Props>, "type">;

export function MessageReactionChip({ className, ...props }: MessageReactionChipProps) {
  const theme = useThemeFamily();
  const { chip } = messageReaction({ theme });

  return (
    <BaseToggle
      {...props}
      type="button"
      data-slot="message-reaction-chip"
      className={chip({ className })}
    />
  );
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

export type MessageReactionGlyphProps = useRender.ComponentProps<"span">;

export function MessageReactionGlyph({ className, render, ...props }: MessageReactionGlyphProps) {
  const { glyph: glyphSlot } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: glyphSlot({ className }),
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

export function MessageReactionCount({
  children,
  className,
  render,
  ...props
}: MessageReactionCountProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const value = typeof children === "number" && Number.isFinite(children) ? children : null;
  const previousValue = useRef(value);

  useEffect(() => {
    const previous = previousValue.current;
    previousValue.current = value;
    if (value === null || previous === null || value === previous) return;

    const element = elementRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element?.animate || reducedMotion.matches) return;

    const animation = element.animate(reactionCountKeyframes, reactionCountTiming);
    const handleMotionChange = () => {
      if (reducedMotion.matches) animation.cancel();
    };
    reducedMotion.addEventListener("change", handleMotionChange);
    return () => {
      animation.cancel();
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, [value]);

  const { count } = messageReaction();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: count({ className }),
    children,
    ref: elementRef,
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

export type MessageReactionPickerStaticProps = useRender.ComponentProps<"div">;

export function MessageReactionPickerStatic({
  className,
  render,
  ...props
}: MessageReactionPickerStaticProps) {
  const theme = useThemeFamily();
  const { pickerStatic } = messageReaction({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: pickerStatic({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-reaction-picker-static" },
  });
}

export type MessageReactionPickerContentProps = DropdownMenuContentProps;

export function MessageReactionPickerContent({
  className,
  ...props
}: MessageReactionPickerContentProps) {
  const theme = useThemeFamily();
  const { pickerContent } = messageReaction({ theme });

  return (
    <DropdownMenuContent
      data-slot="message-reaction-picker"
      className={pickerContent({ className })}
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
