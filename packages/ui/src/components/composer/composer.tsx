import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { Button } from "../button/button";
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

export type ComposerInputProps = useRender.ComponentProps<"textarea">;

export function ComposerInput({ className, render, ...props }: ComposerInputProps) {
  const { input } = composerRecipe();
  const defaultProps: SlotElementProps<"textarea"> = {
    rows: 1,
    "data-slot": "composer-input",
    className: input({ className }),
  };

  return useRender({
    defaultTagName: "textarea",
    render,
    props: mergeProps<"textarea">(defaultProps, props),
  });
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
