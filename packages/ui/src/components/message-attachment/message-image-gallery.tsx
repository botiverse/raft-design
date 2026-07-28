import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageImageGallery } from "./message-image-gallery.recipe";

export type MessageImageGalleryProps = useRender.ComponentProps<"div">;

export function MessageImageGallery({ className, render, ...props }: MessageImageGalleryProps) {
  const theme = useThemeFamily();
  const { root } = messageImageGallery({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
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

export type MessageImageGalleryItemProps = useRender.ComponentProps<"div">;

export function MessageImageGalleryItem({
  className,
  render,
  ...props
}: MessageImageGalleryItemProps) {
  const theme = useThemeFamily();
  const { item } = messageImageGallery({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: item({ className }),
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

export type MessageImageGalleryMediaProps = useRender.ComponentProps<"div">;

export function MessageImageGalleryMedia({
  className,
  render,
  ...props
}: MessageImageGalleryMediaProps) {
  const { media } = messageImageGallery();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: media({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
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
  const { overlay } = messageImageGallery();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: overlay({ className }),
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
  const { preview } = messageImageGallery({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: preview({ className }),
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
  const { action } = messageImageGallery({ theme });
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: action({ className }),
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
