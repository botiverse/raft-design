import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { memo } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { InlineCode, type InlineCodeProps } from "../inline-code";
import { messageMarkdown } from "./message-markdown.recipe";

export type MessageMarkdownProps = useRender.ComponentProps<"div">;

export const MessageMarkdown = memo(function MessageMarkdown({
  children,
  className,
  render,
  ...props
}: MessageMarkdownProps) {
  const theme = useThemeFamily();
  const { root } = messageMarkdown({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
    children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-markdown",
    },
  });
});

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
  const theme = useThemeFamily();
  const { tableScroll } = messageMarkdown({ theme });
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
