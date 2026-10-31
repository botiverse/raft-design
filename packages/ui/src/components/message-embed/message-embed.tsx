import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { messageEmbed } from "./message-embed.recipe";

type DivProps = useRender.ComponentProps<"div">;

export function MessageEmbed({
  interactive = false,
  className,
  render,
  ...props
}: MessageEmbedProps) {
  const { root } = messageEmbed();
  const defaultProps: SlotElementProps<"div"> = {
    "data-interactive": interactive ? "true" : undefined,
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-embed" },
  });
}

export function MessageEmbedHeader({ className, render, ...props }: DivProps) {
  const { header } = messageEmbed();

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: header({ className }) }, props),
    state: { slot: "message-embed-header" },
  });
}

export function MessageEmbedContent({ className, render, ...props }: DivProps) {
  const { content } = messageEmbed();

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: content({ className }) }, props),
    state: { slot: "message-embed-content" },
  });
}

export function MessageEmbedFooter({ className, render, ...props }: DivProps) {
  const { footer } = messageEmbed();

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: footer({ className }) }, props),
    state: { slot: "message-embed-footer" },
  });
}

export type MessageEmbedProps = DivProps & {
  /**
   * The whole card opens something (a link or a button in it covers the card):
   * it hovers with the subtle tier and presses with the medium tier, like a
   * file card. Off for a card that only shows content.
   * @default false
   */
  interactive?: boolean;
};
export type MessageEmbedHeaderProps = DivProps;
export type MessageEmbedContentProps = DivProps;
export type MessageEmbedFooterProps = DivProps;
