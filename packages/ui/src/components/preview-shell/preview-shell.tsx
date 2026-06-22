import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv.ts";
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
        root: "border border-line-muted bg-layer-panel hover:border-line-subtle hover:bg-layer-muted",
      },
      muted: {
        root: "border-2 border-line-subtle bg-layer-muted italic text-foreground/40 hover:shadow-sm",
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
