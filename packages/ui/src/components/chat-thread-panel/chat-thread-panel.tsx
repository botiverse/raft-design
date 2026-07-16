import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelScrollContent,
  PanelScrollbar,
  PanelScrollbarThumb,
  PanelScrollViewport,
} from "../panel";
import { chatThreadPanel } from "./chat-thread-panel.recipe";
import type { SlotElementProps } from "../../lib/data-attributes";

export type ChatThreadPanelRootProps = useRender.ComponentProps<"section">;

export function ChatThreadPanelRoot({ className, render, ...props }: ChatThreadPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = chatThreadPanel({ theme });

  return (
    <Panel
      {...props}
      render={render}
      data-slot="chat-thread-panel-root"
      className={root({ className })}
    />
  );
}

export type ChatThreadPanelHeaderProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelHeader({ className, render, ...props }: ChatThreadPanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = chatThreadPanel({ theme });

  return (
    <PanelHeader
      {...props}
      render={render}
      data-slot="chat-thread-panel-header"
      className={header({ className })}
    />
  );
}

export type ChatThreadPanelContentProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelContent({
  className,
  render,
  ...props
}: ChatThreadPanelContentProps) {
  const theme = useThemeFamily();
  const { content } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-thread-panel-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelTitleProps = useRender.ComponentProps<"h2">;

export function ChatThreadPanelTitle({ className, render, ...props }: ChatThreadPanelTitleProps) {
  const theme = useThemeFamily();
  const { title } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"h2"> = {
    "data-slot": "chat-thread-panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "h2",
    render,
    props: mergeProps<"h2">(defaultProps, props),
  });
}

export type ChatThreadPanelTitleMetaProps = useRender.ComponentProps<"span">;

export function ChatThreadPanelTitleMeta({
  className,
  render,
  ...props
}: ChatThreadPanelTitleMetaProps) {
  const theme = useThemeFamily();
  const { titleMeta } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-thread-panel-title-meta",
    className: titleMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatThreadPanelActionsProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelActions({
  className,
  render,
  ...props
}: ChatThreadPanelActionsProps) {
  const theme = useThemeFamily();
  const { actions } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-thread-panel-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelBodyProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelBody({
  children,
  className,
  render,
  ...props
}: ChatThreadPanelBodyProps) {
  const theme = useThemeFamily();
  const { body, scrollViewport } = chatThreadPanel({ theme });

  return (
    <PanelBody
      render={<ScrollArea.Root data-slot="chat-thread-panel-body-scroll-area" />}
      className={body()}
    >
      <PanelScrollViewport
        {...props}
        render={<ScrollArea.Viewport render={render} />}
        data-slot="chat-thread-panel-body"
        className={scrollViewport({ className })}
      >
        <PanelScrollContent render={<ScrollArea.Content />}>{children}</PanelScrollContent>
      </PanelScrollViewport>
      <PanelScrollbar render={<ScrollArea.Scrollbar />}>
        <PanelScrollbarThumb render={<ScrollArea.Thumb />} />
      </PanelScrollbar>
    </PanelBody>
  );
}

export type ChatThreadPanelParentProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelParent({ className, render, ...props }: ChatThreadPanelParentProps) {
  const theme = useThemeFamily();
  const { parent } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-thread-panel-parent",
    className: parent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelReplyCountProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelReplyCount({
  className,
  render,
  ...props
}: ChatThreadPanelReplyCountProps) {
  const theme = useThemeFamily();
  const { replyCount } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-thread-panel-reply-count",
    className: replyCount({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelFooterProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelFooter({ className, render, ...props }: ChatThreadPanelFooterProps) {
  const theme = useThemeFamily();
  const { footer } = chatThreadPanel({ theme });

  return (
    <PanelFooter
      {...props}
      render={render}
      data-slot="chat-thread-panel-footer"
      className={footer({ className })}
    />
  );
}

export type ChatThreadPanelSearchProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelSearch({ className, render, ...props }: ChatThreadPanelSearchProps) {
  const theme = useThemeFamily();
  const { search } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-thread-panel-search",
    className: search({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelSearchIconProps = useRender.ComponentProps<"span">;

export function ChatThreadPanelSearchIcon({
  className,
  render,
  ...props
}: ChatThreadPanelSearchIconProps) {
  const theme = useThemeFamily();
  const { searchIcon } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-thread-panel-search-icon",
    className: searchIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatThreadPanelSearchInputProps = useRender.ComponentProps<"input">;

export function ChatThreadPanelSearchInput({
  className,
  render,
  ...props
}: ChatThreadPanelSearchInputProps) {
  const theme = useThemeFamily();
  const { searchInput } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"input"> = {
    type: "text",
    "data-slot": "chat-thread-panel-search-input",
    className: searchInput({ className }),
  };

  return useRender({
    defaultTagName: "input",
    render,
    props: mergeProps<"input">(defaultProps, props),
  });
}

export type ChatThreadPanelSearchCountProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelSearchCount({
  className,
  render,
  ...props
}: ChatThreadPanelSearchCountProps) {
  const theme = useThemeFamily();
  const { searchCount } = chatThreadPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-thread-panel-search-count",
    className: searchCount({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
