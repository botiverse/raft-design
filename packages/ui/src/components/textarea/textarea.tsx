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
          "shadow-raft-sm focus:shadow-raft-md",
          "data-invalid:border-brutal-red data-invalid:bg-brutal-red/5 data-invalid:shadow-none data-invalid:ring-2 data-invalid:ring-brutal-red/60",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        ],
      },
      elegant: {
        root: [
          "rounded-md border border-line-field bg-layer-panel shadow-none",
          "dark:bg-layer-inset dark:not-data-invalid:border-transparent",
          "dark:shadow-[inset_0_1px_2px_oklch(0_0_0_/_0.3),inset_0_0_0_1px_oklch(0_0_0_/_0.35),0_1px_0_oklch(0.985_0.004_106.42_/_0.04)]",
          "dark:hover:not-data-invalid:border-ink-8",
          "text-sm text-foreground transition duration-200 ease-out dark:text-foreground-strong",
          "placeholder:text-foreground-placeholder/70",
          "hover:not-data-invalid:border-line-field-hover",
          "focus:bg-layer-panel dark:focus:bg-layer-card",
          "focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
          "data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-danger/12 data-invalid:focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:border-line-muted/60 disabled:bg-fill-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
          "disabled:hover:border-line-muted/60",
          "data-invalid:disabled:border-line-muted/60 data-invalid:disabled:ring-0",
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
          "text-foreground-strong/50",
          "group-data-[invalid]/field:font-bold group-data-[invalid]/field:text-danger",
        ],
      },
      elegant: {
        root: [
          "text-[11px] leading-none text-foreground-placeholder/80 transition duration-200 ease-out",
          "group-data-[invalid]/field:font-medium group-data-[invalid]/field:text-danger",
        ],
      },
    },
    overLimit: {
      true: {
        root: "text-danger",
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
