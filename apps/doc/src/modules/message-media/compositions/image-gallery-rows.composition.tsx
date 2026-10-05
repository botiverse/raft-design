import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryRow,
  buildMessageImageGalleryRows,
} from "raft-ui";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

// Attachments carry width/height; the builder only needs those to decide the
// rows and how each cell fills itself, so the demo states them inline.
const IMAGES = [
  // Wide: takes a row of its own and stays fully visible.
  { alt: "Wide release banner", width: 640, height: 200 },
  { alt: "Release poster first tile", width: 320, height: 240 },
  // Tall: shares the row but stays fully visible.
  { alt: "Tall diagram", width: 200, height: 400 },
  { alt: "Release poster second tile", width: 320, height: 240 },
  { alt: "Release poster third tile", width: 320, height: 240 },
];

export function MessageImageGalleryRowsComposition() {
  const rows = buildMessageImageGalleryRows(IMAGES);
  return (
    <MessageImageGallery>
      {rows.map((row, rowIndex) => (
        <MessageImageGalleryRow key={rowIndex} row={row}>
          {row.items.map((item) => (
            <MessageImageGalleryItem key={item.index} layout={item}>
              <MessageImageGalleryMedia>
                <img src={MESSAGE_FIXTURE_IMAGE_SRC} alt={IMAGES[item.index].alt} />
              </MessageImageGalleryMedia>
            </MessageImageGalleryItem>
          ))}
        </MessageImageGalleryRow>
      ))}
    </MessageImageGallery>
  );
}
