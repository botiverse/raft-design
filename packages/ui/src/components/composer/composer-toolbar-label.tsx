import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerToolbarLabel = tv({
  slots: {
    root: [
      "inline-flex cursor-pointer select-none items-center",
      "min-h-8 gap-2",
      "font-sans text-callout font-semibold text-foreground",
      "has-data-disabled:cursor-not-allowed has-data-disabled:text-foreground-disabled",
    ],
  },
});

export type ComposerToolbarLabelProps = useRender.ComponentProps<"label">;

export function ComposerToolbarLabel({ className, render, ...props }: ComposerToolbarLabelProps) {
  const { root } = composerToolbarLabel();
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
