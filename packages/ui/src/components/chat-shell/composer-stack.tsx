import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import type { DataAttributes } from "./app-shell";

const composerStack = tv({
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

export type ComposerStackProps = useRender.ComponentProps<"div"> &
  VariantProps<typeof composerStack>;

export function ComposerStack({ className, positioned, render, ...props }: ComposerStackProps) {
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "composer-stack",
    className: composerStack({ positioned, className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
