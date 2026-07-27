import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  messageReference,
  type MessageReferenceChipTone,
  type MessageReferenceChipToneProps,
} from "./message-reference.recipe";
import { type SlotElementProps } from "../../lib/data-attributes";

export type { MessageReferenceChipTone, MessageReferenceChipToneProps };

type SpanProps = useRender.ComponentProps<"span">;

function useReferenceRender(
  className: string,
  render: SpanProps["render"],
  props: Omit<SpanProps, "className" | "render">,
) {
  const defaultProps: SlotElementProps<"span"> = {
    "data-message-reference": "",
    className,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference" },
  });
}

export type MessageReferenceTextProps = SpanProps;

export function MessageReferenceText({ className, render, ...props }: MessageReferenceTextProps) {
  const theme = useThemeFamily();
  const { text } = messageReference({ theme });

  return useReferenceRender(text({ className }), render, props);
}

export type MessageReferenceChipProps = SpanProps & Omit<MessageReferenceChipToneProps, "theme">;

export function MessageReferenceChip({
  className,
  render,
  tone = "muted",
  ...props
}: MessageReferenceChipProps) {
  const theme = useThemeFamily();
  const { chip } = messageReference({ theme, tone });

  return useReferenceRender(chip({ className }), render, props);
}

export type MessageReferenceLabelProps = useRender.ComponentProps<"span">;

export function MessageReferenceLabel({ className, render, ...props }: MessageReferenceLabelProps) {
  const { label } = messageReference();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: label({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-label" },
  });
}

export type MessageReferenceMetaProps = useRender.ComponentProps<"span">;

export function MessageReferenceMeta({ className, render, ...props }: MessageReferenceMetaProps) {
  const theme = useThemeFamily();
  const { meta } = messageReference({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-meta" },
  });
}

export type MessageReferencePendingProps = SpanProps;

export function MessageReferencePending({
  className,
  render,
  ...props
}: MessageReferencePendingProps) {
  const theme = useThemeFamily();
  const { pending } = messageReference({ theme });

  return useReferenceRender(pending({ className }), render, props);
}

export type MessageReferenceUnavailableProps = SpanProps;

export function MessageReferenceUnavailable({
  className,
  render,
  ...props
}: MessageReferenceUnavailableProps) {
  const theme = useThemeFamily();
  const { unavailable } = messageReference({ theme });

  return useReferenceRender(unavailable({ className }), render, props);
}
