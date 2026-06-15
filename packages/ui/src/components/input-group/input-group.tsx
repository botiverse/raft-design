import type { ComponentPropsWithRef } from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";
import { type InputBehaviorProps } from "../input/input.tsx";

// InputGroup moves the input shell onto the wrapper so addons can live inside the
// bordered box. State styling is driven by the inner control via `has-*`.
const inputGroup = tv({
  slots: {
    root: [
      "group/input-group relative flex w-full min-w-0 items-center",
      "has-[[data-input-group-trim=inline-end]]:[&_[data-slot=input-group-control]]:pr-0",
    ],
    addon: [
      "flex shrink-0 items-center justify-center gap-2 px-3",
      "select-none",
      "[&>svg:not([class*='size-'])]:size-3.5",
    ],
    text: ["flex shrink-0 items-center px-3 text-sm", "select-none whitespace-nowrap"],
    // The bare control fills the row; the group owns the border/shadow/invalid.
    control: ["min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-layer-panel shadow-sm",
          "has-[[data-slot=input-group-control]:focus]:not-has-[[data-slot=input-group-control][aria-invalid=true]]:shadow-md",
          "has-[[data-slot=input-group-control][aria-invalid=true]]:border-danger-base has-[[data-slot=input-group-control][aria-invalid=true]]:bg-danger-base/5 has-[[data-slot=input-group-control][aria-invalid=true]]:shadow-none has-[[data-slot=input-group-control][aria-invalid=true]]:ring-2 has-[[data-slot=input-group-control][aria-invalid=true]]:ring-danger-base/60",
        ],
        addon: ["text-foreground/50"],
        text: ["font-display text-foreground/50"],
        control: ["font-display"],
      },
      elegant: {
        root: [
          "overflow-hidden rounded-md border border-[oklch(0.94_0_0)] bg-layer-field shadow-none",
          "text-[oklch(0.205_0_0)] transition duration-200 ease-out dark:text-foreground",
          "hover:border-[oklch(0.91_0_0)] hover:shadow-[oklch(0_0_0_/_0)_0px_0px_0px_0px,oklch(0_0_0_/_0)_0px_0px_0px_0px,oklch(0.159_0.016_266.594_/_0.03)_0px_1px_2px_0px]",
          "has-[[data-slot=input-group-control]:focus]:border-line-strong/25 has-[[data-slot=input-group-control]:focus]:bg-layer-field",
          "has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-line-strong/8",
          "has-[[data-slot=input-group-control][aria-invalid=true]]:border-danger-base/45 has-[[data-slot=input-group-control][aria-invalid=true]]:hover:border-danger-base/75 has-[[data-slot=input-group-control][aria-invalid=true]:focus]:border-danger-base/75",
          "has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:ring-3 has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:ring-danger-base/12",
          "has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:border-line-subtle/60 has-[[data-slot=input-group-control]:disabled]:bg-layer-muted/50",
          "has-[[data-slot=input-group-control]:disabled]:hover:border-line-subtle/60 has-[[data-slot=input-group-control]:disabled]:hover:shadow-none",
          "has-[[data-slot=input-group-control][aria-invalid=true]:disabled]:border-line-subtle/60 has-[[data-slot=input-group-control][aria-invalid=true]:disabled]:ring-0",
        ],
        addon: [
          "text-foreground-muted transition duration-200 ease-out",
          "group-has-[[data-slot=input-group-control]:focus]/input-group:text-foreground",
          "group-has-[[data-slot=input-group-control]:disabled]/input-group:text-foreground-disabled",
        ],
        text: [
          "text-foreground-placeholder transition duration-200 ease-out",
          "group-has-[[data-slot=input-group-control]:focus]/input-group:text-foreground-muted",
          "group-has-[[data-slot=input-group-control]:disabled]/input-group:text-foreground-disabled",
        ],
        control: [
          "text-[oklch(0.205_0_0)] placeholder:text-foreground-placeholder/70 dark:text-foreground",
          "transition duration-200 ease-out placeholder:transition placeholder:duration-200 placeholder:ease-out",
          "disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
        ],
      },
    },
    align: {
      "inline-start": { addon: "order-first", text: "order-first" },
      "inline-end": { addon: "order-last", text: "order-last" },
    },
    variant: {
      default: {},
      container: {
        addon: [
          "self-stretch border-line-subtle/90 bg-layer-muted/35",
          "text-foreground-placeholder",
        ],
        text: [
          "self-stretch border-line-subtle/90 bg-layer-muted/35",
          "text-foreground-placeholder",
        ],
      },
    },
  },
  compoundVariants: [
    {
      variant: "default",
      align: "inline-start",
      class: {
        addon: "[&~[data-slot=input-group-control]]:pl-0",
        text: "[&~[data-slot=input-group-control]]:pl-0",
      },
    },
    {
      variant: "container",
      align: "inline-start",
      class: { addon: "border-r", text: "border-r" },
    },
    {
      variant: "container",
      align: "inline-end",
      class: { addon: "border-l", text: "border-l" },
    },
  ],
  defaultVariants: {
    align: "inline-start",
    variant: "default",
  },
});

export type InputGroupProps = ComponentPropsWithRef<"div">;

export function InputGroup({ className, ...props }: InputGroupProps) {
  const theme = useTheme();
  const { root } = inputGroup({ theme });
  return <div data-slot="input-group" className={root({ className })} {...props} />;
}

export type InputGroupAddonProps = ComponentPropsWithRef<"div"> &
  Pick<VariantProps<typeof inputGroup>, "align" | "variant">;

// A non-editable slot inside the group — a leading icon, a `/` prefix, a trailing
// unit, etc.
function InputGroupAddonRoot({
  align = "inline-start",
  variant = "default",
  className,
  ...props
}: InputGroupAddonProps) {
  const theme = useTheme();
  const { addon } = inputGroup({ theme, align, variant });
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      data-variant={variant}
      data-input-group-trim={variant === "default" && align === "inline-end" ? align : undefined}
      className={addon({ className })}
      {...props}
    />
  );
}

export type InputGroupAddonTextProps = ComponentPropsWithRef<"span"> &
  Pick<VariantProps<typeof inputGroup>, "align" | "variant">;

function TextAddon({
  align = "inline-start",
  variant = "default",
  className,
  ...props
}: InputGroupAddonTextProps) {
  const theme = useTheme();
  const { text } = inputGroup({ theme, align, variant });
  return (
    <span
      data-slot="input-group-text"
      data-align={align}
      data-variant={variant}
      data-input-group-trim={variant === "default" && align === "inline-end" ? align : undefined}
      className={text({ className })}
      {...props}
    />
  );
}

export const InputGroupAddon = Object.assign(InputGroupAddonRoot, {
  Text: TextAddon,
});

// The bare control inside an InputGroup — the group owns the border/shadow/invalid look.
export type InputGroupInputProps = WithoutChildren<StyledProps<BaseInput.Props>> &
  InputBehaviorProps;

export function InputGroupInput({
  className,
  suppressPasswordManager,
  ...props
}: InputGroupInputProps) {
  const theme = useTheme();
  const { control } = inputGroup({ theme });

  return (
    <BaseInput
      data-slot="input-group-control"
      className={control({ className: [suppressPasswordManager && "keeper-ignore", className] })}
      data-1p-ignore={suppressPasswordManager ? "true" : undefined}
      data-bwignore={suppressPasswordManager ? "true" : undefined}
      data-form-type={suppressPasswordManager ? "other" : undefined}
      data-lpignore={suppressPasswordManager ? "true" : undefined}
      {...props}
    />
  );
}
