import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Skeleton } from "../skeleton";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem } from "./message-item.recipe";

export type MessageItemTranslationTone = "normal" | "pending" | "failed";

export type MessageItemTranslationPlaceholderProps = useRender.ComponentProps<"div">;

export function MessageItemTranslationPlaceholder({
  className,
  ...props
}: MessageItemTranslationPlaceholderProps) {
  const theme = useThemeFamily();
  const { translationPlaceholder } = messageItem({ theme });

  return (
    <Skeleton
      variant="block"
      data-slot="message-item-translation-placeholder"
      className={translationPlaceholder({ className })}
      {...props}
    />
  );
}

export type MessageItemTranslationOriginalProps = useRender.ComponentProps<"div">;

export function MessageItemTranslationOriginal({
  className,
  render,
  ...props
}: MessageItemTranslationOriginalProps) {
  const theme = useThemeFamily();
  const { translationOriginal } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: translationOriginal({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-translation-original" },
  });
}

export type MessageItemTranslationOriginalLabelProps = useRender.ComponentProps<"div">;

export function MessageItemTranslationOriginalLabel({
  className,
  render,
  ...props
}: MessageItemTranslationOriginalLabelProps) {
  const theme = useThemeFamily();
  const { translationOriginalLabel } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: translationOriginalLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-translation-original-label" },
  });
}

export type MessageItemTranslationStatusProps = useRender.ComponentProps<"div"> & {
  tone?: MessageItemTranslationTone;
};

export function MessageItemTranslationStatus({
  className,
  render,
  tone = "normal",
  ...props
}: MessageItemTranslationStatusProps) {
  const theme = useThemeFamily();
  const { translationStatus } = messageItem({ theme, translationTone: tone });
  const defaultProps: SlotElementProps<"div"> = {
    "data-tone": tone,
    className: translationStatus({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-translation-status", tone },
  });
}

export type MessageItemTranslationActionProps = useRender.ComponentProps<"button">;

export function MessageItemTranslationAction({
  className,
  render,
  ...props
}: MessageItemTranslationActionProps) {
  const theme = useThemeFamily();
  const { translationAction } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: translationAction({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-item-translation-action" },
  });
}
