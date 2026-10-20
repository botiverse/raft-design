import { ChevronLeft, ChevronRight, Download, Paperclip, Send, X } from "lucide-react";
import { useCallback, useState } from "react";
import {
  Button,
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoDock,
  LightboxInfoTitle,
  LightboxMedia,
  LightboxNavigationButton,
  LightboxStage,
  LightboxThumbnail,
  LightboxThumbnailStrip,
  LightboxTitle,
  ComposerActions,
  ComposerAttachment,
  ComposerAttachmentImage,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  FilePreview,
  FilePreviewMedia,
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";

const READY_IMAGES = [
  { name: "screenshot.png", src: COMPOSER_IMAGE_SRC },
  { name: "moodboard.png", src: COMPOSER_IMAGE_SRC },
] as const;

type ReadyImage = (typeof READY_IMAGES)[number];

export function ComposerWithLightboxComposition() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const open = previewIndex !== null;
  // Keep a stable slide while closing — same pattern as the Lightbox docs preview.
  const currentImage = READY_IMAGES[previewIndex ?? 0];
  const isFirstImage = previewIndex === 0;
  const isLastImage = previewIndex === READY_IMAGES.length - 1;

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) setPreviewIndex(null);
  }, []);

  const showPreviousImage = useCallback(() => {
    setPreviewIndex((index) => (index === null ? index : Math.max(0, index - 1)));
  }, []);

  const showNextImage = useCallback(() => {
    setPreviewIndex((index) =>
      index === null ? index : Math.min(READY_IMAGES.length - 1, index + 1),
    );
  }, []);

  return (
    <>
      <ComposerRoot>
        <ComposerAttachments>
          {READY_IMAGES.map((image, index) => (
            <ImageAttachment
              key={image.name}
              image={image}
              index={index}
              onPreview={setPreviewIndex}
            />
          ))}
        </ComposerAttachments>
        <Composer>
          <ComposerInput aria-label="Message #design" placeholder="Message #design" readOnly />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerIconButton aria-label="Attach file" disabled>
                <Paperclip />
              </ComposerIconButton>
            </ComposerActions>
            <ComposerMeta>
              <ComposerSubmit aria-label="Send" disabled>
                <Send />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
      <Lightbox open={open} onOpenChange={handleOpenChange}>
        <LightboxContent>
          <LightboxTitle className="sr-only">{currentImage.name}</LightboxTitle>
          <LightboxClose aria-label="Close">
            <X />
          </LightboxClose>
          <LightboxStage>
            <LightboxNavigationButton
              direction="previous"
              disabled={isFirstImage}
              aria-label="Previous image"
              onClick={showPreviousImage}
            >
              <ChevronLeft />
            </LightboxNavigationButton>
            <LightboxNavigationButton
              direction="next"
              disabled={isLastImage}
              aria-label="Next image"
              onClick={showNextImage}
            >
              <ChevronRight />
            </LightboxNavigationButton>
            <LightboxMedia render={<img src={currentImage.src} alt={currentImage.name} />} />
            <LightboxInfoDock>
              <LightboxInfoBar>
                <LightboxInfoTitle>{currentImage.name}</LightboxInfoTitle>
                <LightboxInfoActions>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
                    <Download />
                  </Button>
                </LightboxInfoActions>
              </LightboxInfoBar>
            </LightboxInfoDock>
            {previewIndex !== null ? (
              <LightboxThumbnailStrip>
                {READY_IMAGES.map((image, index) => (
                  <ImageThumbnail
                    key={image.name}
                    image={image}
                    index={index}
                    active={index === previewIndex}
                    onSelect={setPreviewIndex}
                  />
                ))}
              </LightboxThumbnailStrip>
            ) : null}
          </LightboxStage>
        </LightboxContent>
      </Lightbox>
    </>
  );
}

function ImageAttachment({
  image,
  index,
  onPreview,
}: {
  image: ReadyImage;
  index: number;
  onPreview: (index: number) => void;
}) {
  const handleClick = useCallback(() => onPreview(index), [index, onPreview]);

  return (
    <ComposerAttachment>
      <ComposerAttachmentImage
        render={<button type="button" />}
        className="cursor-zoom-in"
        aria-label={`Preview ${image.name}`}
        onClick={handleClick}
      >
        <FilePreview>
          <FilePreviewMedia>
            <img alt="" className="size-full object-cover" src={image.src} />
          </FilePreviewMedia>
        </FilePreview>
      </ComposerAttachmentImage>
      <ComposerAttachmentRemove aria-label={`Remove ${image.name}`} disabled>
        <X />
      </ComposerAttachmentRemove>
    </ComposerAttachment>
  );
}

function ImageThumbnail({
  image,
  index,
  active,
  onSelect,
}: {
  image: ReadyImage;
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  const handleClick = useCallback(() => onSelect(index), [index, onSelect]);

  return (
    <LightboxThumbnail active={active} aria-label={`Show ${image.name}`} onClick={handleClick}>
      <img src={image.src} alt="" draggable={false} />
    </LightboxThumbnail>
  );
}
