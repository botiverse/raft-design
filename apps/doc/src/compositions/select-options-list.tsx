import { SelectionPopover as LegacySelectionPopover } from "../../../../packages/ui/src/legacy/selection-popover.tsx";
import { SelectOptionsListComposition } from "./select-options-list-composition.tsx";

export const SELECT_OPTIONS_LIST_COMPOSITION_PATH =
  "apps/doc/src/compositions/select-options-list-composition.tsx" as const;

export { SelectOptionsListComposition };

const noop = () => {};

/** Legacy SelectionPopover for source-comparison source pane. */
export function SelectOptionsListSourcePreview() {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <div className="relative w-[220px] shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]">
        <LegacySelectionPopover
          title="Options"
          showHeader={false}
          options={[
            {
              key: "relevance",
              checked: true,
              label: "Relevance",
              reserveLeadingSlot: true,
              onClick: noop,
            },
            {
              key: "recent",
              checked: false,
              label: "Most recent",
              reserveLeadingSlot: true,
              onClick: noop,
            },
          ]}
        />
      </div>
    </div>
  );
}
