import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerRoot = tv({
  base: ["flex w-full flex-col gap-2"],
  variants: {
    positioned: {
      true: "relative",
      false: "",
    },
  },
  defaultVariants: {
    positioned: false,
  },
});

export type ComposerRootProps = useRender.ComponentProps<"div"> & VariantProps<typeof composerRoot>;

export function ComposerRoot({ className, positioned, render, ...props }: ComposerRootProps) {
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-root",
    className: composerRoot({ positioned, className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
