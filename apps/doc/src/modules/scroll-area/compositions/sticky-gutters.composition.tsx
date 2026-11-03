import { ScrollAreaGutters, useScrollAreaContainer } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const members = ["Artea", "Kirby", "Mika", "Noor", "Oskar", "Priya", "Quinn", "Rae", "Sol", "Tove"];

/**
 * Sticky gutters (the default) in a container of one's own, bound with `useScrollAreaContainer`:
 * the `<ul>` is the element that scrolls and the root, and the gutters are its first child, a
 * zero-height layer that takes no room.
 */
export function ScrollAreaStickyGuttersContent() {
  const { containerProps, guttersProps } = useScrollAreaContainer<HTMLUListElement>();
  return (
    <div className="w-full max-w-sm">
      <ul
        {...containerProps}
        aria-label="Members"
        className={`${containerProps.className} h-48 w-full overflow-y-auto rounded-container border border-line-hairline bg-layer-canvas px-4 py-1`}
      >
        <ScrollAreaGutters {...guttersProps} />
        {members.map((member) => (
          <li key={member} className="py-1.5 text-sm text-foreground">
            {member}
          </li>
        ))}
      </ul>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaStickyGuttersComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaStickyGuttersContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
