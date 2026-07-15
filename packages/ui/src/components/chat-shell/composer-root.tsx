import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tv, type VariantProps } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerRoot = tv({
  base: ["flex w-full flex-col gap-2"],
  variants: {
    theme: {
      brutal: {},
      elegant: [
        "has-[>[data-slot=composer-attachments]]:relative",
        "has-[>[data-slot=composer-attachments]]:isolate",
        "has-[>[data-slot=composer-attachments]]:before:pointer-events-none",
        "has-[>[data-slot=composer-attachments]]:before:absolute",
        "has-[>[data-slot=composer-attachments]]:before:-inset-1",
        "has-[>[data-slot=composer-attachments]]:before:-z-10",
        "has-[>[data-slot=composer-attachments]]:before:rounded-xl",
        "has-[>[data-slot=composer-attachments]]:before:bg-[color-mix(in_oklch,var(--layer-muted)_35%,var(--layer-panel))]",
        "has-[>[data-slot=composer-attachments]]:before:ring-1",
        "has-[>[data-slot=composer-attachments]]:before:ring-line-subtle/60",
      ],
    },
    positioned: {
      true: "relative",
      false: "",
    },
  },
  defaultVariants: {
    positioned: false,
  },
});

export type ComposerRootProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof composerRoot>, "theme">;

export function ComposerRoot({ className, positioned, render, ...props }: ComposerRootProps) {
  const theme = useThemeFamily();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-root",
    className: composerRoot({ theme, positioned, className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
