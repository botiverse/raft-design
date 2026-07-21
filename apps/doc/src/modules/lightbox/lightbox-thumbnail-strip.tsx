import { useThemeFamily, type Theme } from "raft-ui";
import { cn } from "tailwind-variants";

export type LightboxThumbnailItem = {
  name: string;
  src: string;
  thumb?: string;
};

export type LightboxThumbnailStripProps = {
  images: readonly LightboxThumbnailItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

/** Caller-owned filmstrip under the stage — not a Lightbox primitive. */
export function LightboxThumbnailStrip({
  images,
  activeIndex,
  onSelect,
}: LightboxThumbnailStripProps) {
  const theme = useThemeFamily();

  if (images.length <= 1) return null;

  return (
    <div className="pointer-events-none absolute right-0 bottom-4 left-0 z-10 flex items-center justify-center gap-1.5">
      {images.map((image, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={image.name}
            type="button"
            className={lightboxThumbnailButton({ active, theme })}
            aria-label={`Show ${image.name}`}
            onClick={() => onSelect(index)}
          >
            <img
              src={image.thumb ?? image.src}
              alt=""
              className="size-full object-cover"
              draggable={false}
            />
            <span className={lightboxThumbnailOverlay({ active, theme })} />
          </button>
        );
      })}
    </div>
  );
}

function lightboxThumbnailButton({ active, theme }: { active: boolean; theme: Theme }) {
  if (theme === "elegant") {
    return cn(
      "group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden rounded-sm border opacity-100 shadow-none transition-[border-color,opacity,box-shadow] duration-150",
      active ? "border-white/90" : "border-white/25 hover:border-white/60",
    );
  }

  return cn(
    "group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden border-2 transition-[border-color,opacity,box-shadow] duration-150",
    active
      ? "border-[3px] border-white shadow-[4px_4px_0_0_black]"
      : "border-white/70 opacity-70 shadow-[2px_2px_0_0_black] hover:border-white hover:opacity-100 hover:shadow-[3px_3px_0_0_black]",
  );
}

function lightboxThumbnailOverlay({ active, theme }: { active: boolean; theme: Theme }) {
  if (theme !== "elegant") {
    return "hidden";
  }

  return cn(
    "pointer-events-none absolute inset-0 block transition-colors duration-150",
    active ? "bg-transparent" : "bg-black/45 group-hover/lightbox-thumb:bg-black/28",
  );
}
