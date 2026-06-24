import { Kbd, KbdGroup } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function KbdShortcutGroupContent() {
  return (
    <div className="flex w-64 cursor-default select-none items-center gap-2 px-3 py-2 text-left text-sm font-medium text-foreground">
      <span className="min-w-0 flex-1 truncate">Copy link</span>
      <KbdGroup aria-label="Command C">
        <Kbd>⌘</Kbd>
        <Kbd>C</Kbd>
      </KbdGroup>
    </div>
  );
}

// @docs-source-strip-start
// Source-comparison display shell only. Use KbdShortcutGroupContent above for real usage.
export function KbdShortcutGroupComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <KbdShortcutGroupContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
