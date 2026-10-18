import type { ComponentPropsWithRef } from "react";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { WithoutChildren } from "../../lib/without-children";

const textarea = tv({
  slots: {
    root: [
      "block w-full min-h-24 resize-y pl-3 pr-(--ta-pr,0.75rem)",
      "scroll-pb-(--ta-scroll-pb,0)",
      "font-heading text-field font-field outline-none",
      "py-2.5",
      "rounded-control border-[1.5px] border-line-strong bg-layer-card",
      "text-foreground placeholder:text-foreground-placeholder",
      "shadow-none transition-shadow duration-90 ease-out focus:shadow-raft-focus",
      "data-invalid:border-danger-strong",
      "disabled:cursor-not-allowed disabled:resize-none disabled:border-line-muted disabled:bg-fill-muted disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
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
