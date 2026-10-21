import type { ComponentPropsWithRef } from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import { useOverflowTitle } from "../../lib/use-overflow-title";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
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
      // (a whole-page recalc trap, #386).
      "has-data-[input-group-trim=inline-end]:[--ig-control-pr:0]",
      "h-control overflow-hidden rounded-control border-[1.5px] border-line-field bg-layer-card text-foreground",
      "shadow-none transition-shadow duration-90 ease-out has-focus-visible:shadow-focus",
      "has-[[data-slot=input-group-control][data-invalid]]:border-danger-strong",
      "has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:border-line-hairline has-[[data-slot=input-group-control]:disabled]:bg-fill-muted",
      "has-[[data-slot=input-group-control]:disabled]:[--ig-addon-fg:var(--foreground-disabled)]",
      "has-[[data-slot=input-group-control]:disabled]:[--ig-text-fg:var(--foreground-disabled)]",
    ],
    addon: [
      "flex shrink-0 items-center justify-center gap-2 px-3",
      "select-none",
      "text-(--ig-addon-fg,var(--ig-addon-fg-default,var(--foreground-hint)))",
      "[&>svg:not([class*='size-'])]:size-4.5",
    ],
    // Centered with flex, not `align-content` on a block: that needs Safari
    // 17.4, and older iOS would set the text at the top. The text truncates in
    // its own span (textInner), since a flex container can't show an ellipsis.
    text: [
      "flex min-w-0 max-w-1/2 shrink-0 items-center px-3",
      "select-none",
      "font-mono text-mono-code",
      "text-(--ig-text-fg,var(--ig-text-fg-default,var(--foreground-hint)))",
    ],
    textInner: ["min-w-0 truncate"],
    // The bare control fills the row; the group owns the border/shadow/invalid.
    control: [
      "min-w-0 flex-1 bg-transparent pl-3 outline-none",
      "pr-(--ig-control-pr,0.75rem)",
      "h-full py-0 font-heading text-field font-field",
      "text-foreground placeholder:text-foreground-hint",
      "disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
    ],
  },
  variants: {
    align: {
      "inline-start": { addon: "order-first", text: "order-first" },
      "inline-end": { addon: "order-last", text: "order-last" },
    },
    variant: {
      default: {},
      container: {
        addon: [
          "self-stretch",
          // A default for the color variable, not a color class: two unprefixed
          // color classes would merge and drop the variable read (review).
          "[--ig-addon-fg-default:var(--foreground-hint)]",
          "border-line-hairline bg-fill-muted",
        ],
        text: [
          "self-stretch",
          "[--ig-text-fg-default:var(--foreground-hint)]",
          "border-line-hairline bg-fill-muted",
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
    {
      variant: "default",
      align: "inline-start",
      class: { addon: "pr-2", text: "pr-0.5" },
    },
    {
      variant: "default",
      align: "inline-end",
      class: {
        addon: [
          "pl-2",
          // A Button here is embedded in the field: 6px inside its outer edge
          // on every side when it ends the field, with the embedded corner
          // (design/foundations/shape.md#inside-a-frame).
          "*:data-[slot=button]:size-control-embedded *:data-[slot=button]:rounded-chip",
          "[&>[data-slot=button]_svg:not([class*='size-'])]:size-4",
          "[&>[data-slot=button]:last-child]:me-[calc(var(--control-embedded-inset)-0.75rem-1px)]",
        ],
        text: "pl-0.5",
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
  const { root } = inputGroup();
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
  const { addon } = inputGroup({ align, variant });
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
  ref,
  title,
  children,
  ...props
}: InputGroupAddonTextProps) {
  const { text, textInner } = inputGroup({ align, variant });
  const overflowRef = useOverflowTitle(ref, title);
  return (
    <span
      ref={overflowRef}
      title={title}
      data-slot="input-group-text"
      data-align={align}
      data-variant={variant}
      data-input-group-trim={variant === "default" && align === "inline-end" ? align : undefined}
      className={text({ className })}
      {...props}
    >
      <span data-slot="input-group-text-value" className={textInner()}>
        {children}
      </span>
    </span>
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
  const { control } = inputGroup();

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
