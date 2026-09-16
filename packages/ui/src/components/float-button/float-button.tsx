import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { CSSProperties, ReactNode } from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { VariantProps } from "../../lib/tv";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import type {
  FloatButtonOffset,
  FloatButtonPosition,
  FloatButtonSide,
} from "./float-button.position";
import { resolvePositionStyles } from "./float-button.position";
import { floatButton, floatButtonGroup } from "./float-button.recipe";

export type FloatButtonProps = StyledProps<BaseButton.Props> &
  VariantProps<typeof floatButton> & {
    icon?: ReactNode;
    description?: ReactNode;
    tooltip?: ReactNode;
    position?: FloatButtonPosition;
    side?: FloatButtonSide;
    offset?: FloatButtonOffset;
  };

export function FloatButton({
  icon,
  description,
  tooltip,
  variant = "default",
  shape = "circle",
  size = "md",
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
  const theme = useThemeFamily();
  const {
    root,
    content,
    description: descSlot,
  } = floatButton({
    theme,
    variant,
    shape,
    size,
  });

  const positionStyles = resolvePositionStyles({
    position,
    side,
    offset,
    style,
  });

  const nativeButton = nativeButtonProp ?? defaultNativeButton(render) ?? true;

  const defaultProps: SlotElementProps<"button"> = {
    type: nativeButton ? "button" : undefined,
    "data-slot": "float-button",
    "data-shape": shape,
    "data-size": size,
    "data-variant": variant,
    className: root({ className }),
    style: positionStyles,
  };

  const renderedButton = (
    <BaseButton {...mergeProps<"button">(defaultProps, props)} render={render}>
      <span
        data-slot="float-button-content"
        className={content({
          className: description ? "flex-col gap-0.5" : undefined,
        })}
      >
        {icon}
        {children}
        {description ? (
          <span data-slot="float-button-description" className={descSlot()}>
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

export type FloatButtonGroupProps = useRender.ComponentProps<"div"> &
  VariantProps<typeof floatButtonGroup> & {
    position?: FloatButtonPosition;
    side?: FloatButtonSide;
    offset?: FloatButtonOffset;
    gap?: number | string;
  };

export function FloatButtonGroup({
  direction = "vertical",
  attached = false,
  shape = "circle",
  position,
  side,
  offset,
  gap,
  className,
  style,
  render,
  ...props
}: FloatButtonGroupProps) {
  const theme = useThemeFamily();
  const { root } = floatButtonGroup({
    theme,
    direction,
    attached,
    shape,
  });

  const positionStyles = resolvePositionStyles({
    position,
    side,
    offset,
    style,
  });

  const combinedStyle: CSSProperties = {
    ...positionStyles,
    gap: !attached && gap !== undefined ? (typeof gap === "number" ? `${gap}px` : gap) : undefined,
  };

  const defaultProps: SlotElementProps<"div"> = {
    role: "group",
    "data-slot": "float-button-group",
    "data-direction": direction,
    "data-attached": attached ? "true" : undefined,
    "data-shape": shape,
    className: root({
      className: [!attached && gap === undefined ? "gap-2.5" : "", className]
        .filter(Boolean)
        .join(" "),
    }),
    style: combinedStyle,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
