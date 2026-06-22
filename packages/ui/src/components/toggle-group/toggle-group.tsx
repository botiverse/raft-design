import type { ComponentPropsWithRef } from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { tv, type VariantProps } from "../../lib/tv.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const toggleGroup = tv({
  slots: {
    root: ["inline-flex max-w-full flex-wrap items-center gap-1"],
    item: [
      "flex h-7 min-w-0 shrink-0 items-center gap-1 px-2",
      "text-xs font-bold transition-colors",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    ],
    label: ["truncate"],
    count: ["font-mono text-[10px] leading-none"],
  },
  variants: {
    theme: {
      brutal: {
        item: [
          "border-2 border-line-strong bg-layer-panel text-foreground-strong",
          "hover:bg-primary-400/30 data-[pressed]:bg-primary-400 data-[pressed]:text-foreground-strong",
          "data-[pressed]:shadow-sm data-[disabled]:cursor-not-allowed",
        ],
        count: ["text-foreground/40", "group-data-[pressed]/toggle-group-item:text-foreground/60"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    disabled: {
      true: {
        root: "opacity-50",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export type ToggleGroupProps<T extends string = string> = StyledProps<
  Omit<BaseToggleGroup.Props<T>, "defaultValue" | "multiple" | "onValueChange" | "value">
> &
  Omit<VariantProps<typeof toggleGroup>, "theme"> & {
    value: T;
    onValueChange: (value: T, eventDetails: BaseToggleGroup.ChangeEventDetails) => void;
    ariaLabel?: string;
  };

export function ToggleGroup<T extends string = string>({
  value,
  onValueChange,
  ariaLabel,
  disabled = false,
  className,
  ...props
}: ToggleGroupProps<T>) {
  const { root } = toggleGroup({ disabled });
  return (
    <BaseToggleGroup
      value={[value]}
      onValueChange={(nextValue, eventDetails) => {
        const selectedValue = nextValue[0];
        if (selectedValue) onValueChange(selectedValue, eventDetails);
      }}
      aria-label={ariaLabel}
      disabled={disabled}
      data-slot="toggle-group"
      className={root({ className })}
      {...props}
    />
  );
}

export type ToggleGroupItemProps<T extends string = string> = StyledProps<BaseToggle.Props<T>>;

export function ToggleGroupItem<T extends string = string>({
  className,
  ...props
}: ToggleGroupItemProps<T>) {
  const theme = useTheme();
  const { item } = toggleGroup({ theme });
  return (
    <BaseToggle
      type="button"
      data-slot="toggle-group-item"
      className={item({ className: `group/toggle-group-item ${className ?? ""}`.trim() })}
      {...props}
    />
  );
}

export type ToggleGroupLabelProps = ComponentPropsWithRef<"span">;

export function ToggleGroupLabel({ className, ...props }: ToggleGroupLabelProps) {
  const { label } = toggleGroup();
  return <span data-slot="toggle-group-label" className={label({ className })} {...props} />;
}

export type ToggleGroupCountProps = ComponentPropsWithRef<"span">;

export function ToggleGroupCount({ className, ...props }: ToggleGroupCountProps) {
  const theme = useTheme();
  const { count } = toggleGroup({ theme });
  return <span data-slot="toggle-group-count" className={count({ className })} {...props} />;
}
