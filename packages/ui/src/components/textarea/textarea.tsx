import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

const textarea = tv({
  slots: {
    root: ["block w-full min-h-24 resize-y px-3 py-2 outline-none"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-layer-panel font-display",
          "shadow-sm focus:shadow-md",
          "aria-invalid:border-brutal-red aria-invalid:bg-brutal-red/5 aria-invalid:shadow-none aria-invalid:ring-2 aria-invalid:ring-brutal-red/60",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        ],
      },
      elegant: {
        root: [
          "rounded-md border border-line-subtle/90 bg-layer-field",
          "text-sm text-foreground transition duration-200 ease-out",
          "placeholder:text-foreground-placeholder/70",
          "hover:bg-layer-muted/35",
          "focus:border-line-strong/25 focus:bg-layer-field",
          "focus-visible:ring-2 focus-visible:ring-line-strong/8",
          "aria-invalid:border-danger-base/45 aria-invalid:focus-visible:border-danger-base/75 aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-danger-base/12",
          "disabled:cursor-not-allowed disabled:border-line-subtle/60 disabled:bg-layer-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
          "aria-invalid:disabled:border-line-subtle/60 aria-invalid:disabled:ring-0",
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
  const theme = useTheme();
  const { root } = textareaGroup({ theme });

  return <div data-slot="textarea-group" className={root({ className })} {...props} />;
}

export function Textarea({ className, ...props }: TextareaProps) {
  const theme = useTheme();
  const { root } = textarea({ theme });

  return <textarea data-slot="textarea" className={root({ className })} {...props} />;
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
  const theme = useTheme();
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
