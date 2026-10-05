import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageImageGallery } from "./message-image-gallery.recipe";
import type {
  MessageImageGalleryItemLayout,
  MessageImageGalleryRowData,
} from "./message-image-gallery-rows";

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

export type MessageImageGalleryRowProps = useRender.ComponentProps<"div"> & {
  /** A row from `buildMessageImageGalleryRows`. */
  row: MessageImageGalleryRowData;
};

/**
 * One row of a gallery: the grid and its height come from the row data, so
 * consumers place the items (`MessageImageGalleryItem` with the row's item
 * layouts) without touching layout classes.
 */
export function MessageImageGalleryRow({
  className,
  render,
  row,
  ...props
}: MessageImageGalleryRowProps) {
  const theme = useThemeFamily();
  const { row: rowSlot } = messageImageGallery({ theme });
  const single = row.items.length === 1 && row.items[0].reserved != null;
  const defaultProps: SlotElementProps<"div"> = {
    className: rowSlot({
      className,
      count: row.items.length as 1 | 2 | 3,
      single,
    }),
    "data-count": String(row.items.length),
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
  /**
   * The item's layout from `buildMessageImageGalleryRows`: sets the cell
   * sizing and how the media fills it, so consumers never restate classes.
   */
  layout?: MessageImageGalleryItemLayout;
};

export function MessageImageGalleryItem({
  className,
  render,
  layout,
  ...props
}: MessageImageGalleryItemProps) {
  const theme = useThemeFamily();
  const { item } = messageImageGallery({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    className: item({
      className,
      laidOut: layout ? true : undefined,
      single: layout?.reserved ? true : undefined,
      fit: layout?.fit,
    }),
    ...(layout?.reserved ? { style: layout.reserved } : null),
    "data-fit": layout?.fit,
    "data-single": layout?.reserved ? "true" : undefined,
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
