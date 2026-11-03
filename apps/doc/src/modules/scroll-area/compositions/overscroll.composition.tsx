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

export function ScrollAreaOverscrollContent() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        {/* @docs-source-strip-start */}
        <p className="font-mono text-mono-meta text-foreground-muted">{'overscroll="none"'}</p>
        {/* @docs-source-strip-end */}
        <ScrollArea
          aria-label="Channels"
          overscroll="none"
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
        <p className="font-mono text-mono-meta text-foreground-muted">{'overscroll="contain"'}</p>
        {/* @docs-source-strip-end */}
        <ScrollArea
          aria-label="Channels"
          overscroll="contain"
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
        <p className="font-mono text-mono-meta text-foreground-muted">{'overscroll="auto"'}</p>
        {/* @docs-source-strip-end */}
        <ScrollArea
          aria-label="Channels"
          overscroll="auto"
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
export function ScrollAreaOverscrollComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaOverscrollContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
