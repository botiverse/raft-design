import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tv } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerRoot = tv({
  base: ["relative flex w-full flex-col"],
  variants: {
    theme: {
      brutal: "gap-2",
      elegant: [
        "gap-1.5",
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
  },
});

export type ComposerRootProps = useRender.ComponentProps<"form">;

export function ComposerRoot({ className, render, ...props }: ComposerRootProps) {
  const theme = useThemeFamily();
  const defaultProps: SlotElementProps<"form"> = {
    "data-slot": "composer-root",
    className: composerRoot({ theme, className }),
  };

  return useRender({
    defaultTagName: "form",
    render,
    props: mergeProps<"form">(defaultProps, props),
  });
}
