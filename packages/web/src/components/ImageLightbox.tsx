import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download, ImageOff } from "lucide-react";
import { useImageLightboxStore } from "../store/imageLightboxStore";
import { transparentImageBackgroundClass } from "../utils/imagePreviewStyles";
import api from "../api/client";
import Spinner from "./ui/Spinner";
import Lightbox from "./ui/Lightbox";
import Button from "./ui/Button";

const URL_CACHE_SAFETY_WINDOW_MS = 60_000;

interface AttachmentUrlResponse {
  url: string;
  expiresAt: string | null;
}

export default function ImageLightbox() {
  const { isOpen, images, currentIndex, close, next, prev, goTo, imageUrlCache, cacheImageUrl } =
    useImageLightboxStore();
  const [fullUrl, setFullUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const current = images[currentIndex];
  const hasMultiple = images.length > 1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === images.length - 1;
  const isSvgPreview = current?.mimeType.split(";")[0]?.trim().toLowerCase() === "image/svg+xml";

  // Fetch full-resolution URL when current image changes
  useEffect(() => {
    if (!current) return;
    let cancelled = false;

    if (isSvgPreview && current.rasterPreviewUrl) {
      setLoading(false);
      setError(false);
      setFullUrl(current.rasterPreviewUrl);
      return;
    }

    const cached = imageUrlCache[current.id];
    const cachedExpiresAt = cached?.expiresAt ? Date.parse(cached.expiresAt) : null;
    const cacheStillValid =
      !!cached &&
      (cachedExpiresAt == null || Number.isFinite(cachedExpiresAt) && Date.now() < cachedExpiresAt - URL_CACHE_SAFETY_WINDOW_MS);

    if (cacheStillValid) {
      setLoading(false);
      setError(false);
      setFullUrl(cached.url);
      return;
    }

    setLoading(true);
    setFullUrl(null);
    setError(false);
    api
      .get<AttachmentUrlResponse>(`/attachments/${current.id}/url`)
      .then(({ data }) => {
        if (cancelled) return;
        cacheImageUrl(current.id, { url: data.url, expiresAt: data.expiresAt ?? null });
        setFullUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cacheImageUrl, current, imageUrlCache, isSvgPreview]);

  // Keyboard navigation (Lightbox primitive handles ESC; we add ArrowLeft/Right)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !isFirst) prev();
      else if (e.key === "ArrowRight" && !isLast) next();
    },
    [prev, next, isFirst, isLast],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !current) return null;

  const handleDownload = () => {
    api.get<AttachmentUrlResponse>(`/attachments/${current.id}/url?disposition=attachment`).then(({ data }) => {
      const a = document.createElement("a");
      a.href = data.url;
      a.download = current.filename;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }).catch(() => {});
  };

  // Use thumbnail as placeholder while full URL loads
  const displaySrc = fullUrl || current.thumbnailUrl || current.localPreviewUrl;

  // Arrow button: always visible for symmetry, but disabled style when at boundary
  const arrowBtn = (disabled: boolean) =>
    disabled
      ? "flex items-center justify-center size-12 border-2 border-white/10 bg-white/5 text-white/20 cursor-default"
      : `flex items-center justify-center size-12 border-2 border-black bg-white text-black transition-colors duration-100 hover:bg-brutal-yellow`;

  return (
    <Lightbox
      onClose={close}
      className="flex flex-col"
      data-testid="image-lightbox"
    >
      {/* Title bar — in normal flow so image stage naturally starts below it */}
      <div
        className="safe-top safe-left safe-right pointer-events-auto shrink-0 border-b-2 border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="min-w-0 flex-1 truncate text-sm font-bold font-display text-black">
            {current.filename}
          </div>
          {hasMultiple && (
            <div className="shrink-0 border-2 border-black bg-brutal-yellow px-3 py-1 text-xs font-bold font-display text-black">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              onClick={handleDownload}
              shape="icon"
              title="Download"
            >
              <Download size={14} />
            </Button>
            <Button
              type="button"
              onClick={close}
              shape="icon"
              title="Close"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Image area — flex-1 fills remaining height below title bar */}
      <div
        data-testid="image-lightbox-stage"
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        {/* Left arrow */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFirst) prev();
            }}
            className={`${arrowBtn(isFirst)} absolute left-8 z-10`}
            title="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right arrow */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLast) next();
            }}
            className={`${arrowBtn(isLast)} absolute right-8 z-10`}
            title="Next image"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {loading && !displaySrc ? (
          <div className="flex size-64 items-center justify-center">
            <Spinner size="lg" variant="inverse" />
          </div>
        ) : error && !displaySrc ? (
          <div className="flex size-64 flex-col items-center justify-center gap-3 text-white/40">
            <ImageOff size={48} />
            {/* break-all so unbreakable long filenames wrap inside the 256px
                error stage instead of overflowing into the modal body.
                #proj-uiux task #133. */}
            <span className="px-4 text-center text-sm font-display break-all">{current.filename}</span>
            <span className="text-xs">Failed to load image</span>
          </div>
        ) : (
          displaySrc && (
            <img
              data-testid="image-lightbox-image"
              src={displaySrc}
              alt={current.filename}
              className={`max-h-full max-w-full object-contain ${transparentImageBackgroundClass}`}
              draggable={false}
            />
          )
        )}
      </div>

      {/* Thumbnail strip (multi-image) */}
      {hasMultiple && (
        <div
          className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-1.5 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const thumbSrc = img.thumbnailUrl || img.localPreviewUrl;
            const isActive = idx === currentIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => goTo(idx)}
                className={`pointer-events-auto size-12 border-2 transition-all duration-100 overflow-hidden ${
                  isActive
                    ? "border-brutal-yellow shadow-brutal-sm"
                    : "border-white/30 opacity-60 hover:opacity-100 hover:border-white/60"
                }`}
              >
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt={img.filename}
                    className={`h-full w-full object-cover ${transparentImageBackgroundClass}`}
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-full bg-white/20 flex items-center justify-center text-white/50 text-xs font-bold">
                    {idx + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Lightbox>
  );
}
