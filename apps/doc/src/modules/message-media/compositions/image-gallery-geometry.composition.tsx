import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryRow,
} from "raft-ui/wip";

export function MessageImageGalleryGeometryComposition() {
  return (
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
  );
}
