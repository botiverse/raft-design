import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MessageEmbed, MessageEmbedContent, MessageEmbedHeader } from "../message-embed";
import { messageActionCard } from "./message-action-card.recipe";
import { messageActionCardContent } from "./message-action-card-content.recipe";

type DivProps = useRender.ComponentProps<"div">;
type DlProps = useRender.ComponentProps<"dl">;
type DtProps = useRender.ComponentProps<"dt">;
type DdProps = useRender.ComponentProps<"dd">;

export function MessageActionCard({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { root } = messageActionCard({ theme });

  return <MessageEmbed className={root({ className })} render={render} {...props} />;
}

export function MessageActionCardContent({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { root } = messageActionCardContent({ theme });

  return <MessageEmbedContent className={root({ className })} render={render} {...props} />;
}

export function MessageActionCardHeader({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { header } = messageActionCard({ theme });

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export function MessageActionCardDetails({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { details } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: details({ className }) }, props),
    state: { slot: "message-action-card-details" },
  });
}

export function MessageActionCardFacts({ className, render, ...props }: DlProps) {
  const theme = useThemeFamily();
  const { facts } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dl",
    render,
    props: mergeProps<"dl">({ className: facts({ className }) }, props),
    state: { slot: "message-action-card-facts" },
  });
}

export function MessageActionCardFact({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { fact } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: fact({ className }) }, props),
    state: { slot: "message-action-card-fact" },
  });
}

export function MessageActionCardFactLabel({ className, render, ...props }: DtProps) {
  const theme = useThemeFamily();
  const { factLabel } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dt",
    render,
    props: mergeProps<"dt">({ className: factLabel({ className }) }, props),
    state: { slot: "message-action-card-fact-label" },
  });
}

export function MessageActionCardFactValue({ className, render, ...props }: DdProps) {
  const theme = useThemeFamily();
  const { factValue } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dd",
    render,
    props: mergeProps<"dd">({ className: factValue({ className }) }, props),
    state: { slot: "message-action-card-fact-value" },
  });
}

export function MessageActionCardScopeList({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { scopeList } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeList({ className }) }, props),
    state: { slot: "message-action-card-scope-list" },
  });
}

export function MessageActionCardScope({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { scope } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scope({ className }) }, props),
    state: { slot: "message-action-card-scope" },
  });
}

export function MessageActionCardScopeLabel({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { scopeLabel } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeLabel({ className }) }, props),
    state: { slot: "message-action-card-scope-label" },
  });
}

export function MessageActionCardScopeName({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { scopeName } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeName({ className }) }, props),
    state: { slot: "message-action-card-scope-name" },
  });
}

export function MessageActionCardScopeDescription({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { scopeDescription } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeDescription({ className }) }, props),
    state: { slot: "message-action-card-scope-description" },
  });
}

export function MessageActionCardHint({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { hint } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: hint({ className }) }, props),
    state: { slot: "message-action-card-hint" },
  });
}

export function MessageActionCardCompletion({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { completion } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: completion({ className }) }, props),
    state: { slot: "message-action-card-completion" },
  });
}

export function MessageActionCardActions({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { actions } = messageActionCardContent({ theme });

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
export type MessageActionCardFactsProps = DlProps;
export type MessageActionCardFactProps = DivProps;
export type MessageActionCardFactLabelProps = DtProps;
export type MessageActionCardFactValueProps = DdProps;
export type MessageActionCardScopeListProps = DivProps;
export type MessageActionCardScopeProps = DivProps;
export type MessageActionCardScopeLabelProps = DivProps;
export type MessageActionCardScopeNameProps = DivProps;
export type MessageActionCardScopeDescriptionProps = DivProps;
export type MessageActionCardHintProps = DivProps;
export type MessageActionCardCompletionProps = DivProps;
export type MessageActionCardActionsProps = DivProps;
