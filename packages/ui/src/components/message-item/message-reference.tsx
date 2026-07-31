import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  messageReference,
  type MessageReferenceChipVariant,
  type MessageReferenceTextVariant,
} from "./message-reference.recipe";
import { type SlotElementProps } from "../../lib/data-attributes";

export type { MessageReferenceChipVariant, MessageReferenceTextVariant };

type SpanProps = useRender.ComponentProps<"span">;

function useReferenceRender(
  className: string,
  render: SpanProps["render"],
  props: Omit<SpanProps, "className" | "render">,
) {
  const defaultProps: SlotElementProps<"span"> = {
    className,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference" },
  });
}

export type MessageReferenceTextProps = SpanProps & {
  variant?: MessageReferenceTextVariant;
};

export function MessageReferenceText({
  className,
  render,
  variant = "secondary",
  ...props
}: MessageReferenceTextProps) {
  const theme = useThemeFamily();
  const { root } = messageReference({ theme, variant });

  return useReferenceRender(root({ className }), render, props);
}

export type MessageReferenceIndicatorProps = useRender.ComponentProps<"span">;

export function MessageReferenceIndicator({
  className,
  render,
  ...props
}: MessageReferenceIndicatorProps) {
  const theme = useThemeFamily();
  const { indicator } = messageReference({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: indicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-indicator" },
  });
}

export type MessageReferenceChipProps = SpanProps & {
  variant?: MessageReferenceChipVariant;
};

export function MessageReferenceChip({
  className,
  render,
  variant = "muted",
  ...props
}: MessageReferenceChipProps) {
  const theme = useThemeFamily();
  const { root } = messageReference({ theme, variant });

  return useReferenceRender(root({ className }), render, props);
}

export type MessageReferenceLabelProps = useRender.ComponentProps<"span">;

export function MessageReferenceLabel({ className, render, ...props }: MessageReferenceLabelProps) {
  const theme = useThemeFamily();
  const { chipLabel } = messageReference({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: chipLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-label" },
  });
}

export type MessageReferenceBadgeProps = useRender.ComponentProps<"span">;

export function MessageReferenceBadge({ className, render, ...props }: MessageReferenceBadgeProps) {
  const theme = useThemeFamily();
  const { badge } = messageReference({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-message-reference-badge": "",
    className: badge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-badge" },
  });
}

export type MessageReferencePendingProps = SpanProps;

export function MessageReferencePending({
  className,
  render,
  ...props
}: MessageReferencePendingProps) {
  const theme = useThemeFamily();
  const { root } = messageReference({ theme, variant: "pending" });

  return useReferenceRender(root({ className }), render, props);
}

export type MessageReferenceUnavailableProps = SpanProps;

export function MessageReferenceUnavailable({
  className,
  render,
  ...props
}: MessageReferenceUnavailableProps) {
  const theme = useThemeFamily();
  const { root } = messageReference({ theme, variant: "unavailable" });

  return useReferenceRender(root({ className }), render, props);
}
