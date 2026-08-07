import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tv } from "../../lib/tv";

const conversationPanelEmptyState = tv({
  slots: {
    root: [
      "flex h-full min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3",
      "text-center",
    ],
    brand: ["hidden shrink-0 rounded-md p-0.5"],
    brandMark: [
      "relative flex size-8 items-center justify-center overflow-hidden rounded-sm",
      "[&>svg]:relative [&>svg]:z-10 [&>svg]:h-5 [&>svg]:w-auto",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "font-heading text-lg font-bold text-black/40 uppercase",
      },
      elegant: {
        root: "font-heading text-sm font-medium tracking-wide text-foreground-muted",
        brand:
          "block bg-primary-100 shadow-raft-md ring-1 ring-line-muted/45 dark:ring-transparent",
        brandMark: [
          "bg-primary-400 shadow-raft-md ring-1 ring-line-muted/45 dark:ring-transparent",
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/3%)_100%)] before:content-['']",
          "dark:before:hidden",
        ],
      },
    },
  },
});

export type ConversationPanelEmptyStateProps = useRender.ComponentProps<"div">;

export function ConversationPanelEmptyState({
  className,
  render,
  ...props
}: ConversationPanelEmptyStateProps) {
  const theme = useThemeFamily();
  const { root } = conversationPanelEmptyState({ theme });
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
  const theme = useThemeFamily();
  const { brand } = conversationPanelEmptyState({ theme });
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
  const theme = useThemeFamily();
  const { brandMark } = conversationPanelEmptyState({ theme });
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
