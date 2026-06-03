import type { ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// The canonical "subtle preview surface" skin: a 1px black/15 border, white bg,
// no shadow, hover deepens the border and adds a faint bg. `muted` is the
// unavailable variant. Layout is caller-supplied via `className`. No `active`
// token — press inherits hover. shadow-brutal-sm maps to the brutal --shadow token.
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
        root: "border border-black/15 bg-white hover:border-black/30 hover:bg-black/5",
      },
      muted: {
        root: "border-2 border-black/30 bg-black/5 italic text-black/40 hover:shadow-[var(--shadow)]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type PreviewShellProps = Omit<VariantProps<typeof previewShell>, "theme"> & {
  /** When provided, the root renders as a polymorphic `<button>`; otherwise a `<div>`. */
  onClick?: () => void;
  className?: string;
  title?: string;
  "data-testid"?: string;
  "aria-busy"?: "true" | "false";
  children: ReactNode;
};

export function PreviewShell({
  variant,
  onClick,
  className,
  title,
  children,
  ...rest
}: PreviewShellProps) {
  const theme = useTheme();
  const { root } = previewShell({ theme, variant });
  const cls = root({ className });
  if (onClick) {
    return (
      <BaseButton
        type="button"
        onClick={onClick}
        title={title}
        data-slot="preview-shell"
        className={cls}
        {...rest}
      >
        {children}
      </BaseButton>
    );
  }
  return (
    <div title={title} data-slot="preview-shell" className={cls} {...rest}>
      {children}
    </div>
  );
}
