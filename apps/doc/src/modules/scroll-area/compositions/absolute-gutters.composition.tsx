import { ScrollAreaGutters, useScrollAreaContainer } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const releases = Array.from({ length: 24 }, (_, index) => `Release 1.${24 - index}.0`);

/**
 * Absolute gutters, bound with `useScrollAreaContainer`: a frame of one's own (the root, sized and
 * bordered here, with `frameProps`) holds the container and, right after it, the gutters laid over
 * the frame. Nothing of the area's is inside the element that scrolls.
 * `<ScrollArea guttersPosition="absolute">` renders the same with a `<div>` of its own.
 */
export function ScrollAreaAbsoluteGuttersContent() {
  const { containerProps, frameProps, guttersProps } = useScrollAreaContainer<HTMLOListElement>({
    guttersPosition: "absolute",
  });
  return (
    <div
      {...frameProps}
      className={`${frameProps.className} h-48 w-full max-w-sm rounded-container border border-line-hairline bg-layer-canvas`}
    >
      <ol
        {...containerProps}
        aria-label="Releases"
        className={`${containerProps.className} min-h-0 flex-1 overflow-y-auto px-4 py-1`}
      >
        {releases.map((release) => (
          <li key={release} className="py-1.5 text-sm text-foreground">
            {release}
          </li>
        ))}
      </ol>
      <ScrollAreaGutters {...guttersProps} />
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaAbsoluteGuttersComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaAbsoluteGuttersContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
