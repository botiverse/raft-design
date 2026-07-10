import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/button";
import type { DataAttributes } from "./app-shell";
import { chatMainPanel } from "./chat-main-panel.recipe";

export type ChatMainPanelComposerProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposer({ className, render, ...props }: ChatMainPanelComposerProps) {
  const theme = useThemeFamily();
  const { composer } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer",
    className: composer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerInputProps = useRender.ComponentProps<"textarea">;

export function ChatMainPanelComposerInput({
  className,
  render,
  ...props
}: ChatMainPanelComposerInputProps) {
  const theme = useThemeFamily();
  const { composerInput } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"textarea"> & DataAttributes = {
    rows: 1,
    "data-slot": "chat-main-panel-composer-input",
    className: composerInput({ className }),
  };

  return useRender({
    defaultTagName: "textarea",
    render,
    props: mergeProps<"textarea">(defaultProps, props),
  });
}

export type ChatMainPanelComposerToolbarProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerToolbar({
  className,
  render,
  ...props
}: ChatMainPanelComposerToolbarProps) {
  const theme = useThemeFamily();
  const { composerToolbar } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-toolbar",
    className: composerToolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerActionsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerActions({
  className,
  render,
  ...props
}: ChatMainPanelComposerActionsProps) {
  const theme = useThemeFamily();
  const { composerActions } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-actions",
    className: composerActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerMetaProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerMeta({
  className,
  render,
  ...props
}: ChatMainPanelComposerMetaProps) {
  const { composerMeta } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-meta",
    className: composerMeta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerIconButtonProps = Omit<
  ButtonProps,
  "className" | "size" | "variant"
> & {
  className?: string;
};

export function ChatMainPanelComposerIconButton({
  className,
  ...props
}: ChatMainPanelComposerIconButtonProps) {
  const theme = useThemeFamily();
  const { composerIconButton } = chatMainPanel({ theme });

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className={composerIconButton({ className })}
      {...props}
    />
  );
}

export type ChatMainPanelComposerSubmitProps = useRender.ComponentProps<"button">;

export function ChatMainPanelComposerSubmit({
  className,
  render,
  ...props
}: ChatMainPanelComposerSubmitProps) {
  const theme = useThemeFamily();
  const { composerSubmit } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "submit",
    "data-slot": "chat-main-panel-composer-submit",
    className: composerSubmit({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerAttachments({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentsProps) {
  const { composerAttachments } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachments",
    className: composerAttachments({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerAttachment({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentProps) {
  const { composerAttachment } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment",
    className: composerAttachment({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentImageProps = useRender.ComponentProps<"img">;

export function ChatMainPanelComposerAttachmentImage({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentImageProps) {
  const theme = useThemeFamily();
  const { composerAttachmentImage } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"img"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-image",
    className: composerAttachmentImage({ className }),
  };

  return useRender({
    defaultTagName: "img",
    render,
    props: mergeProps<"img">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentFileProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentFile({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentFileProps) {
  const theme = useThemeFamily();
  const { composerAttachmentFile } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-file",
    className: composerAttachmentFile({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentBodyProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentBody({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentBodyProps) {
  const { composerAttachmentBody } = chatMainPanel();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-body",
    className: composerAttachmentBody({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentTitleProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentTitle({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentTitleProps) {
  const theme = useThemeFamily();
  const { composerAttachmentTitle } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-title",
    className: composerAttachmentTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentMetaProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerAttachmentMeta({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentMetaProps) {
  const theme = useThemeFamily();
  const { composerAttachmentMeta } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-meta",
    className: composerAttachmentMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentRemoveProps = useRender.ComponentProps<"button">;

export function ChatMainPanelComposerAttachmentRemove({
  className,
  render,
  ...props
}: ChatMainPanelComposerAttachmentRemoveProps) {
  const theme = useThemeFamily();
  const { composerAttachmentRemove } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-main-panel-composer-attachment-remove",
    className: composerAttachmentRemove({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatMainPanelComposerDropOverlayProps = useRender.ComponentProps<"div">;

export function ChatMainPanelComposerDropOverlay({
  className,
  render,
  ...props
}: ChatMainPanelComposerDropOverlayProps) {
  const theme = useThemeFamily();
  const { composerDropOverlay } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-drop-overlay",
    className: composerDropOverlay({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelComposerDropOverlayLabelProps = useRender.ComponentProps<"span">;

export function ChatMainPanelComposerDropOverlayLabel({
  className,
  render,
  ...props
}: ChatMainPanelComposerDropOverlayLabelProps) {
  const theme = useThemeFamily();
  const { composerDropOverlayLabel } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-drop-overlay-label",
    className: composerDropOverlayLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentOverlayProps = useRender.ComponentProps<"span"> & {
  tone?: "uploading" | "failed";
};

export function ChatMainPanelComposerAttachmentOverlay({
  className,
  render,
  tone = "uploading",
  ...props
}: ChatMainPanelComposerAttachmentOverlayProps) {
  const theme = useThemeFamily();
  const { composerAttachmentOverlay } = chatMainPanel({ theme, attachmentTone: tone });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-overlay",
    "data-tone": tone,
    className: composerAttachmentOverlay({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelComposerAttachmentProgressProps = useRender.ComponentProps<"span"> & {
  value?: number;
};

export function ChatMainPanelComposerAttachmentProgress({
  className,
  render,
  style,
  value = 0,
  ...props
}: ChatMainPanelComposerAttachmentProgressProps) {
  const theme = useThemeFamily();
  const { composerAttachmentProgress, composerAttachmentProgressFill } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-composer-attachment-progress",
    className: composerAttachmentProgress({ className }),
    children: (
      <span
        className={composerAttachmentProgressFill()}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    ),
    style,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
