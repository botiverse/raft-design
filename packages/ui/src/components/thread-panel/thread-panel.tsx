import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "../panel/panel";
import { threadPanel } from "./thread-panel.recipe";
import type { SlotElementProps } from "../../lib/data-attributes";

export type ThreadPanelRootProps = useRender.ComponentProps<"section">;

export function ThreadPanelRoot({ className, render, ...props }: ThreadPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = threadPanel({ theme });

  return (
    <Panel
      {...props}
      render={render}
      data-slot="thread-panel-root"
      className={root({ className })}
    />
  );
}

export type ThreadPanelHeaderProps = useRender.ComponentProps<"div">;

export function ThreadPanelHeader({ className, render, ...props }: ThreadPanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = threadPanel({ theme });

  return (
    <PanelHeader
      {...props}
      render={render}
      data-slot="thread-panel-header"
      className={header({ className })}
    />
  );
}

export type ThreadPanelContentProps = useRender.ComponentProps<"div">;

export function ThreadPanelContent({ className, render, ...props }: ThreadPanelContentProps) {
  const theme = useThemeFamily();
  const { content } = threadPanel({ theme });
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
  const theme = useThemeFamily();
  const { title } = threadPanel({ theme });
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
  const theme = useThemeFamily();
  const { titleMeta } = threadPanel({ theme });
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
  const theme = useThemeFamily();
  const { actions } = threadPanel({ theme });
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

export type ThreadPanelOriginalMessageProps = useRender.ComponentProps<"div">;

export function ThreadPanelOriginalMessage({
  className,
  render,
  ...props
}: ThreadPanelOriginalMessageProps) {
  const theme = useThemeFamily();
  const { originalMessage } = threadPanel({ theme });
  const defaultProps: SlotElementProps<"div"> & {
    "data-thread-panel-slot": "original-message";
  } = {
    ...(render ? {} : { "data-slot": "thread-panel-original-message" }),
    "data-thread-panel-slot": "original-message",
    className: originalMessage({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ThreadPanelReplyCountProps = useRender.ComponentProps<"div">;

export function ThreadPanelReplyCount({ className, render, ...props }: ThreadPanelReplyCountProps) {
  const theme = useThemeFamily();
  const { replyCount } = threadPanel({ theme });
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
  const theme = useThemeFamily();
  const { footer } = threadPanel({ theme });

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
  const theme = useThemeFamily();
  const { search } = threadPanel({ theme });
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

export type ThreadPanelSearchIconProps = useRender.ComponentProps<"span">;

export function ThreadPanelSearchIcon({ className, render, ...props }: ThreadPanelSearchIconProps) {
  const theme = useThemeFamily();
  const { searchIcon } = threadPanel({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "thread-panel-search-icon",
    className: searchIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ThreadPanelSearchCountProps = useRender.ComponentProps<"div">;

export function ThreadPanelSearchCount({
  className,
  render,
  ...props
}: ThreadPanelSearchCountProps) {
  const theme = useThemeFamily();
  const { searchCount } = threadPanel({ theme });
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
