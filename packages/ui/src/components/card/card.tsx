import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { card } from "./card.recipe";

export type CardProps = useRender.ComponentProps<"div">;

export function Card({ className, render, ...props }: CardProps) {
  const theme = useThemeFamily();
  const { root } = card({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardHeaderProps = useRender.ComponentProps<"div">;

export function CardHeader({ className, render, ...props }: CardHeaderProps) {
  const theme = useThemeFamily();
  const { header } = card({ theme });
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
  const theme = useThemeFamily();
  const { title } = card({ theme });
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

export type CardDescriptionProps = useRender.ComponentProps<"div">;

export function CardDescription({ className, render, ...props }: CardDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = card({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-description",
    className: description({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardActionProps = useRender.ComponentProps<"div">;

export function CardAction({ className, render, ...props }: CardActionProps) {
  const theme = useThemeFamily();
  const { action } = card({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-action",
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type CardContentProps = useRender.ComponentProps<"div">;

export function CardContent({ className, render, ...props }: CardContentProps) {
  const theme = useThemeFamily();
  const { content } = card({ theme });
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

export type CardFooterProps = useRender.ComponentProps<"div">;

export function CardFooter({ className, render, ...props }: CardFooterProps) {
  const theme = useThemeFamily();
  const { footer } = card({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "card-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
