import { Button as BaseButton } from "@base-ui/react/button";
import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const pickerTriggerButton = tv({
  base: [
    "relative inline-flex h-8 shrink-0 items-center justify-center gap-2 px-3 py-1.5",
    "text-xs whitespace-nowrap select-none",
    "rounded-none",
    "outline-[1px] outline-offset-2 outline-transparent transition-colors duration-100 focus-visible:outline-transparent",
    "disabled:pointer-events-none disabled:transform-none disabled:opacity-40",
    "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 **:data-icon:size-[1em]",
  ],
  variants: {
    theme: {
      brutal: [
        "border-2 border-[oklch(0_0_0/0.3)] bg-white shadow-none",
        "font-sans font-bold text-[oklch(0_0_0/0.7)]",
        "hover:translate-y-0 hover:border-black hover:bg-white hover:shadow-none",
        "active:translate-x-0 active:translate-y-0 active:shadow-none",
        "data-popup-open:translate-y-0 data-popup-open:shadow-none",
        "[&_[data-picker-trigger-content]>svg:not([class*='size-'])]:size-3.5",
        "**:data-picker-trigger-indicator:text-inherit **:data-picker-trigger-indicator:opacity-100",
        "[&_[data-picker-trigger-indicator]>svg]:size-3 [&_[data-picker-trigger-indicator]>svg]:stroke-2 [&_[data-picker-trigger-indicator]>svg_*]:stroke-2",
      ],
      elegant: [
        "h-7 overflow-clip rounded-md border-0 bg-layer-panel px-2.5 py-0",
        "font-sans text-xs font-medium tracking-[-0.005em] text-foreground-placeholder antialiased",
        "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)] dark:shadow-raft-xs",
        "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0/0%)_30%,oklab(0%_0_0/1%)_100%)]",
        "hover:bg-ink-2 active:scale-100 dark:bg-fill-muted dark:hover:bg-fill-strong",
        "focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-1 focus-visible:ring-offset-layer-canvas-muted",
        "data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75",
        "data-invalid:focus-visible:ring-2 data-invalid:focus-visible:ring-[color-mix(in_oklch,var(--danger)_60%,transparent)]",
        "[&_[data-slot='select-value']]:font-medium",
        "[&_[data-picker-trigger-content='combobox']>svg]:shrink-0",
        "[&_[data-picker-trigger-content='combobox']>svg:not([class*='size-'])]:size-3",
        "[&_[data-picker-trigger-content='combobox']>svg:not([class*='stroke-'])]:stroke-[1.5]",
        "[&_[data-picker-trigger-content='select']_svg]:shrink-0",
        "[&_[data-picker-trigger-content='select']_svg:not([class*='size-'])]:size-3.5",
        "[&_[data-picker-trigger-content='select']_svg:not([class*='stroke-'])]:stroke-[1.5]",
      ],
      raft: [
        "gap-1.5 rounded-control border-0 bg-transparent px-2.5 py-0",
        "font-sans text-footnote font-semibold text-foreground-muted",
        "shadow-[inset_0_0_0_1px_var(--line-seam)]",
        "hover:bg-fill-pressed active:bg-fill-pressed",
        "data-has-value:bg-info-soft data-has-value:text-foreground data-has-value:shadow-none",
        "data-has-value:hover:bg-info-soft data-has-value:hover:press-overlay data-has-value:active:press-overlay",
        "data-invalid:shadow-[inset_0_0_0_1px_var(--danger-strong)]",
        "focus-visible:shadow-raft-focus data-has-value:focus-visible:shadow-raft-focus",
        "disabled:bg-fill-muted disabled:text-foreground-disabled disabled:opacity-100 disabled:shadow-none",
        "[&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='stroke-'])]:stroke-2",
        "**:data-picker-trigger-indicator:text-foreground-hint **:data-picker-trigger-indicator:opacity-100",
        "[&_[data-picker-trigger-indicator]>svg]:size-3.5 [&_[data-picker-trigger-indicator]>svg]:stroke-2 [&_[data-picker-trigger-indicator]>svg_*]:stroke-2",
      ],
    },
  },
});

export type PickerTriggerButtonProps = StyledProps<BaseButton.Props> & DataAttributes;

export function PickerTriggerButton({
  className,
  render,
  nativeButton,
  ...props
}: PickerTriggerButtonProps) {
  const theme = useThemeFamily();

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="picker-trigger-button"
      className={pickerTriggerButton({ theme, className })}
    />
  );
}
