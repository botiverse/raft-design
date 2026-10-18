import { Checkbox } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function CheckboxSettingsGroupContent() {
  return (
    <div className="grid min-w-60 gap-2 text-sm">
      <label className="flex items-center gap-3">
        <Checkbox defaultChecked aria-label="Include recent messages" />
        <span>Recent messages</span>
      </label>
      <label className="flex items-center gap-3">
        <Checkbox defaultChecked aria-label="Include activity log" />
        <span>Activity log</span>
      </label>
      <label className="flex items-center gap-3">
        <Checkbox aria-label="Include trajectory log" />
        <span>Trajectory log</span>
      </label>
    </div>
  );
}

// @docs-source-strip-start
export function CheckboxSettingsGroupComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <CheckboxSettingsGroupContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
