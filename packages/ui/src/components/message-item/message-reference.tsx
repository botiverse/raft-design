import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  messageReference,
  type MessageReferenceVariant,
  type MessageReferenceVariantProps,
} from "./message-reference.recipe";
import { type SlotElementProps } from "../../lib/data-attributes";

export type { MessageReferenceVariant, MessageReferenceVariantProps };

export type MessageReferenceProps = useRender.ComponentProps<"span"> &
  Omit<MessageReferenceVariantProps, "theme">;

export function MessageReference({
  className,
  render,
  variant = "conversation",
  ...props
}: MessageReferenceProps) {
  const theme = useThemeFamily();
  const { root } = messageReference({ theme, variant });
  const defaultProps: SlotElementProps<"span"> = {
    "data-message-reference": "",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-reference",
      variant,
    },
  });
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
