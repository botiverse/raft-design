import type { ComponentPropsWithRef } from "react";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { WithoutChildren } from "../../lib/without-children";

const textarea = tv({
  slots: {
    root: [
      "block w-full min-h-24 resize-y py-2 pl-3 pr-(--ta-pr,0.75rem)",
      "scroll-pb-(--ta-scroll-pb,0)",
      "font-heading text-field font-field outline-none",
    ],
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
          "dark:bg-layer-card dark:not-data-invalid:border-transparent",
          "dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
          "dark:hover:not-data-invalid:border-ink-8",
          "text-foreground transition duration-200 ease-out dark:text-foreground-strong",
          "placeholder:text-foreground-placeholder/70",
          "hover:not-data-invalid:border-line-field-hover",
          "focus:bg-layer-panel dark:focus:bg-layer-card",
          "focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
          "data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-danger/12",
          "disabled:cursor-not-allowed disabled:border-line-muted/60 disabled:bg-fill-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
          "disabled:hover:border-line-muted/60",
          "data-invalid:disabled:border-line-muted/60 data-invalid:disabled:ring-0",
        ],
      },
      raft: {
        root: [
          "py-2.5",
          "rounded-control border-[1.5px] border-line-strong bg-layer-card",
          "text-foreground placeholder:text-foreground-placeholder",
          "shadow-none transition-shadow duration-90 ease-out focus:shadow-raft-focus",
          "data-invalid:border-danger-strong",
          "disabled:cursor-not-allowed disabled:resize-none disabled:border-line-muted disabled:bg-fill-muted disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
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
          // Mirrors “a counter part is rendered” into variables the textarea
          // reads, instead of styling a child from an ancestor :has()
          // (a whole-page recalc trap, #133).
          "has-[>[data-slot=textarea-counter]]:[--ta-pr:4rem]",
          "has-[>[data-slot=textarea-counter]]:[--ta-scroll-pb:1.5rem]",
          "*:data-[slot=textarea-counter]:pointer-events-none *:data-[slot=textarea-counter]:absolute",
          "[&>[data-slot=textarea-counter]]:right-3 [&>[data-slot=textarea-counter]]:bottom-2.5 *:data-[slot=textarea-counter]:z-10",
        ],
      },
      raft: {
        root: "flex flex-col items-end gap-1.5",
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
          "group-data-[invalid]/field:font-bold group-data-invalid/field:text-danger",
        ],
      },
      elegant: {
        root: [
          "text-[11px] leading-none text-foreground-placeholder/80 transition duration-200 ease-out",
          "group-data-[invalid]/field:font-medium group-data-invalid/field:text-danger",
        ],
      },
      raft: {
        root: [
          "text-mono-meta text-foreground-hint",
          "group-data-[invalid]/field:font-bold group-data-invalid/field:text-danger-strong",
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
  compoundVariants: [
    { theme: "raft", overLimit: true, class: { root: "font-bold text-danger-strong" } },
  ],
});

export type TextareaProps = WithoutChildren<ComponentPropsWithRef<"textarea">> & DataAttributes;

export type TextareaGroupProps = ComponentPropsWithRef<"div">;

export function TextareaGroup({ className, ...props }: TextareaGroupProps) {
  const theme = useThemeFamily();
  const { root } = textareaGroup({ theme });

  return <div data-slot="textarea-group" className={root({ className })} {...props} />;
}

export function Textarea({ className, "data-invalid": dataInvalid, ...props }: TextareaProps) {
  const theme = useThemeFamily();
  const { root } = textarea({ theme });

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
