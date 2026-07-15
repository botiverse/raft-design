import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tv } from "../../lib/tv";

const chatMainPanelEmptyState = tv({
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
        root: "font-display text-lg font-bold text-black/40 uppercase",
      },
      elegant: {
        root: "font-heading text-sm font-medium tracking-wide text-foreground-muted",
        brand: "block bg-primary-100 shadow-md ring-1 ring-line-subtle/45",
        brandMark: [
          "bg-primary-400 shadow-md ring-1 ring-line-subtle/45",
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_3%)_100%)] before:content-['']",
        ],
      },
    },
  },
});

export type ChatMainPanelEmptyStateProps = useRender.ComponentProps<"div">;

export function ChatMainPanelEmptyState({
  className,
  render,
  ...props
}: ChatMainPanelEmptyStateProps) {
  const theme = useThemeFamily();
  const { root } = chatMainPanelEmptyState({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-empty-state",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelEmptyStateBrandProps = useRender.ComponentProps<"div">;

export function ChatMainPanelEmptyStateBrand({
  className,
  render,
  ...props
}: ChatMainPanelEmptyStateBrandProps) {
  const theme = useThemeFamily();
  const { brand } = chatMainPanelEmptyState({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-empty-state-brand",
    className: brand({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelEmptyStateBrandMarkProps = useRender.ComponentProps<"div">;

export function ChatMainPanelEmptyStateBrandMark({
  className,
  render,
  ...props
}: ChatMainPanelEmptyStateBrandMarkProps) {
  const theme = useThemeFamily();
  const { brandMark } = chatMainPanelEmptyState({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-empty-state-brand-mark",
    className: brandMark({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
