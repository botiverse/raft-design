import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerToolbarLabel = tv({
  slots: {
    root: ["inline-flex cursor-pointer select-none items-center gap-1.5 text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        root: "font-bold text-foreground-strong/60",
      },
      elegant: {
        root: [
          "min-h-8 rounded-md border-0 bg-transparent px-2.5 py-1.5 font-medium text-foreground-muted",
          "transition-colors hover:bg-fill-muted",
        ],
      },
      raft: {
        root: [
          "min-h-8 gap-2",
          "font-sans text-callout font-semibold text-foreground",
          "has-data-disabled:cursor-not-allowed has-data-disabled:text-foreground-disabled",
        ],
      },
    },
  },
});

export type ComposerToolbarLabelProps = useRender.ComponentProps<"label">;

export function ComposerToolbarLabel({ className, render, ...props }: ComposerToolbarLabelProps) {
  const theme = useThemeFamily();
  const { root } = composerToolbarLabel({ theme });
  const defaultProps: SlotElementProps<"label"> = {
    "data-slot": "composer-toolbar-label",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "label",
    render,
    props: mergeProps<"label">(defaultProps, props),
  });
}
