/**
 * Row-building rules shared by the message image gallery and the forwarded
 * bundle gallery.
 *
 * Ported verbatim from the Raft web app's message gallery
 * (`buildImageGalleryRows` / `classifyImageAspect`), including the two aspect
 * thresholds and the split rules, so both surfaces lay the same attachments out
 * identically:
 *
 * - a wide image (ratio >= 2.2) always takes a row of its own;
 * - the others fill rows of three, except a lone buffer of exactly four,
 *   which splits two-and-two;
 * - normal images crop (`cover`), wide and tall (<= 0.55) ones stay fully
 *   visible (`contain`);
 * - a single image keeps its own proportions, capped to
 *   SINGLE_IMAGE_MAX_WIDTH x SINGLE_IMAGE_MAX_HEIGHT, and reserves that box
 *   before the image loads.
 */

export interface MessageImageGalleryImage {
  width?: number | null;
  height?: number | null;
}

export type MessageImageGalleryAspectKind = "wide" | "tall" | "normal";

export type MessageImageGalleryFit = "cover" | "contain";

export interface MessageImageGalleryItemLayout {
  /** Index into the images array given to the builder. */
  index: number;
  /** `cover` crops to fill the cell; `contain` keeps the whole image visible. */
  fit: MessageImageGalleryFit;
  /**
   * Present only for a single-image gallery: the box to reserve (as inline
   * style) so the cell measures right before the image loads.
   */
  reserved?: { width: string; aspectRatio: string };
}

export interface MessageImageGalleryRowData {
  items: MessageImageGalleryItemLayout[];
}

export const SINGLE_IMAGE_MAX_WIDTH = 416;
export const SINGLE_IMAGE_MAX_HEIGHT = 288;

export function classifyMessageImageAspect(
  image: MessageImageGalleryImage,
): MessageImageGalleryAspectKind {
  if (!image.width || !image.height || image.width <= 0 || image.height <= 0) return "normal";
  const ratio = image.width / image.height;
  if (ratio >= 2.2) return "wide";
  if (ratio <= 0.55) return "tall";
  return "normal";
}

function reserveSingleImage(image: MessageImageGalleryImage): {
  width: string;
  aspectRatio: string;
} {
  if (!image.width || !image.height || image.width <= 0 || image.height <= 0) {
    return { width: "min(11rem, 100%)", aspectRatio: "4 / 3" };
  }

  const scale = Math.min(
    SINGLE_IMAGE_MAX_WIDTH / image.width,
    SINGLE_IMAGE_MAX_HEIGHT / image.height,
    1,
  );
  const reservedWidth = Math.max(1, Math.round(image.width * scale));
  return {
    width: `min(${reservedWidth}px, 100%)`,
    aspectRatio: `${image.width} / ${image.height}`,
  };
}

function itemLayout(
  image: MessageImageGalleryImage,
  index: number,
  single: boolean,
): MessageImageGalleryItemLayout {
  if (single) {
    // A single image keeps its proportions; it never crops.
    return { index, fit: "contain", reserved: reserveSingleImage(image) };
  }
  return { index, fit: classifyMessageImageAspect(image) === "normal" ? "cover" : "contain" };
}

export function buildMessageImageGalleryRows(
  images: ReadonlyArray<MessageImageGalleryImage>,
): MessageImageGalleryRowData[] {
  if (images.length === 1) {
    return [{ items: [itemLayout(images[0], 0, true)] }];
  }

  const rows: MessageImageGalleryRowData[] = [];
  let buffer: number[] = [];

  const pushBufferedRows = () => {
    if (buffer.length === 0) return;
    const chunkSize = buffer.length === 4 ? 2 : 3;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      rows.push({
        items: buffer
          .slice(i, i + chunkSize)
          .map((index) => itemLayout(images[index], index, false)),
      });
    }
    buffer = [];
  };

  images.forEach((image, index) => {
    if (classifyMessageImageAspect(image) === "wide") {
      pushBufferedRows();
      rows.push({ items: [itemLayout(image, index, false)] });
      return;
    }
    buffer.push(index);
  });

  pushBufferedRows();
  return rows;
}
