import { ScrollArea } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const channels = [
  "general",
  "design",
  "releases",
  "support",
  "random",
  "infra",
  "mobile",
  "web",
  "docs",
  "hiring",
  "standup",
  "incidents",
  "growth",
  "billing",
  "research",
  "events",
];

export function ScrollAreaSizeContent() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        {/* @docs-source-strip-start */}
        <p className="font-mono text-mono-meta text-foreground-muted">{'size="small"'}</p>
        {/* @docs-source-strip-end */}
        <ScrollArea
          role="region"
          aria-label="Channels, small thumb"
          size="small"
          trigger="none"
          className="h-48 rounded-container border border-line-hairline bg-layer-canvas"
          contentClassName="px-4 py-1"
        >
          {channels.map((channel) => (
            <p key={channel} className="py-1.5 text-sm text-foreground">
              # {channel}
            </p>
          ))}
        </ScrollArea>
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        {/* @docs-source-strip-start */}
        <p className="font-mono text-mono-meta text-foreground-muted">{'size="medium"'}</p>
        {/* @docs-source-strip-end */}
        <ScrollArea
          role="region"
          aria-label="Channels, medium thumb"
          size="medium"
          trigger="none"
          className="h-48 rounded-container border border-line-hairline bg-layer-canvas"
          contentClassName="px-4 py-1"
        >
          {channels.map((channel) => (
            <p key={channel} className="py-1.5 text-sm text-foreground">
              # {channel}
            </p>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaSizeComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaSizeContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
