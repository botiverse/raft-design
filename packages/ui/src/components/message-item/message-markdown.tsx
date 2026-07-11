import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { InlineCode, type InlineCodeProps } from "../inline-code";
import { messageMarkdown } from "./message-markdown.recipe";

export type MessageMarkdownProps = useRender.ComponentProps<"div">;

export function MessageMarkdown({ className, render, ...props }: MessageMarkdownProps) {
  const theme = useThemeFamily();
  const { root } = messageMarkdown({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-markdown",
    },
  });
}

export type MessageInlineCodeProps = InlineCodeProps;

export function MessageInlineCode({ className, ...props }: MessageInlineCodeProps) {
  const theme = useThemeFamily();
  const { inlineCode } = messageMarkdown({ theme });

  return <InlineCode className={inlineCode({ className })} {...props} />;
}

export type MessageMarkdownTableScrollProps = useRender.ComponentProps<"div">;

export function MessageMarkdownTableScroll({
  className,
  render,
  ...props
}: MessageMarkdownTableScrollProps) {
  const { tableScroll } = messageMarkdown();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: tableScroll({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-markdown-table-scroll",
    },
  });
}

export type MessageCodeBlockProps = useRender.ComponentProps<"pre">;

export function MessageCodeBlock({ className, render, ...props }: MessageCodeBlockProps) {
  const theme = useThemeFamily();
  const { codeBlock } = messageMarkdown({ theme });
  const defaultProps: useRender.ElementProps<"pre"> = {
    className: codeBlock({ className }),
  };

  return useRender({
    defaultTagName: "pre",
    render,
    props: mergeProps<"pre">(defaultProps, props),
    state: {
      slot: "message-code-block",
    },
  });
}
