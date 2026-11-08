import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { ScrollArea } from "../scroll-area/scroll-area";
import type { ScrollAreaProps } from "../scroll-area/types";
import { panel } from "./panel.recipe";

export type PanelEdge = "attached" | "inset";

export type PanelProps = useRender.ComponentProps<"section"> & {
  edge?: PanelEdge;
};

export function Panel({ className, edge, render, ...props }: PanelProps) {
  const { root } = panel({ edge });
  const defaultProps: SlotElementProps<"section"> = {
    "data-edge": edge,
    "data-slot": "panel",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type PanelHeaderRootProps = useRender.ComponentProps<"div">;

/**
 * Bare header bar: fixed height and centered flex row, no border, fill, or padding.
 * Shared base for `PanelHeader`, `PanelSectionHeader`, and panel-specific headers
 * such as `ThreadPanelHeader` — it is not exclusive to `PanelHeader`.
 */
export function PanelHeaderRoot({ className, render, ...props }: PanelHeaderRootProps) {
  const { header } = panel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-header-root",
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelBodyProps = useRender.ComponentProps<"div">;

export function PanelBody({ className, render, ...props }: PanelBodyProps) {
  const { body } = panel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-body",
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelScrollViewportProps = ScrollAreaProps;

/**
 * The panel's one scroll container, a ScrollArea: its overlay scrollbar takes
 * no room and looks the same on every platform, and a scroll that reaches the
 * end stops there (`overscroll="contain"`). `ref`, `className`, `render` and
 * the native props are the scrolling element's; ScrollArea's options pass
 * through.
 */
export function PanelScrollViewport({ className, ...props }: PanelScrollViewportProps) {
  const { scrollViewport } = panel();
  return (
    <ScrollArea
      data-slot="panel-scroll-viewport"
      overscroll="contain"
      {...props}
      className={scrollViewport({ className })}
    />
  );
}

/**
 * The panel's native scroller, for MessageList's phone path only, which
 * scrolls natively below 768px (message-list.md#behavior). Not exported from
 * the package.
 */
export function PanelNativeScrollViewport({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const { nativeScrollViewport } = panel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-scroll-viewport",
    className: nativeScrollViewport({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelScrollContentProps = useRender.ComponentProps<"div">;

export function PanelScrollContent({ className, render, ...props }: PanelScrollContentProps) {
  const { scrollContent } = panel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-scroll-content",
    className: scrollContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelSectionProps = useRender.ComponentProps<"section">;

export function PanelSection({ className, render, ...props }: PanelSectionProps) {
  const { section } = panel();
  const defaultProps: SlotElementProps<"section"> = {
    "data-slot": "panel-section",
    className: section({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type PanelFooterProps = useRender.ComponentProps<"div">;

export function PanelFooter({ className, render, ...props }: PanelFooterProps) {
  const { footer } = panel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
