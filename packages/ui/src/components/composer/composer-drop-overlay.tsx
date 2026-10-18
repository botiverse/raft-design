import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { FileText, Image as ImageIcon, Upload } from "lucide-react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { composerDropOverlay as composerDropOverlayRecipe } from "./composer-drop-overlay.recipe";

export type ComposerDropOverlayProps = useRender.ComponentProps<"div">;

export function ComposerDropOverlay({ className, render, ...props }: ComposerDropOverlayProps) {
  const { dropOverlay } = composerDropOverlayRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-drop-overlay",
    className: dropOverlay({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerDropOverlayLabelProps = useRender.ComponentProps<"span">;

export function ComposerDropOverlayLabel({
  className,
  render,
  ...props
}: ComposerDropOverlayLabelProps) {
  const { dropOverlayLabel } = composerDropOverlayRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-drop-overlay-label",
    className: dropOverlayLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerDropOverlayPromptProps = ComposerDropOverlayLabelProps;

export function ComposerDropOverlayPrompt({ children, ...props }: ComposerDropOverlayPromptProps) {
  const { dropOverlayIcon, dropOverlayIconCluster } = composerDropOverlayRecipe();

  if (children) {
    return <ComposerDropOverlayLabel {...props}>{children}</ComposerDropOverlayLabel>;
  }

  return (
    <ComposerDropOverlayLabel {...props}>
      <span aria-hidden className={dropOverlayIconCluster()}>
        <span
          className={dropOverlayIcon({
            className: "absolute -translate-x-6 translate-y-1 -rotate-12",
          })}
        >
          <FileText className="text-foreground-muted" />
        </span>
        <span className={dropOverlayIcon({ className: "absolute z-10" })}>
          <Upload className="text-foreground-muted" />
        </span>
        <span
          className={dropOverlayIcon({
            className: "absolute z-20 translate-x-7 translate-y-1 rotate-12",
          })}
        >
          <ImageIcon className="text-foreground-muted" />
        </span>
      </span>
      <span>Drop files to attach</span>
    </ComposerDropOverlayLabel>
  );
}
