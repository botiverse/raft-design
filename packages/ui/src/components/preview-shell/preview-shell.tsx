import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const previewShell = tv({
  slots: {
    root: [],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    variant: {
      default: {
        root: "border border-surface-border/15 bg-surface hover:border-surface-border/30 hover:bg-surface-muted",
      },
      muted: {
        root: "border-2 border-surface-border/30 bg-surface-muted italic text-black/40 hover:[box-shadow:var(--surface-shadow-sm)]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type PreviewShellProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof previewShell>, "theme"> & {
    "data-testid"?: string;
  };

export function PreviewShell({ variant, className, render, ...props }: PreviewShellProps) {
  const theme = useTheme();
  const { root } = previewShell({ theme, variant });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "preview-shell",
      variant,
    },
  });
}
