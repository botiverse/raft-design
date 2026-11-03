import { ScrollArea } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const releases = Array.from({ length: 24 }, (_, index) => ({
  title: `Release 1.${24 - index}.0`,
  note: index % 3 === 0 ? "New components and fixes" : "Bug fixes and small improvements",
}));

export function ScrollAreaBasicContent() {
  return (
    <ScrollArea
      role="region"
      aria-label="Releases"
      className="h-56 w-full max-w-sm rounded-container border border-line-hairline bg-layer-canvas"
      contentClassName="px-4"
    >
      {releases.map((release) => (
        <div key={release.title} className="border-b border-line-hairline py-2.5 last:border-b-0">
          <p className="text-sm font-bold text-foreground">{release.title}</p>
          <p className="text-sm text-foreground-muted">{release.note}</p>
        </div>
      ))}
    </ScrollArea>
  );
}

// @docs-source-strip-start
export function ScrollAreaBasicComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaBasicContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
