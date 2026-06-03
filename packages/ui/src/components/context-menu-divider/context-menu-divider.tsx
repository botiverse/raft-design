import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

const contextMenuDivider = tv({
  slots: {
    root: ["border-t-2"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-black"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type ContextMenuDividerProps = WithoutChildren<StyledProps<BaseSeparator.Props>>;

export function ContextMenuDivider({ className, ...props }: ContextMenuDividerProps) {
  const theme = useTheme();
  const { root } = contextMenuDivider({ theme });
  return (
    <BaseSeparator data-slot="context-menu-divider" className={root({ className })} {...props} />
  );
}
