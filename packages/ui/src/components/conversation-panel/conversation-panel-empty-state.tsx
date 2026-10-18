import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";

const conversationPanelEmptyState = tv({
  slots: {
    root: [
      "flex h-full min-h-0 min-w-0 flex-1 flex-col items-center justify-center",
      "text-center",
      "gap-2 px-5 py-6",
      "font-sans text-headline font-bold normal-case text-foreground-muted",
    ],
    brand: ["shrink-0", "mb-1 inline-flex rounded-none p-0 text-foreground-hint"],
    brandMark: [
      "relative flex items-center justify-center",
      "[&>svg]:relative [&>svg]:z-10",
      "size-9 overflow-visible rounded-none",
      "[&>svg]:size-9 [&>svg]:stroke-2",
    ],
  },
});

export type ConversationPanelEmptyStateProps = useRender.ComponentProps<"div">;

export function ConversationPanelEmptyState({
  className,
  render,
  ...props
}: ConversationPanelEmptyStateProps) {
  const { root } = conversationPanelEmptyState();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-empty-state",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelEmptyStateBrandProps = useRender.ComponentProps<"div">;

export function ConversationPanelEmptyStateBrand({
  className,
  render,
  ...props
}: ConversationPanelEmptyStateBrandProps) {
  const { brand } = conversationPanelEmptyState();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-empty-state-brand",
    className: brand({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelEmptyStateBrandMarkProps = useRender.ComponentProps<"div">;

export function ConversationPanelEmptyStateBrandMark({
  className,
  render,
  ...props
}: ConversationPanelEmptyStateBrandMarkProps) {
  const { brandMark } = conversationPanelEmptyState();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-empty-state-brand-mark",
    className: brandMark({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
