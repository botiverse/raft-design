import { Checkbox } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
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
    <SourceComparisonPreview className={className}>
      <CheckboxSettingsGroupContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
