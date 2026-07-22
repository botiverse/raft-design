import {
  MessageImageGalleryPairComposition,
  MessageImageGalleryPendingComposition,
  MessageImageGallerySingleComposition,
  MessageVideoPendingComposition,
  MessageVideoPreviewComposition,
} from "./media.compositions.tsx";

export function MessageMediaShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <MessageImageGallerySingleComposition />
      <MessageImageGalleryPairComposition />
      <MessageImageGalleryPendingComposition />
      <MessageVideoPreviewComposition />
      <MessageVideoPendingComposition />
    </div>
  );
}
