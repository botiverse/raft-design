import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, use } from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { VariantProps } from "../../lib/tv";
import { card } from "./card.recipe";
import { helperTextSlot } from "../../lib/helper-text";
import type { HelperTextSlotProps } from "../../lib/helper-text";

type CardVariant = NonNullable<VariantProps<typeof card>["variant"]>;

const CardVariantContext = createContext<CardVariant>("default");

function useCardRecipe() {
  const variant = use(CardVariantContext);
  return card({ variant });
}

export type CardProps = useRender.ComponentProps<"div"> & VariantProps<typeof card>;

export function Card({ className, render, variant = "default", ...props }: CardProps) {
  const { root } = card({ variant });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card",
    "data-variant": variant,
    className: root({ className }),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return <CardVariantContext value={variant}>{element}</CardVariantContext>;
}

export type CardHeaderProps = useRender.ComponentProps<"div">;

export function CardHeader({ className, render, ...props }: CardHeaderProps) {
  const { header } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-header",
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardTitleProps = useRender.ComponentProps<"div">;

export function CardTitle({ className, render, ...props }: CardTitleProps) {
  const { title } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardLeadingProps = useRender.ComponentProps<"div">;

export function CardLeading({ className, render, ...props }: CardLeadingProps) {
  const { leading } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-leading",
    className: leading({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardDescriptionProps = HelperTextSlotProps<useRender.ComponentProps<"div">>;

export function CardDescription({ className, render, children, ...props }: CardDescriptionProps) {
  const { description } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-description",
    className: description({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props, helperTextSlot("CardDescription", children)),
  });
}

export type CardSubtitleProps = useRender.ComponentProps<"div">;

/**
 * Data about the card's subject under its title, where `CardDescription`
 * would go: a handle ("@ada"), a time and place ("Public beta · Thursday at
 * 10:00"). In the base ink; a helper sentence goes in `CardDescription`.
 */
export function CardSubtitle({ className, render, ...props }: CardSubtitleProps) {
  const { subtitle } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-subtitle",
    className: subtitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardTrailingProps = useRender.ComponentProps<"div">;

export function CardTrailing({ className, render, ...props }: CardTrailingProps) {
  const { trailing } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-trailing",
    className: trailing({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardContentProps = useRender.ComponentProps<"div">;

export function CardContent({ className, render, ...props }: CardContentProps) {
  const { content } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardFooterProps = HelperTextSlotProps<useRender.ComponentProps<"div">>;

export function CardFooter({ className, render, children, ...props }: CardFooterProps) {
  const { footer } = useCardRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props, helperTextSlot("CardFooter", children)),
  });
}
