import { Kbd } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function KbdDeleteShortcutContent() {
  return (
    <div className="flex w-64 cursor-default select-none items-center gap-2 px-3 py-2 text-left text-sm font-medium text-foreground">
      <span className="min-w-0 flex-1 truncate">Delete</span>
      <Kbd>⌫</Kbd>
    </div>
  );
}

// @docs-source-strip-start
// Source-comparison display shell only. Use KbdDeleteShortcutContent above for real usage.
export function KbdDeleteShortcutComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <KbdDeleteShortcutContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
