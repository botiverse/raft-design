import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { messageReference } from "./message-reference.recipe";
import type {
  MessageReferenceChipVariant,
  MessageReferenceTextVariant,
} from "./message-reference.recipe";
import type { SlotElementProps } from "../../lib/data-attributes";

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
  const { root } = messageReference({ variant });

  return useReferenceRender(root({ className }), render, props);
}

export type MessageReferenceIndicatorProps = useRender.ComponentProps<"span">;

export function MessageReferenceIndicator({
  className,
  render,
  ...props
}: MessageReferenceIndicatorProps) {
  const { indicator } = messageReference();
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
  const { root } = messageReference({ variant });

  return useReferenceRender(root({ className }), render, props);
}

export type MessageReferenceLabelProps = useRender.ComponentProps<"span">;

export function MessageReferenceLabel({ className, render, ...props }: MessageReferenceLabelProps) {
  const { chipLabel } = messageReference();
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

export type MessageReferencePendingProps = SpanProps;

export function MessageReferencePending({
  className,
  render,
  ...props
}: MessageReferencePendingProps) {
  const { root } = messageReference({ variant: "pending" });

  return useReferenceRender(root({ className }), render, props);
}

export type MessageReferenceUnavailableProps = SpanProps;

export function MessageReferenceUnavailable({
  className,
  render,
  ...props
}: MessageReferenceUnavailableProps) {
  const { root } = messageReference({ variant: "unavailable" });

  return useReferenceRender(root({ className }), render, props);
}
