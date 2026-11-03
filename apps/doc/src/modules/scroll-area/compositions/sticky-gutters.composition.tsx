import { ScrollArea, ScrollAreaGutters } from "@botiverse/raft-ui";
import type { ScrollAreaRenderContainerBinding } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const members = ["Artea", "Kirby", "Mika", "Noor", "Oskar", "Priya", "Quinn", "Rae", "Sol", "Tove"];

/**
 * Sticky gutters (the default) in a container of one's own: the `<ul>` is the element that scrolls
 * and the root, and the gutters are its first child, a zero-height layer that takes no room.
 */
function renderMembers(container: ScrollAreaRenderContainerBinding) {
  return (
    <ul
      ref={container.ref}
      aria-label="Members"
      tabIndex={container.tabIndex}
      style={container.style}
      className={`${container.className} h-48 w-full overflow-y-auto rounded-container border border-line-hairline bg-layer-canvas px-4 py-1`}
    >
      <ScrollAreaGutters />
      {members.map((member) => (
        <li key={member} className="py-1.5 text-sm text-foreground">
          {member}
        </li>
      ))}
    </ul>
  );
}

export function ScrollAreaStickyGuttersContent() {
  return (
    <div className="w-full max-w-sm">
      <ScrollArea renderContainer={renderMembers} />
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
