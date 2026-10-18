import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { composerAttachment as composerAttachmentRecipe } from "./composer-attachment.recipe";

export type ComposerAttachmentsProps = useRender.ComponentProps<"div">;

export function ComposerAttachments({ className, render, ...props }: ComposerAttachmentsProps) {
  const { attachments } = composerAttachmentRecipe();
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
  const { attachment } = composerAttachmentRecipe();
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
  const { attachmentFile } = composerAttachmentRecipe();
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
  const { attachmentImage } = composerAttachmentRecipe();
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
  const { attachmentTitle } = composerAttachmentRecipe();
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
  const { attachmentMeta } = composerAttachmentRecipe();
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
  const { attachmentUploadingOverlay } = composerAttachmentRecipe();

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
  const { attachmentUploadProgressBar, attachmentUploadProgressBarIndicator } =
    composerAttachmentRecipe();

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
  const { attachmentFailedOverlay } = composerAttachmentRecipe();
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
  const { attachmentRemove } = composerAttachmentRecipe();
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
