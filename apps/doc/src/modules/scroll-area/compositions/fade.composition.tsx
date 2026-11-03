import { ScrollArea } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const messages = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  author: ["Artea", "Kirby", "Mika", "Noor"][index % 4],
  text: index % 3 === 0 ? "Pushed the new tokens, have a look." : "Looks good to me.",
}));
const days = Array.from({ length: 21 }, (_, index) => `Sep ${index + 1}`);

export function ScrollAreaFadeContent() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ScrollArea
        role="region"
        aria-label="Messages"
        fade
        className="h-56 w-full rounded-container border border-line-hairline bg-layer-canvas"
        contentClassName="px-4"
      >
        {messages.map((message) => (
          <div key={message.id} className="py-2">
            <p className="text-sm font-bold text-foreground">{message.author}</p>
            <p className="text-sm text-foreground-muted">{message.text}</p>
          </div>
        ))}
      </ScrollArea>
      <ScrollArea
        role="region"
        aria-label="Days"
        fade
        orientation="horizontal"
        className="w-full rounded-container border border-line-hairline bg-layer-canvas"
      >
        <div className="flex gap-2 px-3 pt-3 pb-5">
          {days.map((day) => (
            <span
              key={day}
              className="flex h-14 w-18 flex-none items-center justify-center rounded-control bg-fill-muted text-sm text-foreground"
            >
              {day}
            </span>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaFadeComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaFadeContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
