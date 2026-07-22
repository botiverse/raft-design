import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageProductState } from "../message-product-state/message-product-state.recipe";

type DivProps = useRender.ComponentProps<"div">;

function createPart(slot: string, recipeSlot: keyof ReturnType<typeof messageProductState>) {
  return function MessageActionCardPart({ className, render, ...props }: DivProps) {
    const theme = useThemeFamily();
    const recipe = messageProductState({ theme })[recipeSlot] as (value: {
      className?: string;
    }) => string;
    return useRender({
      defaultTagName: "div",
      render,
      props: mergeProps<"div">({ className: recipe({ className }) }, props),
      state: { slot },
    });
  };
}

export const MessageActionCard = createPart("message-action-card", "actionCard");
export const MessageActionCardContent = createPart(
  "message-action-card-content",
  "actionCardContent",
);
export const MessageActionCardHeader = createPart("message-action-card-header", "actionCardHeader");
export const MessageActionCardDetails = createPart(
  "message-action-card-details",
  "actionCardDetails",
);
export const MessageActionCardHint = createPart("message-action-card-hint", "actionCardHint");
export const MessageActionCardCompletion = createPart(
  "message-action-card-completion",
  "actionCardCompletion",
);
export const MessageActionCardActions = createPart(
  "message-action-card-actions",
  "actionCardActions",
);

export type MessageActionCardProps = DivProps;
export type MessageActionCardContentProps = DivProps;
export type MessageActionCardHeaderProps = DivProps;
export type MessageActionCardDetailsProps = DivProps;
export type MessageActionCardHintProps = DivProps;
export type MessageActionCardCompletionProps = DivProps;
export type MessageActionCardActionsProps = DivProps;
