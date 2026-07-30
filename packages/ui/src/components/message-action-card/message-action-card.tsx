import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MessageEmbed, MessageEmbedContent, MessageEmbedHeader } from "../message-embed";
import { messageActionCard } from "./message-action-card.recipe";

type DivProps = useRender.ComponentProps<"div">;

export function MessageActionCard({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { root } = messageActionCard({ theme });

  return <MessageEmbed className={root({ className })} render={render} {...props} />;
}

export function MessageActionCardContent({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { content } = messageActionCard({ theme });

  return <MessageEmbedContent className={content({ className })} render={render} {...props} />;
}

export function MessageActionCardHeader({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { header } = messageActionCard({ theme });

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export function MessageActionCardDetails({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { details } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: details({ className }) }, props),
    state: { slot: "message-action-card-details" },
  });
}

export function MessageActionCardHint({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { hint } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: hint({ className }) }, props),
    state: { slot: "message-action-card-hint" },
  });
}

export function MessageActionCardCompletion({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { completion } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: completion({ className }) }, props),
    state: { slot: "message-action-card-completion" },
  });
}

export function MessageActionCardActions({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { actions } = messageActionCard({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: actions({ className }) }, props),
    state: { slot: "message-action-card-actions" },
  });
}

export type MessageActionCardProps = DivProps;
export type MessageActionCardContentProps = DivProps;
export type MessageActionCardHeaderProps = DivProps;
export type MessageActionCardDetailsProps = DivProps;
export type MessageActionCardHintProps = DivProps;
export type MessageActionCardCompletionProps = DivProps;
export type MessageActionCardActionsProps = DivProps;
