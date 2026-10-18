import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Panel, PanelBody, PanelFooter, PanelHeaderRoot } from "../panel/panel";
import { threadPanel } from "./thread-panel.recipe";
import type { SlotElementProps } from "../../lib/data-attributes";

export type ThreadPanelRootProps = useRender.ComponentProps<"section">;

export function ThreadPanelRoot({ className, render, ...props }: ThreadPanelRootProps) {
  const { root } = threadPanel();

  return (
    <Panel
      {...props}
      render={render}
      edge="attached"
      data-slot="thread-panel-root"
      className={root({ className })}
    />
  );
}

export type ThreadPanelHeaderProps = useRender.ComponentProps<"div">;

export function ThreadPanelHeader({ className, render, ...props }: ThreadPanelHeaderProps) {
  const { header } = threadPanel();

  return (
    <PanelHeaderRoot
      {...props}
      render={render}
      data-panel-frame-header=""
      data-slot="thread-panel-header"
      className={header({ className })}
    />
  );
}

export type ThreadPanelContentProps = useRender.ComponentProps<"div">;

export function ThreadPanelContent({ className, render, ...props }: ThreadPanelContentProps) {
  const { content } = threadPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "thread-panel-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ThreadPanelTitleProps = useRender.ComponentProps<"h2">;

export function ThreadPanelTitle({ className, render, ...props }: ThreadPanelTitleProps) {
  const { title } = threadPanel();
  const defaultProps: SlotElementProps<"h2"> = {
    "data-slot": "thread-panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "h2",
    render,
    props: mergeProps<"h2">(defaultProps, props),
  });
}

export type ThreadPanelTitleMetaProps = useRender.ComponentProps<"span">;

export function ThreadPanelTitleMeta({ className, render, ...props }: ThreadPanelTitleMetaProps) {
  const { titleMeta } = threadPanel();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "thread-panel-title-meta",
    className: titleMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ThreadPanelActionsProps = useRender.ComponentProps<"div">;

export function ThreadPanelActions({ className, render, ...props }: ThreadPanelActionsProps) {
  const { actions } = threadPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "thread-panel-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ThreadPanelBodyProps = useRender.ComponentProps<"div">;

export function ThreadPanelBody({ className, render, ...props }: ThreadPanelBodyProps) {
  return (
    <PanelBody {...props} render={render} data-slot="thread-panel-body" className={className} />
  );
}

export type ThreadPanelOriginalMessageProps = Omit<useRender.ComponentProps<"div">, "render">;

export function ThreadPanelOriginalMessage({
  className,
  ...props
}: ThreadPanelOriginalMessageProps) {
  const { originalMessage } = threadPanel();

  return (
    <div
      {...props}
      data-slot="thread-panel-original-message"
      className={originalMessage({ className })}
    />
  );
}

export type ThreadPanelReplySummaryProps = useRender.ComponentProps<"div">;

export function ThreadPanelReplySummary({
  className,
  render,
  ...props
}: ThreadPanelReplySummaryProps) {
  const { replySummary } = threadPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "thread-panel-reply-summary",
    className: replySummary({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ThreadPanelReplyCountProps = useRender.ComponentProps<"div">;

export function ThreadPanelReplyCount({ className, render, ...props }: ThreadPanelReplyCountProps) {
  const { replyCount } = threadPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "thread-panel-reply-count",
    className: replyCount({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ThreadPanelFooterProps = useRender.ComponentProps<"div">;

export function ThreadPanelFooter({ className, render, ...props }: ThreadPanelFooterProps) {
  const { footer } = threadPanel();

  return (
    <PanelFooter
      {...props}
      render={render}
      data-slot="thread-panel-footer"
      className={footer({ className })}
    />
  );
}

export type ThreadPanelSearchProps = useRender.ComponentProps<"div">;

export function ThreadPanelSearch({ className, render, ...props }: ThreadPanelSearchProps) {
  const { search } = threadPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "thread-panel-search",
    className: search({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ThreadPanelSearchTrailingProps = useRender.ComponentProps<"div">;

export function ThreadPanelSearchTrailing({
  className,
  render,
  ...props
}: ThreadPanelSearchTrailingProps) {
  const { searchTrailing } = threadPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "thread-panel-search-trailing",
    className: searchTrailing({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ThreadPanelSearchCountProps = useRender.ComponentProps<"div">;

export function ThreadPanelSearchCount({
  className,
  render,
  ...props
}: ThreadPanelSearchCountProps) {
  const { searchCount } = threadPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "thread-panel-search-count",
    className: searchCount({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
