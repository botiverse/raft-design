import { type ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageReference, type MessageReferenceChipVariant } from "./message-reference.recipe";
import { type SlotElementProps } from "../../lib/data-attributes";

export type { MessageReferenceChipVariant };

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
  const { chip } = messageReference({ theme, variant });

  return useReferenceRender(chip({ className }), render, props);
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

export type MessageReferenceBadgeProps = useRender.ComponentProps<"span"> & {
  /** Sugar for a plain caption. Compose `MessageReferenceBadgeLabel` directly for richer content. */
  label?: ReactNode;
};

export function MessageReferenceBadge({
  children,
  className,
  label,
  render,
  ...props
}: MessageReferenceBadgeProps) {
  const theme = useThemeFamily();
  const { badge } = messageReference({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-message-reference-badge": "",
    className: badge({ className }),
    children: (
      <>
        {children}
        {label === undefined ? null : (
          <MessageReferenceBadgeLabel>{label}</MessageReferenceBadgeLabel>
        )}
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-badge" },
  });
}

export type MessageReferenceBadgeLabelProps = useRender.ComponentProps<"span">;

export function MessageReferenceBadgeLabel({
  className,
  render,
  ...props
}: MessageReferenceBadgeLabelProps) {
  const theme = useThemeFamily();
  const { badgeLabel } = messageReference({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: badgeLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-badge-label" },
  });
}

export type MessageReferenceMetaProps = useRender.ComponentProps<"span">;

export function MessageReferenceMeta({ className, render, ...props }: MessageReferenceMetaProps) {
  const theme = useThemeFamily();
  const { chipMeta } = messageReference({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: chipMeta({ className }),
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
