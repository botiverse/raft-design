import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageMedia } from "./message-media.recipe";
import { type DataAttributes } from "./message-item.types";

export type MessageImageGalleryProps = useRender.ComponentProps<"div">;

export function MessageImageGallery({ className, render, ...props }: MessageImageGalleryProps) {
  const { gallery } = messageMedia();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: gallery({ className }),
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
  const { galleryRow } = messageMedia();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: galleryRow({ className }),
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
  single?: boolean;
};

export function MessageImageGalleryItem({
  single,
  className,
  render,
  ...props
}: MessageImageGalleryItemProps) {
  const theme = useThemeFamily();
  const { galleryItem } = messageMedia({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-single": single ? "true" : undefined,
    className: galleryItem({ className }),
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
  const { galleryMedia } = messageMedia();
  const defaultProps: useRender.ElementProps<"img"> & DataAttributes = {
    "data-fit": fit,
    className: galleryMedia({ className }),
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
  const { galleryOverlay } = messageMedia();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: galleryOverlay({ className }),
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

export type MessageImageGalleryPreviewProps = useRender.ComponentProps<"button">;

export function MessageImageGalleryPreview({
  className,
  render,
  ...props
}: MessageImageGalleryPreviewProps) {
  const { galleryPreview } = messageMedia();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: galleryPreview({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-image-gallery-preview",
    },
  });
}

export function MessageImageGalleryAction({
  className,
  render,
  ...props
}: MessageImageGalleryActionProps) {
  const theme = useThemeFamily();
  const { galleryAction } = messageMedia({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: galleryAction({ className }),
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

export type MessageVideoPreviewProps = useRender.ComponentProps<"div">;

export function MessageVideoPreview({ className, render, ...props }: MessageVideoPreviewProps) {
  const { video } = messageMedia();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: video({ className }),
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
  const { videoFrame } = messageMedia();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: videoFrame({ className }),
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
  const { videoMedia } = messageMedia();
  const defaultProps: useRender.ElementProps<"video"> = {
    className: videoMedia({ className }),
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
  const { videoFallback } = messageMedia();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-interactive": interactive ? "true" : "false",
    className: videoFallback({ className }),
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
  const { videoAction } = messageMedia();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: videoAction({ className }),
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
