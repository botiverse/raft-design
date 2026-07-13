import { SelectionPopover as LegacySelectionPopover } from "../../../../../../packages/ui/src/legacy/selection-popover.tsx";
import { MessageSearchTimeFilterComposition } from "./message-search-time-filter.composition.tsx";

export const MESSAGE_SEARCH_TIME_FILTER_COMPOSITION_PATH =
  "apps/doc/src/modules/dropdown-menu/compositions/message-search-time-filter.composition.tsx" as const;

export { MessageSearchTimeFilterComposition };

const noop = () => {};

/** Legacy SelectionPopover for source-comparison source pane. */
export function MessageSearchTimeFilterSourcePreview() {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <div className="relative w-[220px] shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]">
        <LegacySelectionPopover
          title="Time"
          options={[
            { key: "any", checked: true, label: "Any time", onClick: noop },
            { key: "today", checked: false, label: "Today", onClick: noop },
            { key: "7d", checked: false, label: "Last 7 days", onClick: noop },
          ]}
        />
      </div>
    </div>
  );
}
