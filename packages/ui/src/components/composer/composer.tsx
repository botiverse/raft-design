import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { Button } from "../button/button";
import { ScrollAreaTextarea } from "../scroll-area/scroll-area-textarea";
import type { ScrollAreaTextareaProps } from "../scroll-area/types";
import type { ButtonProps } from "../button/button";
import { composer as composerRecipe } from "./composer.recipe";

export type ComposerProps = useRender.ComponentProps<"div">;

export function Composer({ className, render, ...props }: ComposerProps) {
  const { root } = composerRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

/**
 * A native `<textarea>` with ScrollArea's overlay scrollbar (`ScrollAreaTextarea`): `ref`,
 * `className` and the native props go to the textarea; `wrapperClassName` to the element that holds
 * it and the scrollbar; `trigger`, `size`, `hideDelay` and `overscroll` as on ScrollArea.
 */
export type ComposerInputProps = ScrollAreaTextareaProps;

export function ComposerInput({ className, wrapperClassName, ...props }: ComposerInputProps) {
  const { input, inputFrame } = composerRecipe();

  return (
    <ScrollAreaTextarea
      rows={1}
      data-slot="composer-input"
      {...props}
      className={input({ className })}
      wrapperClassName={inputFrame({ className: wrapperClassName })}
    />
  );
}

export type ComposerToolbarProps = useRender.ComponentProps<"div">;

export function ComposerToolbar({ className, render, ...props }: ComposerToolbarProps) {
  const { toolbar } = composerRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-toolbar",
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerActionsProps = useRender.ComponentProps<"div">;

export function ComposerActions({ className, render, ...props }: ComposerActionsProps) {
  const { actions } = composerRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerMetaProps = useRender.ComponentProps<"div">;

export function ComposerMeta({ className, render, ...props }: ComposerMetaProps) {
  const { meta } = composerRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerIconButtonProps = Omit<ButtonProps, "className" | "size" | "variant"> & {
  className?: string;
};

export function ComposerIconButton({ className, ...props }: ComposerIconButtonProps) {
  const { iconButton } = composerRecipe();

  return (
    <Button
      type="button"
      size="icon-md"
      variant="ghost"
      className={iconButton({ className })}
      {...props}
    />
  );
}

export type ComposerSubmitProps = Omit<ButtonProps, "variant">;

export function ComposerSubmit({ type = "submit", className, ...props }: ComposerSubmitProps) {
  const { submit } = composerRecipe();
  return <Button {...props} className={submit({ className })} type={type} variant="accent" />;
}
