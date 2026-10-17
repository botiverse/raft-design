import type { ComponentPropsWithRef } from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { WithoutChildren } from "../../lib/without-children";
import type { InputBehaviorProps } from "../input/input";

// InputGroup moves the input shell onto the wrapper so addons can live inside the
// bordered box. State styling is driven by the inner control via `has-*`.
const inputGroup = tv({
  slots: {
    root: [
      "group/input-group relative flex w-full min-w-0 items-center",
      // Mirrors “an inline-end trim is rendered” into a variable the control
      // reads, instead of styling a descendant from an ancestor :has()
      // (a whole-page recalc trap, #133).
      "has-data-[input-group-trim=inline-end]:[--ig-control-pr:0]",
    ],
    addon: [
      "flex shrink-0 items-center justify-center gap-2 px-3",
      "select-none",
      "[&>svg:not([class*='size-'])]:size-3.5",
    ],
    text: ["flex shrink-0 items-center px-3 text-sm", "select-none whitespace-nowrap"],
    // The bare control fills the row; the group owns the border/shadow/invalid.
    control: [
      "min-w-0 flex-1 bg-transparent py-2 pl-3 text-sm outline-none",
      "pr-(--ig-control-pr,0.75rem)",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-layer-panel shadow-raft-sm",
          "has-[[data-slot=input-group-control]:focus]:not-has-[[data-slot=input-group-control][data-invalid]]:shadow-raft-md",
          "has-[[data-slot=input-group-control][data-invalid]]:border-brutal-red has-[[data-slot=input-group-control][data-invalid]]:bg-brutal-red/5 has-[[data-slot=input-group-control][data-invalid]]:shadow-none has-[[data-slot=input-group-control][data-invalid]]:ring-2 has-[[data-slot=input-group-control][data-invalid]]:ring-brutal-red/60",
        ],
        addon: ["text-foreground-strong/50"],
        text: ["font-heading text-foreground-strong/50"],
        control: ["font-heading"],
      },
      elegant: {
        root: [
          // Focus/disabled state of the control flows to the addon/text parts
          // as variables the root sets on itself (self-:has), not as ancestor
          // :has() rules styling descendants (#133). Consumption falls back to
          // per-part defaults, so the container variant below does not need a
          // second, unprefixed color class (which the class merge would keep
          // over the variable read — found in review).
          "has-[[data-slot=input-group-control]:focus]:[--ig-addon-fg:var(--foreground-strong)]",
          "has-[[data-slot=input-group-control]:focus]:[--ig-text-fg:var(--foreground-muted)]",
          "has-[[data-slot=input-group-control]:disabled]:[--ig-addon-fg:var(--foreground-disabled)]",
          "has-[[data-slot=input-group-control]:disabled]:[--ig-text-fg:var(--foreground-disabled)]",
          "overflow-hidden rounded-md border border-line-field bg-layer-panel shadow-none",
          "dark:bg-layer-card dark:not-has-[[data-slot=input-group-control][data-invalid]]:border-transparent",
          "dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
          "dark:hover:not-has-[[data-slot=input-group-control][data-invalid]]:border-ink-8",
          "text-foreground transition duration-200 ease-out dark:text-foreground-strong",
          "hover:border-line-field-hover",
          "has-[[data-slot=input-group-control]:focus]:bg-layer-panel dark:has-[[data-slot=input-group-control]:focus]:bg-layer-card",
          "has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-primary-400",
          "dark:has-[[data-slot=input-group-control]:focus-visible]:ring-2 dark:has-[[data-slot=input-group-control]:focus-visible]:ring-primary-400/60",
          "has-[[data-slot=input-group-control][data-invalid]]:border-danger/45 has-[[data-slot=input-group-control][data-invalid]]:hover:border-danger/75 has-[[data-slot=input-group-control][data-invalid]:focus]:border-danger/75",
          "has-[[data-slot=input-group-control][data-invalid]:focus-visible]:ring-2 has-[[data-slot=input-group-control][data-invalid]:focus-visible]:ring-[color-mix(in_oklch,var(--danger)_60%,transparent)]",
          "has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:border-line-muted/60 has-[[data-slot=input-group-control]:disabled]:bg-fill-muted/50",
          "has-[[data-slot=input-group-control]:disabled]:hover:border-line-muted/60",
          "has-[[data-slot=input-group-control][data-invalid]:disabled]:border-line-muted/60 has-[[data-slot=input-group-control][data-invalid]:disabled]:ring-0",
        ],
        addon: [
          "text-(--ig-addon-fg,var(--ig-addon-fg-default,var(--foreground-muted))) transition duration-200 ease-out",
        ],
        text: [
          "text-(--ig-text-fg,var(--ig-text-fg-default,var(--foreground-placeholder))) transition duration-200 ease-out",
        ],
        control: [
          "text-foreground placeholder:text-foreground-placeholder/70 dark:text-foreground-strong",
          "transition duration-200 ease-out placeholder:transition placeholder:duration-200 placeholder:ease-out",
          "disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
        ],
      },
      raft: {
        root: [
          "h-11 overflow-hidden rounded-control border-[1.5px] border-line-strong bg-layer-card text-foreground",
          "shadow-none transition-shadow duration-90 ease-out focus-within:shadow-raft-focus",
          "has-[[data-slot=input-group-control][data-invalid]]:border-danger-strong",
          "has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:border-line-muted has-[[data-slot=input-group-control]:disabled]:bg-fill-muted",
          "has-[[data-slot=input-group-control]:disabled]:[--ig-addon-fg:var(--foreground-disabled)]",
          "has-[[data-slot=input-group-control]:disabled]:[--ig-text-fg:var(--foreground-disabled)]",
        ],
        addon: [
          "text-(--ig-addon-fg,var(--ig-addon-fg-default,var(--foreground-hint)))",
          "[&>svg:not([class*='size-'])]:size-4.5",
        ],
        text: [
          "font-mono text-mono-code",
          "text-(--ig-text-fg,var(--ig-text-fg-default,var(--foreground-hint)))",
        ],
        control: [
          "h-full py-0 font-heading text-field font-field",
          "text-foreground placeholder:text-foreground-placeholder",
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
          "self-stretch border-line-muted/90 bg-fill-muted/35",
          "dark:border-ink-6 dark:bg-layer-card/60",
          // A default for the color variable, not a color class: two unprefixed
          // color classes would merge and drop the variable read (review).
          "[--ig-addon-fg-default:var(--foreground-placeholder)]",
        ],
        text: [
          "self-stretch border-line-muted/90 bg-fill-muted/35",
          "dark:border-ink-6 dark:bg-layer-card/60",
          "[--ig-text-fg-default:var(--foreground-placeholder)]",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "container",
      class: {
        addon: "bg-brutal-yellow/30 font-bold text-foreground-strong/70",
        text: "bg-brutal-yellow/30 font-bold text-foreground-strong/70",
      },
    },
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
      theme: "brutal",
      variant: "container",
      align: "inline-start",
      class: { addon: "border-r-2 border-line-strong", text: "border-r-2 border-line-strong" },
    },
    {
      variant: "container",
      align: "inline-end",
      class: { addon: "border-l", text: "border-l" },
    },
    {
      theme: "brutal",
      variant: "container",
      align: "inline-end",
      class: { addon: "border-l-2 border-line-strong", text: "border-l-2 border-line-strong" },
    },
    {
      theme: "raft",
      variant: "default",
      align: "inline-start",
      class: { addon: "pr-2", text: "pr-0.5" },
    },
    {
      theme: "raft",
      variant: "default",
      align: "inline-end",
      class: { addon: "pl-2", text: "pl-0.5" },
    },
    {
      theme: "raft",
      variant: "container",
      class: {
        addon: "border-line-muted bg-fill-muted dark:border-line-muted dark:bg-fill-muted",
        text: "border-line-muted bg-fill-muted dark:border-line-muted dark:bg-fill-muted",
      },
    },
  ],
  defaultVariants: {
    align: "inline-start",
    variant: "default",
  },
});

export type InputGroupProps = ComponentPropsWithRef<"div">;

export function InputGroup({ className, ...props }: InputGroupProps) {
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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
  InputBehaviorProps &
  DataAttributes;

export function InputGroupInput({
  className,
  suppressPasswordManager,
  "data-invalid": dataInvalid,
  ...props
}: InputGroupInputProps) {
  const theme = useThemeFamily();
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
      data-invalid={dataInvalid || undefined}
      aria-invalid={dataInvalid ? "true" : undefined}
    />
  );
}
