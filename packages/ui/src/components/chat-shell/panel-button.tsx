import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useRender } from "@base-ui/react/use-render";
import { defaultNativeButton } from "../../lib/default-native-button";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./data-attributes";

const panelControlTheme = {
  brutal: {
    surface: "rounded-none border-2 border-black bg-white px-1 py-1 text-black",
    shadow: "shadow-brutal-sm",
    hover: "hover:-translate-y-px hover:bg-white hover:shadow-brutal",
    disabledShadow: "disabled:shadow-brutal-sm",
    focus:
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
  },
  elegant: {
    surface: "rounded-md border-0 bg-transparent px-2 py-2",
    hover: "hover:bg-layer-strong/80 hover:text-foreground",
    focus: "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
  },
} as const;

const panelButton = tv({
  base: [
    "relative inline-flex w-auto shrink-0 items-center justify-center gap-1.5",
    "overflow-visible font-sans text-xs font-bold leading-none whitespace-nowrap select-none outline-none",
    "transition-all duration-100",
    "active:not-aria-[haspopup]:scale-100 active:translate-x-px active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-40 disabled:transform-none",
  ],
  variants: {
    theme: {
      brutal: [
        panelControlTheme.brutal.surface,
        panelControlTheme.brutal.shadow,
        panelControlTheme.brutal.hover,
        "active:shadow-xs",
        panelControlTheme.brutal.disabledShadow,
        panelControlTheme.brutal.focus,
      ],
      elegant: [
        `${panelControlTheme.elegant.surface} shadow-none`,
        "text-foreground-icon",
        panelControlTheme.elegant.hover,
        "active:translate-x-0 active:translate-y-0 active:bg-layer-strong/80 active:text-foreground",
        panelControlTheme.elegant.focus,
      ],
    },
  },
});

const panelToggleButton = tv({
  base: [
    "relative inline-flex w-auto shrink-0 items-center justify-center",
    "overflow-visible font-sans font-bold leading-none select-none outline-none",
    "transition-all duration-100",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[disabled]:transform-none",
  ],
  variants: {
    theme: {
      brutal: [
        `${panelControlTheme.brutal.surface} ${panelControlTheme.brutal.shadow}`,
        panelControlTheme.brutal.hover,
        "active:translate-x-px active:translate-y-px active:shadow-xs",
        "data-[pressed]:bg-brutal-orange data-[pressed]:text-black",
        "data-[pressed]:hover:bg-brutal-orange",
        "data-[disabled]:shadow-brutal-sm",
        panelControlTheme.brutal.focus,
      ],
      elegant: [
        `${panelControlTheme.elegant.surface} text-foreground-icon shadow-none`,
        panelControlTheme.elegant.hover,
        "active:bg-layer-strong/80 active:text-foreground",
        "data-[pressed]:bg-layer-strong data-[pressed]:text-foreground",
        "data-[pressed]:hover:bg-layer-strong",
        panelControlTheme.elegant.focus,
      ],
    },
  },
});

const panelButtonIcon = tv({
  base: ["shrink-0 items-center justify-center", "[&_svg]:pointer-events-none [&_svg]:shrink-0"],
  variants: {
    theme: {
      brutal: ["inline-flex p-px", "[&_svg]:size-3.5"],
      elegant: ["inline-flex", "[&_svg]:size-4"],
    },
  },
});

const panelButtonLabel = tv({
  base: ["hidden whitespace-nowrap font-medium leading-4 sm:inline"],
});

const panelButtonCount = tv({
  base: [
    "min-w-[1ch] text-center font-sans text-[12px] font-medium leading-4 tabular-nums",
    "text-foreground-icon",
  ],
});

export type PanelButtonProps = Omit<StyledProps<BaseButton.Props>, "type">;

export function PanelButton({ className, render, nativeButton, ...props }: PanelButtonProps) {
  const theme = useThemeFamily();

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-button"
      className={panelButton({ theme, className })}
    />
  );
}

export type PanelToggleButtonProps = Omit<StyledProps<BaseToggle.Props>, "type">;

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

export type PanelButtonIconProps = useRender.ComponentProps<"span">;

export function PanelButtonIcon({ className, render, ...props }: PanelButtonIconProps) {
  const theme = useThemeFamily();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "panel-button-icon",
    className: panelButtonIcon({ theme, className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type PanelButtonLabelProps = useRender.ComponentProps<"span">;

export function PanelButtonLabel({ className, render, ...props }: PanelButtonLabelProps) {
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "panel-button-label",
    className: panelButtonLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type PanelButtonCountProps = useRender.ComponentProps<"span">;

export function PanelButtonCount({ className, render, ...props }: PanelButtonCountProps) {
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "panel-button-count",
    className: panelButtonCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
