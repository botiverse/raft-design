import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { messageItem, type DataAttributes } from "./recipe";

export type MessageImageGalleryProps = useRender.ComponentProps<"div">;

export function MessageImageGallery({ className, render, ...props }: MessageImageGalleryProps) {
  const { imageGallery } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: imageGallery({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-image-gallery",
    },
  });
}

export type MessageImageGalleryRowProps = useRender.ComponentProps<"div">;

export function MessageImageGalleryRow({
  className,
  render,
  ...props
}: MessageImageGalleryRowProps) {
  const { imageGalleryRow } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: imageGalleryRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-image-gallery-row",
    },
  });
}

export type MessageImageGalleryItemProps = useRender.ComponentProps<"div"> & {
  optimistic?: boolean;
  single?: boolean;
};

export function MessageImageGalleryItem({
  optimistic,
  single,
  className,
  render,
  ...props
}: MessageImageGalleryItemProps) {
  const { imageGalleryItem } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-optimistic": optimistic ? "true" : undefined,
    "data-single": single ? "true" : undefined,
    className: imageGalleryItem({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-image-gallery-item",
    },
  });
}

export type MessageImageGalleryMediaProps = useRender.ComponentProps<"img"> & {
  fit?: "contain" | "cover";
};

export function MessageImageGalleryMedia({
  fit = "cover",
  className,
  render,
  ...props
}: MessageImageGalleryMediaProps) {
  const { imageGalleryMedia } = messageItem();
  const defaultProps: useRender.ElementProps<"img"> & DataAttributes = {
    "data-fit": fit,
    className: imageGalleryMedia({ className }),
  };

  return useRender({
    defaultTagName: "img",
    render,
    props: mergeProps<"img">(defaultProps, props),
    state: {
      slot: "message-image-gallery-media",
    },
  });
}

export type MessageImageGalleryOverlayProps = useRender.ComponentProps<"div">;

export function MessageImageGalleryOverlay({
  className,
  render,
  ...props
}: MessageImageGalleryOverlayProps) {
  const { imageGalleryOverlay } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: imageGalleryOverlay({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-image-gallery-overlay",
    },
  });
}

export type MessageImageGalleryActionProps = useRender.ComponentProps<"button">;

export function MessageImageGalleryAction({
  className,
  render,
  ...props
}: MessageImageGalleryActionProps) {
  const { imageGalleryAction } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: imageGalleryAction({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-image-gallery-action",
    },
  });
}

export type MessageVideoPreviewProps = useRender.ComponentProps<"div"> & {
  optimistic?: boolean;
};

export function MessageVideoPreview({
  optimistic,
  className,
  render,
  ...props
}: MessageVideoPreviewProps) {
  const { videoPreview } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-optimistic": optimistic ? "true" : undefined,
    className: videoPreview({ className }),
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

export type MessageVideoPreviewFrameProps = useRender.ComponentProps<"div">;

export function MessageVideoPreviewFrame({
  className,
  render,
  ...props
}: MessageVideoPreviewFrameProps) {
  const { videoPreviewFrame } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: videoPreviewFrame({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-video-preview-frame",
    },
  });
}

export type MessageVideoPreviewMediaProps = useRender.ComponentProps<"video">;

export function MessageVideoPreviewMedia({
  className,
  render,
  ...props
}: MessageVideoPreviewMediaProps) {
  const { videoPreviewMedia } = messageItem();
  const defaultProps: useRender.ElementProps<"video"> = {
    className: videoPreviewMedia({ className }),
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

export type MessageVideoPreviewFallbackProps = useRender.ComponentProps<"div"> & {
  interactive?: boolean;
};

export function MessageVideoPreviewFallback({
  interactive = false,
  className,
  render,
  ...props
}: MessageVideoPreviewFallbackProps) {
  const { videoPreviewFallback } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-interactive": interactive ? "true" : "false",
    className: videoPreviewFallback({ className }),
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

export type MessageVideoPreviewActionProps = useRender.ComponentProps<"button">;

export function MessageVideoPreviewAction({
  className,
  render,
  ...props
}: MessageVideoPreviewActionProps) {
  const { videoPreviewAction } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: videoPreviewAction({ className }),
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
