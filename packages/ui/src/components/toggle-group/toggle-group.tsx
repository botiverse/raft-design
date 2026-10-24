import type { ComponentPropsWithRef } from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { tv } from "../../lib/tv";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";

const toggleGroup = tv({
  slots: {
    root: [
      "inline-flex max-w-full items-center",
      "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap",
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
      "gap-[3px] rounded-[11px] bg-fill-muted p-[3px]",
    ],
    item: [
      "inline-flex h-8 min-w-0 shrink-0 items-center justify-center gap-1.5",
      "whitespace-nowrap",
      "outline-2 outline-offset-2 outline-transparent transition-[background-color,color,box-shadow,transform] duration-100",
      "disabled:pointer-events-none data-disabled:cursor-not-allowed",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "rounded-control border-[1.5px] border-transparent bg-transparent px-3",
      "font-sans text-callout font-semibold text-foreground-muted",
      "[&_svg:not([class*='size-'])]:size-4",
      "hover:bg-fill-medium active:bg-fill-medium",
      "data-pressed:border-sticker-ink data-pressed:bg-selected data-pressed:font-bold data-pressed:text-sticker-ink data-pressed:ring-[1.5px] data-pressed:ring-sticker-edge",
      "data-pressed:hover:bg-selected data-pressed:active:bg-selected data-pressed:active:overlay-sticker-medium",
      "focus-visible:shadow-focus",
      "data-disabled:opacity-100 data-disabled:text-foreground-disabled data-disabled:hover:bg-transparent",
    ],
    label: ["truncate"],
  },
});

export type ToggleGroupProps<T extends string = string> = StyledProps<BaseToggleGroup.Props<T>>;

export function ToggleGroup<T extends string = string>({
  className,
  ...props
}: ToggleGroupProps<T>) {
  const { root } = toggleGroup();
  return <BaseToggleGroup data-slot="toggle-group" className={root({ className })} {...props} />;
}

export type ToggleGroupItemProps<T extends string = string> = StyledProps<
  Omit<BaseToggle.Props<T>, "defaultPressed" | "pressed">
> & {
  value: T;
};

export function ToggleGroupItem<T extends string = string>({
  className,
  nativeButton,
  render,
  ...props
}: ToggleGroupItemProps<T>) {
  const { item } = toggleGroup();
  return (
    <BaseToggle
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="toggle-group-item"
      className={item({ className })}
      {...props}
    />
  );
}

export type ToggleGroupLabelProps = ComponentPropsWithRef<"span">;

export function ToggleGroupLabel({ className, ...props }: ToggleGroupLabelProps) {
  const { label } = toggleGroup();
  return <span data-slot="toggle-group-label" className={label({ className })} {...props} />;
}
