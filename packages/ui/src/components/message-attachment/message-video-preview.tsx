import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageVideoPreview } from "./message-video-preview.recipe";

export type MessageVideoPreviewProps = useRender.ComponentProps<"div">;

export function MessageVideoPreview({ className, render, ...props }: MessageVideoPreviewProps) {
  const theme = useThemeFamily();
  const { root } = messageVideoPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-video-preview",
    },
  });
}

export type MessageVideoPreviewMediaProps = useRender.ComponentProps<"video">;

export function MessageVideoPreviewMedia({
  className,
  render,
  ...props
}: MessageVideoPreviewMediaProps) {
  const { media } = messageVideoPreview();
  const defaultProps: useRender.ElementProps<"video"> = {
    className: media({ className }),
  };

  return useRender({
    defaultTagName: "video",
    render,
    props: mergeProps<"video">(defaultProps, props),
    state: {
      slot: "message-video-preview-media",
    },
  });
}

export type MessageVideoPreviewFallbackProps = useRender.ComponentProps<"div">;

export function MessageVideoPreviewFallback({
  className,
  render,
  ...props
}: MessageVideoPreviewFallbackProps) {
  const { fallback } = messageVideoPreview();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: fallback({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-video-preview-fallback",
    },
  });
}

export type MessageVideoPreviewFailureContentProps = useRender.ComponentProps<"div">;

export function MessageVideoPreviewFailureContent({
  className,
  render,
  ...props
}: MessageVideoPreviewFailureContentProps) {
  const theme = useThemeFamily();
  const { failureContent } = messageVideoPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: failureContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-video-preview-failure-content",
    },
  });
}

export type MessageVideoPreviewFailureIconProps = useRender.ComponentProps<"span">;

export function MessageVideoPreviewFailureIcon({
  className,
  render,
  ...props
}: MessageVideoPreviewFailureIconProps) {
  const theme = useThemeFamily();
  const { failureIcon } = messageVideoPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: failureIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-video-preview-failure-icon",
    },
  });
}

export type MessageVideoPreviewFailureTitleProps = useRender.ComponentProps<"span">;

export function MessageVideoPreviewFailureTitle({
  className,
  render,
  ...props
}: MessageVideoPreviewFailureTitleProps) {
  const theme = useThemeFamily();
  const { failureTitle } = messageVideoPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: failureTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-video-preview-failure-title",
    },
  });
}

export type MessageVideoPreviewFailureActionProps = useRender.ComponentProps<"span">;

export function MessageVideoPreviewFailureAction({
  className,
  render,
  ...props
}: MessageVideoPreviewFailureActionProps) {
  const { failureAction } = messageVideoPreview();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: failureAction({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-video-preview-failure-action",
    },
  });
}

export type MessageVideoPreviewActionProps = useRender.ComponentProps<"button">;

export function MessageVideoPreviewAction({
  className,
  render,
  ...props
}: MessageVideoPreviewActionProps) {
  const theme = useThemeFamily();
  const { action } = messageVideoPreview({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-video-preview-action",
    },
  });
}
