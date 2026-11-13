import type { ComponentPropsWithRef } from "react";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { WithoutChildren } from "../../lib/without-children";

// The field's classes that Textarea and a ScrollAreaTextarea drawn as the field share, so the two
// can't drift apart: type, surface and ink.
const fieldType = "font-heading text-field font-field outline-none";
const fieldSurface = "rounded-(--control-radius) border-[1.5px] border-line-field bg-layer-card";
const fieldInk = "text-foreground placeholder:text-foreground-hint";

const textarea = tv({
  slots: {
    root: [
      "block w-full min-h-[calc(var(--field-line-height)*3+--spacing(6))] resize-y pl-3 pr-(--ta-pr,0.75rem)",
      "scroll-pb-(--ta-scroll-pb,0)",
      fieldType,
      "py-2.5",
      fieldSurface,
      fieldInk,
      "shadow-none transition-shadow duration-90 ease-out focus-visible:shadow-focus",
      "data-invalid:border-danger-strong",
      "disabled:cursor-not-allowed disabled:resize-none disabled:border-line-hairline disabled:bg-fill-muted disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
    ],
  },
});

/**
 * Textarea's look for a `ScrollAreaTextarea` (textarea.md, "A field that
 * scrolls"): `wrapper()` is its `wrapperClassName`, `textarea()` its
 * `className`. A ScrollAreaTextarea is a frame around a native textarea, so
 * the field's look is split over the two. The frame takes the border, the
 * radius, the background, the states it reads from the textarea inside it
 * (focus ring, `data-invalid`, disabled) and the field's size: Textarea's
 * least height of three lines, and your cap, `wrapper({ className: "max-h-40" })`,
 * which the textarea then fills and scrolls in (the frame is a grid, and its
 * one row may shrink below the text's height: an `auto` row would let the
 * textarea run out of a capped frame). The textarea takes the type and the
 * padding.
 */
export const textareaScrollAreaVariants = tv({
  slots: {
    wrapper: [
      "w-full min-h-[calc(var(--field-line-height)*3+--spacing(6))] grid-rows-[minmax(0,1fr)]",
      fieldSurface,
      "shadow-none transition-shadow duration-90 ease-out has-focus-visible:shadow-focus",
      "has-data-invalid:border-danger-strong",
      "has-disabled:border-line-hairline has-disabled:bg-fill-muted",
    ],
    textarea: [
      "block w-full max-h-full pl-3 pr-(--ta-pr,0.75rem)",
      "scroll-pb-(--ta-scroll-pb,0)",
      fieldType,
      "py-2.5",
      "rounded-[inherit] border-0 bg-transparent",
      fieldInk,
      "disabled:cursor-not-allowed disabled:resize-none disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
    ],
  },
});

const textareaGroup = tv({
  slots: {
    root: ["w-full", "flex flex-col items-end gap-1.5"],
  },
});

const textareaCounter = tv({
  slots: {
    root: [
      "font-mono tabular-nums",
      "text-mono-meta text-foreground-hint",
      "group-data-[invalid]/field:font-bold group-data-invalid/field:text-danger-strong",
    ],
  },
  variants: {
    overLimit: {
      true: {
        root: ["font-bold text-danger-strong"],
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    overLimit: false,
  },
});

export type TextareaProps = WithoutChildren<ComponentPropsWithRef<"textarea">> & DataAttributes;

export type TextareaGroupProps = ComponentPropsWithRef<"div">;

export function TextareaGroup({ className, ...props }: TextareaGroupProps) {
  const { root } = textareaGroup();

  return <div data-slot="textarea-group" className={root({ className })} {...props} />;
}

export function Textarea({ className, "data-invalid": dataInvalid, ...props }: TextareaProps) {
  const { root } = textarea();

  return (
    <textarea
      data-slot="textarea"
      className={root({ className })}
      {...props}
      data-invalid={dataInvalid || undefined}
      aria-invalid={dataInvalid ? "true" : undefined}
    />
  );
}

export interface TextareaCounterProps extends WithoutChildren<ComponentPropsWithRef<"span">> {
  value?: string;
  count?: number;
  limit: number;
  getLength?: (value: string) => number;
}

export function TextareaCounter({
  value,
  count,
  limit,
  getLength,
  className,
  ...props
}: TextareaCounterProps) {
  const text = value ?? "";
  const length = count ?? getLength?.(text) ?? text.length;
  const overLimit = length > limit;
  const { root } = textareaCounter({ overLimit });
  return (
    <span data-slot="textarea-counter" className={root({ className })} {...props}>
      {length}/{limit}
    </span>
  );
}
