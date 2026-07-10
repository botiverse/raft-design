import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./app-shell";

const messageTimeline = tv({
  slots: {
    dividerRoot: [],
    dividerRule: ["absolute inset-x-3 top-1/2 border-t-2"],
    dividerChipWrap: ["relative"],
    dividerChip: [
      "inline-flex items-center px-2",
      "text-[10px] font-bold uppercase tracking-widest",
    ],
    notice: ["pb-2 text-center font-mono text-xs"],
    limitedTag: ["inline-flex items-center gap-1.5 border px-2 py-1", "[&_svg]:size-3"],
  },
  variants: {
    theme: {
      brutal: {
        dividerRule: "border-black/15",
        dividerChipWrap: "bg-white",
        dividerChip: "bg-white text-black/50",
        limitedTag: "border-black/20 bg-white/70",
      },
      elegant: {
        dividerRule: "border-line-muted",
        dividerChipWrap: "bg-layer-panel",
        dividerChip: "bg-layer-panel text-foreground-muted",
        limitedTag: "rounded border-line-muted bg-layer-panel",
      },
    },
    sticky: {
      true: {
        dividerRoot: "pointer-events-none flex justify-center pt-1",
      },
      false: {
        dividerRoot: "relative flex select-none items-center justify-center px-3 py-2",
      },
    },
    tone: {
      faint: {
        notice: "text-foreground/40",
      },
      muted: {
        notice: "text-foreground/50",
      },
    },
  },
  defaultVariants: {
    sticky: false,
    tone: "faint",
  },
});

export type MessageTimelineDateDividerProps = useRender.ComponentProps<"div"> & {
  sticky?: boolean;
};

export function MessageTimelineDateDivider({
  children,
  className,
  render,
  sticky = false,
  ...props
}: MessageTimelineDateDividerProps) {
  const theme = useThemeFamily();
  const { dividerRoot, dividerRule, dividerChipWrap, dividerChip } = messageTimeline({
    theme,
    sticky,
  });
  const chip = <span className={dividerChip()}>{children}</span>;
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "message-timeline-date-divider",
    "data-sticky": sticky ? "true" : undefined,
    className: dividerRoot({ className }),
    children: sticky ? (
      chip
    ) : (
      <>
        <div aria-hidden className={dividerRule()} />
        <div className={dividerChipWrap()}>{chip}</div>
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type MessageTimelineNoticeProps = useRender.ComponentProps<"div"> & {
  tone?: "faint" | "muted";
};

export function MessageTimelineNotice({
  className,
  render,
  tone = "faint",
  ...props
}: MessageTimelineNoticeProps) {
  const { notice } = messageTimeline({ tone });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "message-timeline-notice",
    className: notice({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type MessageTimelineHistoryLimitedProps = useRender.ComponentProps<"span">;

export function MessageTimelineHistoryLimited({
  className,
  render,
  ...props
}: MessageTimelineHistoryLimitedProps) {
  const theme = useThemeFamily();
  const { limitedTag } = messageTimeline({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "message-timeline-history-limited",
    className: limitedTag({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
