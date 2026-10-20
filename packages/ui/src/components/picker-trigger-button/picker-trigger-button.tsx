import { Button as BaseButton } from "@base-ui/react/button";
import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { tv } from "../../lib/tv";

const pickerTriggerButton = tv({
  base: [
    "relative inline-flex h-8 shrink-0 items-center justify-center",
    "whitespace-nowrap select-none",
    "outline-[1px] outline-offset-2 outline-transparent transition-colors duration-100 focus-visible:outline-transparent",
    "disabled:pointer-events-none disabled:transform-none",
    "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 **:data-icon:size-[1em]",
    "gap-1.5 rounded-control border-0 bg-transparent px-2.5 py-0",
    "font-sans text-control font-semibold text-foreground-muted",
    "inset-ring inset-ring-line-seam",
    "hover:bg-fill-pressed active:bg-fill-pressed",
    "data-has-value:bg-info-soft data-has-value:text-foreground data-has-value:inset-ring-0",
    "data-has-value:hover:bg-info-soft data-has-value:hover:press-overlay data-has-value:active:press-overlay",
    "data-invalid:inset-ring data-invalid:inset-ring-danger-strong",
    "focus-visible:shadow-focus",
    "disabled:bg-fill-muted disabled:text-foreground-disabled disabled:opacity-100 disabled:inset-ring-0",
    "[&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='stroke-'])]:stroke-2",
    "**:data-picker-trigger-indicator:text-foreground-hint **:data-picker-trigger-indicator:opacity-100",
    "[&_[data-picker-trigger-indicator]>svg]:size-3.5 [&_[data-picker-trigger-indicator]>svg]:stroke-2 [&_[data-picker-trigger-indicator]>svg_*]:stroke-2",
  ],
});

export type PickerTriggerButtonProps = StyledProps<BaseButton.Props> & DataAttributes;

export function PickerTriggerButton({
  className,
  render,
  nativeButton,
  ...props
}: PickerTriggerButtonProps) {
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="picker-trigger-button"
      className={pickerTriggerButton({ className })}
    />
  );
}
