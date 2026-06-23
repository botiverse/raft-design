import { SelectionPopover as LegacySelectionPopover } from "../../../../packages/ui/src/legacy/selection-popover.tsx";
import { SelectTimeRangeComposition } from "./select-time-range-composition.tsx";

export const SELECT_TIME_RANGE_COMPOSITION_PATH =
  "apps/doc/src/compositions/select-time-range-composition.tsx" as const;

export { SelectTimeRangeComposition };

const noop = () => {};

export function SelectTimeRangeSourcePreview() {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <div className="relative w-[220px] shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]">
        <LegacySelectionPopover
          title="Time"
          options={[
            { key: "any", checked: false, label: "Any time", onClick: noop },
            { key: "today", checked: false, label: "Today", onClick: noop },
            { key: "7d", checked: true, label: "Last 7 days", onClick: noop },
            { key: "30d", checked: false, label: "Last 30 days", onClick: noop },
          ]}
        />
      </div>
    </div>
  );
}
