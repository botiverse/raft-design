import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageEmbed } from "./message-embed.recipe";

type DivProps = useRender.ComponentProps<"div">;

export function MessageEmbed({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { root } = messageEmbed({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: root({ className }) }, props),
    state: { slot: "message-embed" },
  });
}

export function MessageEmbedHeader({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { header } = messageEmbed({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: header({ className }) }, props),
    state: { slot: "message-embed-header" },
  });
}

export function MessageEmbedContent({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { content } = messageEmbed({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: content({ className }) }, props),
    state: { slot: "message-embed-content" },
  });
}

export function MessageEmbedFooter({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { footer } = messageEmbed({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: footer({ className }) }, props),
    state: { slot: "message-embed-footer" },
  });
}

export type MessageEmbedProps = DivProps;
export type MessageEmbedHeaderProps = DivProps;
export type MessageEmbedContentProps = DivProps;
export type MessageEmbedFooterProps = DivProps;
