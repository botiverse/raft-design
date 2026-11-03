import { ScrollArea } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const releases = Array.from({ length: 24 }, (_, index) => `Release 1.${24 - index}.0`);

/**
 * Absolute gutters: a frame (the root, sized and bordered here) holds the container and, beside
 * it, the gutters laid over the frame. Nothing of ScrollArea's is inside the element that scrolls.
 */
export function ScrollAreaAbsoluteGuttersContent() {
  return (
    <ScrollArea
      aria-label="Releases"
      guttersPosition="absolute"
      className="h-48 w-full max-w-sm rounded-container border border-line-hairline bg-layer-canvas"
      containerClassName="px-4 py-1"
    >
      {releases.map((release) => (
        <p key={release} className="py-1.5 text-sm text-foreground">
          {release}
        </p>
      ))}
    </ScrollArea>
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
