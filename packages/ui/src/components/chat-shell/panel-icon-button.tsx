import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";
import type { DataAttributes } from "./app-shell";

const panelIconButton = tv({
  base: [
    "size-7 p-0",
    "overflow-visible font-sans font-bold leading-none outline-none before:hidden",
    "active:not-aria-[haspopup]:scale-100 active:translate-x-px active:translate-y-px",
    "disabled:transform-none",
    "[&_svg]:size-3.5 [&_svg]:shrink-0",
  ],
  variants: {
    theme: {
      brutal: [
        "rounded-none border-2 border-black bg-white text-black",
        "shadow-brutal-sm",
        "hover:-translate-y-px hover:bg-white hover:shadow-brutal",
        "active:shadow-xs",
        "disabled:shadow-brutal-sm",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      ],
      elegant: [
        "size-8 rounded-md border-0 bg-transparent shadow-none",
        "text-foreground-icon [&_svg]:size-4",
        "hover:bg-layer-strong/80 hover:text-foreground",
        "active:translate-x-0 active:translate-y-0 active:bg-layer-strong/80 active:text-foreground",
        "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
      ],
    },
    layout: {
      icon: {},
      label: ["w-auto min-w-7 gap-1.5 px-2.5 text-xs"],
      responsiveLabel: ["text-xs sm:w-auto sm:gap-1.5 sm:px-2.5"],
    },
  },
  defaultVariants: {
    layout: "icon",
  },
});

const panelToggleButton = tv({
  base: [
    "relative inline-flex size-7 shrink-0 items-center justify-center p-0",
    "overflow-visible font-sans font-bold leading-none select-none outline-none",
    "transition-all duration-100",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[disabled]:transform-none",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  ],
  variants: {
    theme: {
      brutal: [
        "rounded-none border-2 border-black bg-white text-black shadow-brutal-sm",
        "hover:-translate-y-px hover:bg-white hover:shadow-brutal",
        "active:translate-x-px active:translate-y-px active:shadow-xs",
        "data-[pressed]:bg-brutal-orange data-[pressed]:text-black",
        "data-[pressed]:hover:bg-brutal-orange",
        "data-[disabled]:shadow-brutal-sm",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      ],
      elegant: [
        "size-8 rounded-md border-0 bg-transparent text-foreground-icon shadow-none",
        "hover:bg-layer-strong/80 hover:text-foreground",
        "active:bg-layer-strong/80 active:text-foreground",
        "data-[pressed]:bg-layer-strong data-[pressed]:text-foreground",
        "data-[pressed]:hover:bg-layer-strong",
        "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
        "[&_svg]:size-4",
      ],
    },
  },
});

const panelIconButtonLabel = tv({
  base: ["font-medium leading-none"],
  variants: {
    responsive: {
      true: "hidden sm:inline",
      false: "",
    },
  },
  defaultVariants: {
    responsive: false,
  },
});

const panelIconButtonCount = tv({
  base: [
    "min-w-[1ch] text-center font-sans text-[12px] font-medium leading-none tabular-nums",
    "text-foreground-icon",
  ],
});

type PanelIconButtonVariantProps = Omit<VariantProps<typeof panelIconButton>, "theme">;

export type PanelIconButtonProps = Omit<ButtonProps, "variant" | "size" | "type"> & {
  layout?: PanelIconButtonVariantProps["layout"];
};

export function PanelIconButton({ className, layout, ...props }: PanelIconButtonProps) {
  const theme = useThemeFamily();

  return (
    <Button
      {...props}
      type="button"
      variant="default"
      size="icon-sm"
      className={panelIconButton({ theme, layout, className })}
    />
  );
}

export type PanelToggleButtonProps = StyledProps<BaseToggle.Props>;

export function PanelToggleButton({ className, ...props }: PanelToggleButtonProps) {
  const theme = useThemeFamily();

  return (
    <BaseToggle
      {...props}
      type="button"
      data-slot="panel-toggle-button"
      className={panelToggleButton({ theme, className })}
    />
  );
}

export type PanelIconButtonLabelProps = useRender.ComponentProps<"span"> & {
  responsive?: boolean;
};

export function PanelIconButtonLabel({
  className,
  render,
  responsive,
  ...props
}: PanelIconButtonLabelProps) {
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "panel-icon-button-label",
    className: panelIconButtonLabel({ responsive, className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type PanelIconButtonCountProps = useRender.ComponentProps<"span">;

export function PanelIconButtonCount({ className, render, ...props }: PanelIconButtonCountProps) {
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "panel-icon-button-count",
    className: panelIconButtonCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
