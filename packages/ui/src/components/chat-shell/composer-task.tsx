import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./app-shell";

const composerTask = tv({
  slots: {
    toggle: [
      "inline-flex cursor-pointer select-none items-center gap-1.5",
      "rounded-md border-0 bg-transparent px-2.5 py-1",
      "transition-colors hover:bg-layer-muted",
    ],
    label: ["text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        label: "font-bold text-black/60",
      },
      elegant: {
        label: "font-medium text-foreground-muted",
      },
    },
  },
});

export type ComposerTaskToggleProps = useRender.ComponentProps<"label">;

export function ComposerTaskToggle({ className, render, ...props }: ComposerTaskToggleProps) {
  const theme = useThemeFamily();
  const { toggle } = composerTask({ theme });
  const defaultProps: useRender.ElementProps<"label"> & DataAttributes = {
    "data-slot": "composer-task-toggle",
    className: toggle({ className }),
  };

  return useRender({
    defaultTagName: "label",
    render,
    props: mergeProps<"label">(defaultProps, props),
  });
}

export type ComposerTaskLabelProps = useRender.ComponentProps<"span">;

export function ComposerTaskLabel({ className, render, ...props }: ComposerTaskLabelProps) {
  const theme = useThemeFamily();
  const { label } = composerTask({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-task-label",
    className: label({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
