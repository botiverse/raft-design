import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageEmbed } from "./message-embed.recipe";

type DivProps = useRender.ComponentProps<"div">;
type RecipePart = (options?: { className?: string }) => string;

function createPart(
  slot: string,
  resolveRecipePart: (theme: ReturnType<typeof useThemeFamily>) => RecipePart,
) {
  return function MessageEmbedPart({ className, render, ...props }: DivProps) {
    const theme = useThemeFamily();
    const recipe = resolveRecipePart(theme);
    return useRender({
      defaultTagName: "div",
      render,
      props: mergeProps<"div">({ className: recipe({ className }) }, props),
      state: { slot },
    });
  };
}

export const MessageEmbed = createPart("message-embed", (theme) => messageEmbed({ theme }).root);
export const MessageEmbedHeader = createPart(
  "message-embed-header",
  (theme) => messageEmbed({ theme }).header,
);
export const MessageEmbedContent = createPart(
  "message-embed-content",
  (theme) => messageEmbed({ theme }).content,
);
export const MessageEmbedFooter = createPart(
  "message-embed-footer",
  (theme) => messageEmbed({ theme }).footer,
);

export type MessageEmbedProps = DivProps;
export type MessageEmbedHeaderProps = DivProps;
export type MessageEmbedContentProps = DivProps;
export type MessageEmbedFooterProps = DivProps;
