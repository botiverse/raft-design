import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

// The brutal field visual (formerly the app's `.input-brutal` class). The error
// state is driven by `aria-invalid` so the control styles itself while Field /
// FieldError own the message.
const textarea = tv({
  base: ["w-full px-3 py-2 font-display"],
  variants: {
    theme: {
      brutal: [
        "border-2 border-black bg-white",
        "shadow-[var(--shadow)] focus:shadow-[var(--shadow-hover)] focus:outline-none",
        "aria-invalid:border-brutal-red aria-invalid:bg-brutal-red/5 aria-invalid:ring-2 aria-invalid:ring-brutal-red/60",
      ],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
  },
});

const textareaCounter = tv({
  base: ["font-mono text-xs tabular-nums"],
  variants: {
    theme: {
      brutal: [
        "text-black/50",
        "group-data-[invalid]/field:font-bold group-data-[invalid]/field:text-brutal-red",
      ],
      elegant: [],
    },
    overLimit: {
      true: "font-bold text-brutal-red",
      false: "",
    },
  },
  defaultVariants: {
    overLimit: false,
  },
});

export type TextareaProps = WithoutChildren<ComponentPropsWithRef<"textarea">>;

function TextareaRoot({ className, ...props }: TextareaProps) {
  const theme = useTheme();
  return <textarea data-slot="textarea" className={textarea({ theme, className })} {...props} />;
}

export interface TextareaCounterProps extends WithoutChildren<ComponentPropsWithRef<"span">> {
  /** Current text whose length is counted (ignored when `count` is set). */
  value?: string;
  /** Override the counted length directly (e.g. Unicode code points). */
  count?: number;
  /** Limit shown after the slash; the counter turns red once length exceeds it. */
  limit: number;
  /** Custom length function — defaults to `value.length`. */
  getLength?: (value: string) => number;
}

// Standalone character counter — place it inside a Field next to the Textarea.
// Turns red over the limit, or whenever its Field is `data-invalid`.
function Counter({ value, count, limit, getLength, className, ...props }: TextareaCounterProps) {
  const theme = useTheme();
  const length =
    count !== undefined ? count : getLength ? getLength(value ?? "") : (value ?? "").length;
  const overLimit = length > limit;
  return (
    <span
      data-slot="textarea-counter"
      className={textareaCounter({ theme, overLimit, className })}
      {...props}
    >
      {length}/{limit}
    </span>
  );
}

export const Textarea = Object.assign(TextareaRoot, { Counter });
