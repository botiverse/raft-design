import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const sectionLabel = tv({
  slots: {
    root: ["text-xs font-bold uppercase tracking-widest"],
  },
  variants: {
    theme: {
      brutal: {
        root: "text-foreground/60",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type SectionLabelProps = useRender.ComponentProps<"span">;

export function SectionLabel({ className, render, ...props }: SectionLabelProps) {
  const theme = useTheme();
  const { root } = sectionLabel({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "section-label",
    },
  });
}
