import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerRoot = tv({
  base: ["relative flex w-full flex-col", "gap-2"],
});

export type ComposerRootProps = useRender.ComponentProps<"form">;

export function ComposerRoot({ className, render, ...props }: ComposerRootProps) {
  const defaultProps: SlotElementProps<"form"> = {
    "data-slot": "composer-root",
    className: composerRoot({ className }),
  };

  return useRender({
    defaultTagName: "form",
    render,
    props: mergeProps<"form">(defaultProps, props),
  });
}
