import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
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
  LightboxTrigger,
} from "raft-ui";

const IMAGES = [
  {
    filename: "product-shot.png",
    src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "ui.png",
    src: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "release-card-final-approved-for-directory-cover.png",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "design-system-token-migration-before-after-comparison-v3.png",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "status-board.png",
    src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=160&q=80",
  },
] as const;

type LightboxPreviewThumbnailProps = {
  image: (typeof IMAGES)[number];
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
};

function LightboxPreviewThumbnail({
  image,
  index,
  active,
  onSelect,
}: LightboxPreviewThumbnailProps) {
  const handleClick = useCallback(() => onSelect(index), [index, onSelect]);

  return (
    <LightboxThumbnail active={active} aria-label={`Show ${image.filename}`} onClick={handleClick}>
      <img src={image.thumb} alt="" draggable={false} />
    </LightboxThumbnail>
  );
}

export function LightboxPreview() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = IMAGES[imageIndex];
  const isFirstImage = imageIndex === 0;
  const isLastImage = imageIndex === IMAGES.length - 1;

  const updateLightboxOpen = useCallback((nextOpen: boolean) => {
    setLightboxOpen(nextOpen);
    if (!nextOpen) {
      setImageIndex(0);
    }
  }, []);

  const showPreviousImage = useCallback(() => {
    setImageIndex((current) => Math.max(0, current - 1));
  }, []);

  const showNextImage = useCallback(() => {
    setImageIndex((current) => Math.min(IMAGES.length - 1, current + 1));
  }, []);

  const switchImageWithArrowKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" && !isFirstImage) {
      showPreviousImage();
    } else if (event.key === "ArrowRight" && !isLastImage) {
      showNextImage();
    }
  });

  useEffect(() => {
    if (!lightboxOpen) return;

    document.addEventListener("keydown", switchImageWithArrowKey);
    return () => document.removeEventListener("keydown", switchImageWithArrowKey);
  }, [lightboxOpen]);

  return (
    <Lightbox open={lightboxOpen} onOpenChange={updateLightboxOpen}>
      <LightboxTrigger render={<Button variant="default" />}>Open lightbox</LightboxTrigger>
      <LightboxContent data-testid="lightbox-demo">
        <LightboxTitle className="sr-only">{currentImage.filename}</LightboxTitle>
        <LightboxClose aria-label="Close">
          <X />
        </LightboxClose>
        <LightboxStage data-testid="image-lightbox-stage">
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
          <LightboxMedia className="flex aspect-4/3 w-[min(76vw,720px)] items-center justify-center">
            <img
              src={currentImage.src}
              alt={currentImage.filename}
              className="size-full object-cover"
              draggable={false}
            />
          </LightboxMedia>
          <LightboxInfoDock>
            <LightboxInfoBar>
              <LightboxInfoTitle>{currentImage.filename}</LightboxInfoTitle>
              <LightboxInfoActions>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
                  <Download />
                </Button>
              </LightboxInfoActions>
            </LightboxInfoBar>
          </LightboxInfoDock>
          <LightboxThumbnailStrip>
            {IMAGES.map((image, index) => (
              <LightboxPreviewThumbnail
                key={image.filename}
                image={image}
                index={index}
                active={index === imageIndex}
                onSelect={setImageIndex}
              />
            ))}
          </LightboxThumbnailStrip>
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
