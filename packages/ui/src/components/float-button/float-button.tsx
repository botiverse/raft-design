import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useContext, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import type {
  FloatButtonOffset,
  FloatButtonPosition,
  FloatButtonSide,
} from "./float-button.position";
import { resolvePositionStyles } from "./float-button.position";
import "./float-button.css";

export type FloatButtonVariant =
  | "default"
  | "primary"
  | "accent"
  | "outline"
  | "ghost"
  | "warning"
  | "danger";

export type FloatButtonShape = "circle" | "square";

export type FloatButtonSize = "xs" | "sm" | "md" | "lg";

export type FloatButtonGroupDirection = "vertical" | "horizontal";

interface FloatButtonGroupContextValue {
  shape?: FloatButtonShape;
  size?: FloatButtonSize;
}

const FloatButtonGroupContext = createContext<FloatButtonGroupContextValue | null>(null);

export interface FloatButtonProps extends StyledProps<BaseButton.Props> {
  variant?: FloatButtonVariant;
  shape?: FloatButtonShape;
  size?: FloatButtonSize;
  theme?: "brutal" | "elegant";
  icon?: ReactNode;
  description?: ReactNode;
  tooltip?: ReactNode;
  position?: FloatButtonPosition;
  side?: FloatButtonSide;
  offset?: FloatButtonOffset;
}

export function FloatButton({
  icon,
  description,
  tooltip,
  variant = "default",
  shape: shapeProp,
  size: sizeProp,
  theme: themeProp,
  position,
  side,
  offset,
  className,
  style,
  children,
  nativeButton: nativeButtonProp,
  render,
  ...props
}: FloatButtonProps) {
  const groupContext = useContext(FloatButtonGroupContext);
  const shape = shapeProp ?? groupContext?.shape ?? "circle";
  const size = sizeProp ?? groupContext?.size ?? "md";

  const currentTheme = useThemeFamily();
  const resolvedTheme = themeProp ?? currentTheme;

  const positionStyles = resolvePositionStyles({
    position,
    side,
    offset,
    style,
  });

  const nativeButton = nativeButtonProp ?? defaultNativeButton(render) ?? true;

  const rootClasses = [
    "r-float-button",
    `r-float-button--${size}`,
    `r-float-button--${shape}`,
    `r-float-button--${variant}`,
    resolvedTheme === "elegant" && "r-float-button--elegant",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    "r-float-button__content",
    description && "r-float-button__content--with-desc",
  ]
    .filter(Boolean)
    .join(" ");

  const defaultProps: SlotElementProps<"button"> = {
    type: nativeButton ? "button" : undefined,
    "data-slot": "float-button",
    "data-shape": shape,
    "data-size": size,
    "data-variant": variant,
    className: rootClasses,
    style: positionStyles,
  };

  const renderedButton = (
    <BaseButton {...mergeProps<"button">(defaultProps, props)} render={render}>
      <span data-slot="float-button-content" className={contentClasses}>
        {icon}
        {children}
        {description ? (
          <span data-slot="float-button-description" className="r-float-button__desc">
            {description}
          </span>
        ) : null}
      </span>
    </BaseButton>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger render={renderedButton} />
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return renderedButton;
}

export type FloatButtonGroupProps = useRender.ComponentProps<"div"> & {
  direction?: FloatButtonGroupDirection;
  attached?: boolean;
  shape?: FloatButtonShape;
  size?: FloatButtonSize;
  theme?: "brutal" | "elegant";
  position?: FloatButtonPosition;
  side?: FloatButtonSide;
  offset?: FloatButtonOffset;
  gap?: number | string;
};

export function FloatButtonGroup({
  direction = "vertical",
  attached = false,
  shape = "circle",
  size,
  theme: themeProp,
  position,
  side,
  offset,
  gap,
  className,
  style,
  render,
  children,
  ...props
}: FloatButtonGroupProps) {
  const currentTheme = useThemeFamily();
  const resolvedTheme = themeProp ?? currentTheme;

  const positionStyles = resolvePositionStyles({
    position,
    side,
    offset,
    style,
  });

  const combinedStyle: CSSProperties = {
    ...positionStyles,
    ...(gap !== undefined && !attached
      ? {
          "--dsl-float-button-group-gap": typeof gap === "number" ? `${gap}px` : gap,
          gap: typeof gap === "number" ? `${gap}px` : gap,
        }
      : {}),
    ...style,
  };

  const rootClasses = [
    "r-float-button-group",
    `r-float-button-group--${direction}`,
    attached && "r-float-button-group--attached",
    `r-float-button-group--${shape}`,
    resolvedTheme === "elegant" && "r-float-button-group--elegant",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const defaultProps: SlotElementProps<"div"> = {
    role: "group",
    "data-slot": "float-button-group",
    "data-direction": direction,
    "data-attached": attached ? "true" : undefined,
    "data-shape": shape,
    className: rootClasses,
    style: combinedStyle,
  };

  const contextValue = useMemo(() => ({ shape, size }), [shape, size]);

  const groupContent = (
    <FloatButtonGroupContext.Provider value={contextValue}>
      {children}
    </FloatButtonGroupContext.Provider>
  );

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, { ...props, children: groupContent }),
  });
}
