import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageMedia, type MessageMediaVariantProps } from "./message-media.recipe";
import { type SlotElementProps } from "../../lib/data-attributes";

export type MessageImageGalleryRowLayout = NonNullable<MessageMediaVariantProps["rowLayout"]>;
export type MessageImageGalleryItemSize = NonNullable<MessageMediaVariantProps["itemSize"]>;
export type MessageImageGalleryMediaGeometry = NonNullable<
  MessageMediaVariantProps["mediaGeometry"]
>;

export type MessageImageGalleryProps = useRender.ComponentProps<"div">;

export function MessageImageGallery({ className, render, ...props }: MessageImageGalleryProps) {
  const theme = useThemeFamily();
  const { gallery } = messageMedia({ theme });
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

export type MessageImageGalleryRowProps = useRender.ComponentProps<"div"> & {
  layout?: MessageImageGalleryRowLayout;
};

export function MessageImageGalleryRow({
  className,
  layout,
  render,
  ...props
}: MessageImageGalleryRowProps) {
  const theme = useThemeFamily();
  const { galleryRow } = messageMedia({ rowLayout: layout, theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: galleryRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-image-gallery-row",
      layout,
    },
  });
}

export type MessageImageGalleryItemProps = useRender.ComponentProps<"div"> & {
  size?: MessageImageGalleryItemSize;
};

export function MessageImageGalleryItem({
  className,
  render,
  size,
  ...props
}: MessageImageGalleryItemProps) {
  const theme = useThemeFamily();
  const { galleryItem } = messageMedia({ itemSize: size, theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: galleryItem({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-image-gallery-item",
      size,
    },
  });
}

export type MessageImageGalleryMediaProps = useRender.ComponentProps<"img"> & {
  fit?: "contain" | "cover";
  geometry?: MessageImageGalleryMediaGeometry;
};

export function MessageImageGalleryMedia({
  className,
  fit,
  geometry = "normal",
  render,
  ...props
}: MessageImageGalleryMediaProps) {
  const resolvedFit = fit ?? (geometry === "normal" ? "cover" : "contain");
  const { galleryMedia } = messageMedia({ mediaFit: fit, mediaGeometry: geometry });
  const defaultProps: SlotElementProps<"img"> = {
    "data-fit": resolvedFit,
    "data-geometry": geometry,
    className: galleryMedia({ className }),
  };

  return useRender({
    defaultTagName: "img",
    render,
    props: mergeProps<"img">(defaultProps, props),
    state: {
      slot: "message-image-gallery-media",
      geometry,
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
  const theme = useThemeFamily();
  const { galleryPreview } = messageMedia({ theme });
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
  const theme = useThemeFamily();
  const { video } = messageMedia({ theme });
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

export type MessageVideoPreviewFallbackProps = useRender.ComponentProps<"div">;

export function MessageVideoPreviewFallback({
  className,
  render,
  ...props
}: MessageVideoPreviewFallbackProps) {
  const { videoFallback } = messageMedia();
  const defaultProps: useRender.ElementProps<"div"> = {
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

export type MessageVideoPreviewFailureContentProps = useRender.ComponentProps<"div">;

export function MessageVideoPreviewFailureContent({
  className,
  render,
  ...props
}: MessageVideoPreviewFailureContentProps) {
  const theme = useThemeFamily();
  const { videoFailureContent } = messageMedia({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: videoFailureContent({ className }),
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
  const { videoFailureIcon } = messageMedia({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: videoFailureIcon({ className }),
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
  const { videoFailureTitle } = messageMedia({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: videoFailureTitle({ className }),
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
  const { videoFailureAction } = messageMedia();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: videoFailureAction({ className }),
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
  const { videoAction } = messageMedia({ theme });
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
