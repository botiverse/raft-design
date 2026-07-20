import type { ComponentPropsWithRef } from "react";
import { dataPresence, isAriaTrue } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { WithoutChildren } from "../../lib/without-children";

const textarea = tv({
  slots: {
    root: ["block w-full min-h-24 resize-y px-3 py-2 outline-none"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-layer-panel font-heading",
          "shadow-sm focus:shadow-md",
          "data-invalid:border-brutal-red data-invalid:bg-brutal-red/5 data-invalid:shadow-none data-invalid:ring-2 data-invalid:ring-brutal-red/60",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        ],
      },
      elegant: {
        root: [
          "rounded-md border border-line-field bg-layer-field shadow-none",
          "text-sm text-foreground-strong transition duration-200 ease-out dark:text-foreground",
          "placeholder:text-foreground-placeholder/70",
          "hover:not-data-invalid:border-line-field-hover hover:shadow-field-hover",
          "focus:border-line-strong/25 focus:bg-layer-field",
          "focus-visible:ring-2 focus-visible:ring-line-strong/8",
          "data-invalid:border-danger-base/45 data-invalid:hover:border-danger-base/75 data-invalid:focus-visible:border-danger-base/75 data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-danger-base/12",
          "disabled:cursor-not-allowed disabled:border-line-subtle/60 disabled:bg-layer-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
          "disabled:hover:border-line-subtle/60 disabled:hover:shadow-none",
          "data-invalid:disabled:border-line-subtle/60 data-invalid:disabled:ring-0",
        ],
      },
    },
  },
});

const textareaGroup = tv({
  slots: {
    root: ["w-full"],
  },
  variants: {
    theme: {
      brutal: {
        root: "flex flex-col items-end gap-1",
      },
      elegant: {
        root: [
          "relative",
          "has-[>[data-slot=textarea-counter]]:[&>[data-slot=textarea]]:scroll-pb-6",
          "has-[>[data-slot=textarea-counter]]:[&>[data-slot=textarea]]:pr-16",
          "[&>[data-slot=textarea-counter]]:pointer-events-none [&>[data-slot=textarea-counter]]:absolute",
          "[&>[data-slot=textarea-counter]]:right-3 [&>[data-slot=textarea-counter]]:bottom-2.5 [&>[data-slot=textarea-counter]]:z-10",
        ],
      },
    },
  },
});

const textareaCounter = tv({
  slots: {
    root: ["font-mono text-xs tabular-nums"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "text-foreground/50",
          "group-data-[invalid]/field:font-bold group-data-[invalid]/field:text-danger-base",
        ],
      },
      elegant: {
        root: [
          "text-[11px] leading-none text-foreground-placeholder/80 transition duration-200 ease-out",
          "group-data-[invalid]/field:font-medium group-data-[invalid]/field:text-danger-base",
        ],
      },
    },
    overLimit: {
      true: {
        root: "text-danger-base",
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

export type TextareaProps = WithoutChildren<ComponentPropsWithRef<"textarea">>;

export type TextareaGroupProps = ComponentPropsWithRef<"div">;

export function TextareaGroup({ className, ...props }: TextareaGroupProps) {
  const theme = useThemeFamily();
  const { root } = textareaGroup({ theme });

  return <div data-slot="textarea-group" className={root({ className })} {...props} />;
}

export function Textarea({ className, "aria-invalid": ariaInvalid, ...props }: TextareaProps) {
  const theme = useThemeFamily();
  const { root } = textarea({ theme });

  return (
    <textarea
      data-slot="textarea"
      className={root({ className })}
      {...props}
      aria-invalid={ariaInvalid}
      {...(isAriaTrue(ariaInvalid) ? { "data-invalid": dataPresence(true) } : {})}
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
  const theme = useThemeFamily();
  const text = value ?? "";
  const length = count ?? getLength?.(text) ?? text.length;
  const overLimit = length > limit;
  const { root } = textareaCounter({ theme, overLimit });
  return (
    <span data-slot="textarea-counter" className={root({ className })} {...props}>
      {length}/{limit}
    </span>
  );
}
