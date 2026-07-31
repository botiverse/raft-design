import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MessageEmbed, MessageEmbedContent, MessageEmbedHeader } from "../message-embed";
import { messageActionCard } from "./message-action-card.recipe";
import { messageActionCardContent } from "./message-action-card-content.recipe";
export function MessageActionCard({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { root } = messageActionCard({ theme });

  return <MessageEmbed className={root({ className })} render={render} {...props} />;
}

export function MessageActionCardContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { root } = messageActionCardContent({ theme });

  return <MessageEmbedContent className={root({ className })} render={render} {...props} />;
}

export function MessageActionCardHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { header } = messageActionCard({ theme });

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export function MessageActionCardProperties({
  className,
  render,
  ...props
}: useRender.ComponentProps<"dl">) {
  const theme = useThemeFamily();
  const { properties } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dl",
    render,
    props: mergeProps<"dl">({ className: properties({ className }) }, props),
    state: { slot: "message-action-card-properties" },
  });
}

export function MessageActionCardProperty({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { property } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: property({ className }) }, props),
    state: { slot: "message-action-card-property" },
  });
}

export function MessageActionCardPropertyLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"dt">) {
  const theme = useThemeFamily();
  const { propertyLabel } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dt",
    render,
    props: mergeProps<"dt">({ className: propertyLabel({ className }) }, props),
    state: { slot: "message-action-card-property-label" },
  });
}

export function MessageActionCardPropertyValue({
  className,
  render,
  ...props
}: useRender.ComponentProps<"dd">) {
  const theme = useThemeFamily();
  const { propertyValue } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "dd",
    render,
    props: mergeProps<"dd">({ className: propertyValue({ className }) }, props),
    state: { slot: "message-action-card-property-value" },
  });
}

export function MessageActionCardScopeList({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scopeList } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeList({ className }) }, props),
    state: { slot: "message-action-card-scope-list" },
  });
}

export function MessageActionCardScope({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scope } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scope({ className }) }, props),
    state: { slot: "message-action-card-scope" },
  });
}

export function MessageActionCardScopeName({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scopeName } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeName({ className }) }, props),
    state: { slot: "message-action-card-scope-name" },
  });
}

export function MessageActionCardScopeDescription({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { scopeDescription } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: scopeDescription({ className }) }, props),
    state: { slot: "message-action-card-scope-description" },
  });
}

export function MessageActionCardHint({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { hint } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: hint({ className }) }, props),
    state: { slot: "message-action-card-hint" },
  });
}

export function MessageActionCardCompletion({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { completion } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: completion({ className }) }, props),
    state: { slot: "message-action-card-completion" },
  });
}

export function MessageActionCardActions({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { actions } = messageActionCardContent({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: actions({ className }) }, props),
    state: { slot: "message-action-card-actions" },
  });
}

export type MessageActionCardProps = useRender.ComponentProps<"div">;
export type MessageActionCardContentProps = useRender.ComponentProps<"div">;
export type MessageActionCardHeaderProps = useRender.ComponentProps<"div">;
export type MessageActionCardPropertiesProps = useRender.ComponentProps<"dl">;
export type MessageActionCardPropertyProps = useRender.ComponentProps<"div">;
export type MessageActionCardPropertyLabelProps = useRender.ComponentProps<"dt">;
export type MessageActionCardPropertyValueProps = useRender.ComponentProps<"dd">;
export type MessageActionCardScopeListProps = useRender.ComponentProps<"div">;
export type MessageActionCardScopeProps = useRender.ComponentProps<"div">;
export type MessageActionCardScopeNameProps = useRender.ComponentProps<"div">;
export type MessageActionCardScopeDescriptionProps = useRender.ComponentProps<"div">;
export type MessageActionCardHintProps = useRender.ComponentProps<"div">;
export type MessageActionCardCompletionProps = useRender.ComponentProps<"div">;
export type MessageActionCardActionsProps = useRender.ComponentProps<"div">;
