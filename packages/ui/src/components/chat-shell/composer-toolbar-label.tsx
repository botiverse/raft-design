import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerToolbarLabel = tv({
  slots: {
    root: ["inline-flex cursor-pointer select-none items-center gap-1.5"],
    label: ["text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        label: "font-bold text-foreground/60",
      },
      elegant: {
        root: [
          "rounded-md border-0 bg-transparent px-2.5 py-1",
          "transition-colors hover:bg-layer-muted",
        ],
        label: "font-medium text-foreground-muted",
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

export type ComposerToolbarLabelTextProps = useRender.ComponentProps<"span">;

export function ComposerToolbarLabelText({
  className,
  render,
  ...props
}: ComposerToolbarLabelTextProps) {
  const theme = useThemeFamily();
  const { label } = composerToolbarLabel({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-toolbar-label-text",
    className: label({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
