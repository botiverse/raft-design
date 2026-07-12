import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./data-attributes";

const composerToolbarOption = tv({
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

export type ComposerToolbarOptionProps = useRender.ComponentProps<"label">;

export function ComposerToolbarOption({ className, render, ...props }: ComposerToolbarOptionProps) {
  const theme = useThemeFamily();
  const { root } = composerToolbarOption({ theme });
  const defaultProps: useRender.ElementProps<"label"> & DataAttributes = {
    "data-slot": "composer-toolbar-option",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "label",
    render,
    props: mergeProps<"label">(defaultProps, props),
  });
}

export type ComposerToolbarOptionLabelProps = useRender.ComponentProps<"span">;

export function ComposerToolbarOptionLabel({
  className,
  render,
  ...props
}: ComposerToolbarOptionLabelProps) {
  const theme = useThemeFamily();
  const { label } = composerToolbarOption({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-toolbar-option-label",
    className: label({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
