import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryRow,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import {
  MessageImageGalleryPairComposition,
  MessageImageGallerySingleComposition,
} from "./media.compositions.tsx";

export function MessageImageGalleryLayoutMatrixComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-6">
      <section className="grid gap-2" aria-labelledby="message-gallery-single-label">
        <h3 id="message-gallery-single-label" className="text-sm font-bold text-foreground">
          Single image
        </h3>
        <MessageImageGallerySingleComposition fit="contain" />
      </section>

      <section className="grid gap-2" aria-labelledby="message-gallery-pair-label">
        <h3 id="message-gallery-pair-label" className="text-sm font-bold text-foreground">
          Pair row
        </h3>
        <MessageImageGalleryPairComposition />
      </section>

      <section className="grid gap-2" aria-labelledby="message-gallery-triple-label">
        <h3 id="message-gallery-triple-label" className="text-sm font-bold text-foreground">
          Triple dense row
        </h3>
        <MessageImageGallery>
          <MessageImageGalleryRow layout="triple">
            <MessageImageGalleryItem size="dense">
              <MessageImageGalleryMedia
                src={MESSAGE_FIXTURE_IMAGE_SRC}
                alt="release poster first crop"
                geometry="normal"
              />
            </MessageImageGalleryItem>
            <MessageImageGalleryItem size="dense">
              <MessageImageGalleryMedia
                src={MESSAGE_FIXTURE_IMAGE_SRC}
                alt="release poster second crop"
                geometry="normal"
              />
            </MessageImageGalleryItem>
            <MessageImageGalleryItem size="dense">
              <MessageImageGalleryMedia
                src={MESSAGE_FIXTURE_IMAGE_SRC}
                alt="release poster third crop"
                geometry="normal"
              />
            </MessageImageGalleryItem>
          </MessageImageGalleryRow>
        </MessageImageGallery>
      </section>

      <section className="grid gap-2" aria-labelledby="message-gallery-aspect-label">
        <h3 id="message-gallery-aspect-label" className="text-sm font-bold text-foreground">
          Wide and tall geometry
        </h3>
        <MessageImageGallery>
          <MessageImageGalleryRow layout="single">
            <MessageImageGalleryItem size="regular">
              <MessageImageGalleryMedia
                src="/raft-logo.svg"
                alt="Wide Raft logo fixture"
                geometry="wide"
              />
            </MessageImageGalleryItem>
          </MessageImageGalleryRow>
          <MessageImageGalleryRow layout="pair">
            <MessageImageGalleryItem size="regular">
              <MessageImageGalleryMedia
                src="/message-fixtures/tall-diagram.svg"
                alt="Tall diagram fixture"
                geometry="tall"
              />
            </MessageImageGalleryItem>
          </MessageImageGalleryRow>
        </MessageImageGallery>
        <p className="text-xs text-foreground-muted">
          Geometry variants own fit behavior; attachment metadata still decides which variant and
          row layout to compose.
        </p>
      </section>
    </div>
  );
}
