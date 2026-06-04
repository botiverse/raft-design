import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Bordered list surface with a selected state and an optional interactive hover.
// shadow-brutal-sm maps to the brutal --shadow token (2px offset).
const surfaceListItem = tv({
  slots: {
    root: ["border-2 px-4 py-3 transition-colors"],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    selected: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
    interactive: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      selected: true,
      class: { root: "border-black bg-brutal-cyan/15 shadow-[var(--shadow)]" },
    },
    { theme: "brutal", selected: false, class: { root: "border-black/30 bg-white" } },
    {
      theme: "brutal",
      selected: false,
      interactive: true,
      class: { root: "hover:border-black hover:shadow-[var(--shadow)]" },
    },
  ],
  defaultVariants: {
    selected: false,
    interactive: true,
  },
});

export type SurfaceListItemProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof surfaceListItem>, "theme">;

export function SurfaceListItem({
  selected,
  interactive,
  className,
  render,
  ref,
  ...props
}: SurfaceListItemProps) {
  const theme = useTheme();
  const { root } = surfaceListItem({ theme, selected, interactive });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "surface-list-item",
    },
  });
}
