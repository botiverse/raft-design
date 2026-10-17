import type { ComponentPropsWithRef } from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { tv } from "../../lib/tv";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const toggleGroup = tv({
  slots: {
    root: [
      "inline-flex max-w-full items-center",
      "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap",
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
    ],
    item: [
      "inline-flex h-8 min-w-0 shrink-0 items-center justify-center gap-1.5 px-2.5",
      "text-xs leading-4 font-medium whitespace-nowrap",
      "bg-layer-panel text-foreground",
      "outline-2 outline-offset-2 outline-transparent transition-[background-color,color,box-shadow,transform] duration-100",
      "disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-40",
      "data-pressed:bg-primary-400 data-pressed:text-primary-950",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    ],
    label: ["truncate"],
  },
  variants: {
    theme: {
      brutal: {
        root: "gap-1",
        item: [
          "border-2 border-line-strong font-bold",
          "hover:bg-primary-400/30",
          "focus-visible:outline-line-strong",
          "active:translate-px  data-pressed:shadow-raft-sm",
        ],
      },
      elegant: {
        root: "gap-1.5",
        item: [
          "rounded-sm antialiased",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_1px_1.5px_-1px_oklch(0_0_0/0.035),0_0_0_1px_var(--line-muted)]",
          "dark:not-data-pressed:bg-fill-muted dark:not-data-pressed:shadow-raft-sm",
          "not-data-pressed:hover:bg-[color-mix(in_oklch,var(--fill-muted)_55%,var(--layer-panel))]",
          "dark:not-data-pressed:hover:bg-fill-strong",
          "data-pressed:hover:bg-primary-hover",
          "data-pressed:shadow-[0_1px_1.5px_-1px_color-mix(in_srgb,var(--primary-glow)_8%,transparent),0_0_0_1px_var(--primary-edge)]",
          "dark:data-pressed:shadow-raft-sm dark:data-pressed:hover:bg-primary-500",
          "focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--primary-400)_85%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-layer-canvas-muted",
          "active:scale-[0.985]",
        ],
      },
      raft: {
        root: "gap-0.5 rounded-[11px] bg-fill-muted p-[3px]",
        item: [
          "rounded-control border-[1.5px] border-transparent bg-transparent px-3",
          "font-sans text-callout font-semibold text-foreground-muted",
          "[&_svg:not([class*='size-'])]:size-4",
          "hover:bg-fill-pressed",
          "data-pressed:border-sticker-ink data-pressed:bg-primary data-pressed:font-bold data-pressed:text-sticker-ink",
          "data-pressed:hover:bg-primary data-pressed:hover:press-overlay-sticker data-pressed:active:press-overlay-sticker",
          "focus-visible:shadow-raft-focus",
          "data-disabled:opacity-100 data-disabled:text-foreground-disabled data-disabled:hover:bg-transparent",
        ],
      },
    },
  },
});

export type ToggleGroupProps<T extends string = string> = StyledProps<BaseToggleGroup.Props<T>>;

export function ToggleGroup<T extends string = string>({
  className,
  ...props
}: ToggleGroupProps<T>) {
  const theme = useThemeFamily();
  const { root } = toggleGroup({ theme });
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
  const theme = useThemeFamily();
  const { item } = toggleGroup({ theme });
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
