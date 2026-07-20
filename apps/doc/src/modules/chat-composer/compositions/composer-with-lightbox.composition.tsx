import { ChevronLeft, ChevronRight, Paperclip, Send, X } from "lucide-react";
import { useState } from "react";
import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxMedia,
  LightboxNavigationButton,
  LightboxStage,
  LightboxTitle,
} from "raft-ui";
import {
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
} from "raft-ui/wip";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

import { COMPOSER_IMAGE_SRC } from "../composer-image.ts";

const READY_IMAGES = [
  { name: "screenshot.png", src: COMPOSER_IMAGE_SRC },
  { name: "moodboard.png", src: COMPOSER_IMAGE_SRC },
] as const;

export function ComposerWithLightboxComposition() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const open = previewIndex !== null;
  const activeImage = previewIndex === null ? null : READY_IMAGES[previewIndex];

  return (
    <>
      <ComposerRoot>
        <ComposerAttachments>
          {READY_IMAGES.map((image, index) => (
            <ComposerAttachment key={image.name}>
              <ComposerAttachmentImage
                render={<button type="button" />}
                className="cursor-zoom-in"
                aria-label={`Preview ${image.name}`}
                onClick={() => setPreviewIndex(index)}
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
          ))}
        </ComposerAttachments>
        <Composer>
          <ComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            readOnly
          />
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
      <Lightbox
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPreviewIndex(null);
        }}
      >
        {activeImage ? (
          <LightboxContent>
            <LightboxHeader>
              <LightboxTitle>{activeImage.name}</LightboxTitle>
              <LightboxActions>
                <LightboxClose aria-label="Close">
                  <X />
                </LightboxClose>
              </LightboxActions>
            </LightboxHeader>
            <LightboxStage>
              <LightboxNavigationButton
                direction="previous"
                disabled={previewIndex === 0}
                aria-label="Previous image"
                onClick={() => setPreviewIndex((index) => (index === null ? index : index - 1))}
              >
                <ChevronLeft />
              </LightboxNavigationButton>
              <LightboxNavigationButton
                direction="next"
                disabled={previewIndex === READY_IMAGES.length - 1}
                aria-label="Next image"
                onClick={() => setPreviewIndex((index) => (index === null ? index : index + 1))}
              >
                <ChevronRight />
              </LightboxNavigationButton>
              <LightboxMedia render={<img src={activeImage.src} alt={activeImage.name} />} />
            </LightboxStage>
          </LightboxContent>
        ) : null}
      </Lightbox>
    </>
  );
}
