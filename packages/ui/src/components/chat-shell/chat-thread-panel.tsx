import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./app-shell";

const chatThreadPanel = tv({
  slots: {
    root: ["flex h-full min-h-0 w-full flex-col", "text-foreground"],
    header: ["flex h-[62px] shrink-0 items-center gap-3 px-5", "[@media(max-height:600px)]:h-12"],
    title: ["min-w-0 flex-1 truncate", "text-base font-bold"],
    actions: ["flex shrink-0 items-center gap-1.5"],
    search: ["relative z-20 flex shrink-0 items-center gap-1.5 px-2 py-2", "[&_svg]:shrink-0"],
    searchInput: ["min-w-0 flex-1 border-2 px-2 py-1 text-sm font-medium outline-none"],
    searchCount: ["w-20 shrink-0 text-center font-mono text-xs"],
    body: ["min-h-0 flex-1 overflow-y-auto"],
    parent: ["shrink-0 px-3 py-1"],
    replyCount: ["mb-1 border-b pb-2 text-center font-mono text-xs"],
    footer: [
      "relative flex shrink-0 items-center px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
      "text-xs",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        header: "border-b-2 border-black bg-white",
        title: "text-black",
        search: "border-b-2 border-black bg-white [&_svg]:text-black/50",
        searchInput: "border-black bg-white text-black focus:shadow-brutal-sm",
        searchCount: "text-black/50",
        parent: "border-b-2 border-black bg-white",
        replyCount: "border-black/10 text-black/40",
        footer: "border-t-2 border-black bg-white text-black/50",
      },
      elegant: {
        root: "bg-transparent font-sans text-foreground",
        header: "border-b-0 bg-transparent",
        title: "text-foreground-strong",
        search: "border-b border-line-subtle bg-transparent [&_svg]:text-foreground-muted",
        searchInput:
          "rounded-md border-line-subtle bg-layer-field text-foreground-strong focus:ring-2 focus:ring-line-focus",
        searchCount: "text-foreground-muted",
        parent: "border-b border-line-subtle bg-transparent",
        replyCount: "border-line-muted text-foreground-muted",
        footer: "border-t-0 bg-transparent text-foreground-muted",
      },
    },
  },
});

export type ChatThreadPanelRootProps = useRender.ComponentProps<"section">;

export function ChatThreadPanelRoot({ className, render, ...props }: ChatThreadPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = chatThreadPanel({ theme });
  const defaultProps: useRender.ElementProps<"section"> & DataAttributes = {
    "data-slot": "chat-thread-panel-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type ChatThreadPanelHeaderProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelHeader({ className, render, ...props }: ChatThreadPanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = chatThreadPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-thread-panel-header",
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelTitleProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelTitle({ className, render, ...props }: ChatThreadPanelTitleProps) {
  const theme = useThemeFamily();
  const { title } = chatThreadPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-thread-panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelActionsProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelActions({
  className,
  render,
  ...props
}: ChatThreadPanelActionsProps) {
  const { actions } = chatThreadPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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

export function ChatThreadPanelBody({ className, render, ...props }: ChatThreadPanelBodyProps) {
  const { body } = chatThreadPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-thread-panel-body",
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelParentProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelParent({ className, render, ...props }: ChatThreadPanelParentProps) {
  const theme = useThemeFamily();
  const { parent } = chatThreadPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-thread-panel-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatThreadPanelSearchProps = useRender.ComponentProps<"div">;

export function ChatThreadPanelSearch({ className, render, ...props }: ChatThreadPanelSearchProps) {
  const theme = useThemeFamily();
  const { search } = chatThreadPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-thread-panel-search",
    className: search({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
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
  const defaultProps: useRender.ElementProps<"input"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-thread-panel-search-count",
    className: searchCount({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
