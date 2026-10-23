import { Check } from "lucide-react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Status } from "../status/status";
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

export type MessageReferenceReadMarkProps = useRender.ComponentProps<"span">;

/**
 * The read receipt on a mention: the online light (8px, lime, ink edge) with
 * an ink check in it, at the mention's top right, once the one mentioned has
 * read the message. Put it last inside the mention, and render nothing until
 * then. The light and check are decorative; `children` is what a screen
 * reader says instead ("Read"), visually hidden.
 */
export function MessageReferenceReadMark({
  children,
  className,
  render,
  ...props
}: MessageReferenceReadMarkProps) {
  const { readMark } = messageReference();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: readMark({ className }),
    children: (
      <>
        <Status presence="online" size="sm" aria-hidden />
        <Check aria-hidden strokeWidth={3} />
        {children == null ? null : <span className="sr-only">{children}</span>}
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-read-mark" },
  });
}

export type MessageReferenceChipProps = SpanProps & {
  variant?: MessageReferenceChipVariant;
  /**
   * Stops the chip at `min(100%, 24em)`; a longer `MessageReferenceLabel`
   * truncates at the end. For words Raft doesn't write, such as an app's title.
   */
  capped?: boolean;
};

export function MessageReferenceChip({
  className,
  render,
  variant = "muted",
  capped,
  ...props
}: MessageReferenceChipProps) {
  const { root } = messageReference({ variant, capped });

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

export type MessageReferenceSuffixProps = useRender.ComponentProps<"span">;

/** A short note after a chip's label in muted machine type, such as `msg` on a
 *  link to a message. It lines up with the label by the middle of its letters. */
export function MessageReferenceSuffix({
  className,
  render,
  ...props
}: MessageReferenceSuffixProps) {
  const { suffix } = messageReference();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: suffix({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-suffix" },
  });
}

export type MessageReferenceIconProps = useRender.ComponentProps<"span">;

/**
 * The chip's leading icon when it is not a plain svg: an image or a `3xs`
 * Avatar, such as an app's registered icon. It holds one child at 14px,
 * centred on the chip. Put it first in the chip.
 */
export function MessageReferenceIcon({ className, render, ...props }: MessageReferenceIconProps) {
  const { icon } = messageReference();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-icon" },
  });
}

export type MessageReferencePendingProps = SpanProps & {
  /** The same cap as `MessageReferenceChip`'s, so the chip that replaces it keeps its width. */
  capped?: boolean;
};

export function MessageReferencePending({
  className,
  render,
  capped,
  ...props
}: MessageReferencePendingProps) {
  const { root } = messageReference({ variant: "pending", capped });

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
