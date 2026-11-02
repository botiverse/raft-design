import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryRow,
  buildMessageImageGalleryRows,
} from "@botiverse/raft-ui";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

// Three ordinary images make one row, three across, on the row's own grid.
const IMAGES = [
  { alt: "release poster first crop", width: 320, height: 240 },
  { alt: "release poster second crop", width: 320, height: 240 },
  { alt: "release poster third crop", width: 320, height: 240 },
];

export function MessageImageGalleryTripleComposition() {
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
