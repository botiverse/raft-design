import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { FileText, Image as ImageIcon, Upload } from "lucide-react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/button";
import type { SlotElementProps } from "../../lib/data-attributes";
import { composerAttachment as composerAttachmentRecipe } from "./composer-attachment.recipe";
import { composerDropOverlay as composerDropOverlayRecipe } from "./composer-drop-overlay.recipe";
import { composer as composerRecipe } from "./composer.recipe";

export type ComposerProps = useRender.ComponentProps<"div">;

export function Composer({ className, render, ...props }: ComposerProps) {
  const theme = useThemeFamily();
  const { root } = composerRecipe({ theme });
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
  const theme = useThemeFamily();
  const { input } = composerRecipe({ theme });
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
  const theme = useThemeFamily();
  const { toolbar } = composerRecipe({ theme });
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
  const theme = useThemeFamily();
  const { actions } = composerRecipe({ theme });
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
  const theme = useThemeFamily();
  const { meta } = composerRecipe({ theme });
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
  const theme = useThemeFamily();
  const { iconButton } = composerRecipe({ theme });

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className={iconButton({ className })}
      {...props}
    />
  );
}

export type ComposerSubmitProps = Omit<ButtonProps, "variant">;

export function ComposerSubmit({ type = "submit", ...props }: ComposerSubmitProps) {
  return <Button {...props} type={type} variant="accent" />;
}

export type ComposerAttachmentsProps = useRender.ComponentProps<"div">;

export function ComposerAttachments({ className, render, ...props }: ComposerAttachmentsProps) {
  const theme = useThemeFamily();
  const { attachments } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-attachments",
    className: attachments({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerAttachmentProps = useRender.ComponentProps<"div">;

export function ComposerAttachment({ className, render, ...props }: ComposerAttachmentProps) {
  const theme = useThemeFamily();
  const { attachment } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-attachment",
    className: attachment({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerAttachmentFileProps = useRender.ComponentProps<"span">;

export function ComposerAttachmentFile({
  className,
  render,
  ...props
}: ComposerAttachmentFileProps) {
  const theme = useThemeFamily();
  const { attachmentFile } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-attachment-file",
    className: attachmentFile({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentImageProps = useRender.ComponentProps<"span">;

export function ComposerAttachmentImage({
  className,
  render,
  ...props
}: ComposerAttachmentImageProps) {
  const theme = useThemeFamily();
  const { attachmentImage } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-attachment-image",
    className: attachmentImage({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentBodyProps = useRender.ComponentProps<"span">;

export function ComposerAttachmentBody({
  className,
  render,
  ...props
}: ComposerAttachmentBodyProps) {
  const { attachmentBody } = composerAttachmentRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-attachment-body",
    className: attachmentBody({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentTitleProps = useRender.ComponentProps<"span">;

export function ComposerAttachmentTitle({
  className,
  render,
  ...props
}: ComposerAttachmentTitleProps) {
  const theme = useThemeFamily();
  const { attachmentTitle } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-attachment-title",
    className: attachmentTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentMetaProps = useRender.ComponentProps<"span">;

export function ComposerAttachmentMeta({
  className,
  render,
  ...props
}: ComposerAttachmentMetaProps) {
  const theme = useThemeFamily();
  const { attachmentMeta } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-attachment-meta",
    className: attachmentMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentUploadingOverlayProps = useRender.ComponentProps<"span">;

export function ComposerAttachmentUploadingOverlay({
  className,
  render,
  ...props
}: ComposerAttachmentUploadingOverlayProps) {
  const theme = useThemeFamily();
  const { attachmentUploadingOverlay } = composerAttachmentRecipe({ theme });

  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-attachment-uploading-overlay",
    className: attachmentUploadingOverlay({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentUploadProgressBarProps = Omit<
  useRender.ComponentProps<"span">,
  "children"
> & {
  value: number;
};

export function ComposerAttachmentUploadProgressBar({
  className,
  render,
  value,
  ...props
}: ComposerAttachmentUploadProgressBarProps) {
  const theme = useThemeFamily();
  const { attachmentUploadProgressBar, attachmentUploadProgressBarIndicator } =
    composerAttachmentRecipe({
      theme,
    });

  const progress = Math.max(4, Math.min(value, 100));
  const defaultProps: SlotElementProps<"span"> = {
    "aria-hidden": true,
    "data-slot": "composer-attachment-upload-progress-bar",
    className: attachmentUploadProgressBar({ className }),
    children: (
      <span
        data-slot="composer-attachment-upload-progress-bar-indicator"
        className={attachmentUploadProgressBarIndicator()}
        style={{ width: `${progress}%` }}
      />
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentFailedOverlayProps = useRender.ComponentProps<"span">;

export function ComposerAttachmentFailedOverlay({
  className,
  render,
  ...props
}: ComposerAttachmentFailedOverlayProps) {
  const theme = useThemeFamily();
  const { attachmentFailedOverlay } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-attachment-failed-overlay",
    className: attachmentFailedOverlay({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAttachmentRemoveProps = useRender.ComponentProps<"button">;

export function ComposerAttachmentRemove({
  className,
  render,
  ...props
}: ComposerAttachmentRemoveProps) {
  const theme = useThemeFamily();
  const { attachmentRemove } = composerAttachmentRecipe({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "composer-attachment-remove",
    className: attachmentRemove({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ComposerDropOverlayProps = useRender.ComponentProps<"div">;

export function ComposerDropOverlay({ className, render, ...props }: ComposerDropOverlayProps) {
  const theme = useThemeFamily();
  const { dropOverlay } = composerDropOverlayRecipe({ theme });
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
  const theme = useThemeFamily();
  const { dropOverlayLabel } = composerDropOverlayRecipe({ theme });
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

export function ComposerDropOverlayPrompt({
  children,
  className,
  ...props
}: ComposerDropOverlayPromptProps) {
  if (children) {
    return (
      <ComposerDropOverlayLabel className={className} {...props}>
        {children}
      </ComposerDropOverlayLabel>
    );
  }

  return (
    <ComposerDropOverlayLabel className={className} {...props}>
      <span aria-hidden className="relative flex h-10 w-22 items-center justify-center">
        <span className="absolute -translate-x-6 translate-y-1 -rotate-12 rounded-none bg-layer-panel p-2 shadow-md ring-1 ring-line-subtle">
          <FileText className="size-4 text-foreground-icon" />
        </span>
        <span className="absolute z-10 rounded-none bg-layer-panel p-2 shadow-md ring-1 ring-line-subtle">
          <Upload className="size-4 text-foreground-icon" />
        </span>
        <span className="absolute z-20 translate-x-7 translate-y-1 rotate-12 rounded-none bg-layer-panel p-2 shadow-md ring-1 ring-line-subtle">
          <ImageIcon className="size-4 text-foreground-icon" />
        </span>
      </span>
      <span>Drop files to attach</span>
    </ComposerDropOverlayLabel>
  );
}
