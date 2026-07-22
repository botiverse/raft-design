import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { Theme } from "../../lib/theme/theme-context";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageActionCard } from "./message-action-card.recipe";

type DivProps = useRender.ComponentProps<"div">;
type RecipePart = (options?: { className?: string }) => string;
type ResolveRecipePart = (theme: Theme) => RecipePart;

function createPart(slot: string, resolveRecipePart: ResolveRecipePart) {
  return function MessageActionCardPart({ className, render, ...props }: DivProps) {
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

export const MessageActionCard = createPart(
  "message-action-card",
  (theme) => messageActionCard({ theme }).root,
);
export const MessageActionCardContent = createPart(
  "message-action-card-content",
  (theme) => messageActionCard({ theme }).content,
);
export const MessageActionCardHeader = createPart(
  "message-action-card-header",
  (theme) => messageActionCard({ theme }).header,
);
export const MessageActionCardDetails = createPart(
  "message-action-card-details",
  (theme) => messageActionCard({ theme }).details,
);
export const MessageActionCardHint = createPart(
  "message-action-card-hint",
  (theme) => messageActionCard({ theme }).hint,
);
export const MessageActionCardCompletion = createPart(
  "message-action-card-completion",
  (theme) => messageActionCard({ theme }).completion,
);
export const MessageActionCardActions = createPart(
  "message-action-card-actions",
  (theme) => messageActionCard({ theme }).actions,
);

export type MessageActionCardProps = DivProps;
export type MessageActionCardContentProps = DivProps;
export type MessageActionCardHeaderProps = DivProps;
export type MessageActionCardDetailsProps = DivProps;
export type MessageActionCardHintProps = DivProps;
export type MessageActionCardCompletionProps = DivProps;
export type MessageActionCardActionsProps = DivProps;
