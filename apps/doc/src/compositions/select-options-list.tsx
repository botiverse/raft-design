import { SelectionPopover as LegacySelectionPopover } from "../../../../packages/ui/src/legacy/selection-popover.tsx";
import { SelectOptionsListComposition } from "./select-options-list-composition.tsx";

export const SELECT_OPTIONS_LIST_COMPOSITION_PATH =
  "apps/doc/src/compositions/select-options-list-composition.tsx" as const;

export { SelectOptionsListComposition };

const noop = () => {};

/** Legacy SelectionPopover for source-comparison source pane. */
export function SelectOptionsListSourcePreview() {
  return (
    <div className="flex h-full min-h-56 w-full items-start justify-center pt-8">
      <div className="relative w-[220px] shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 border-2 border-black bg-white p-2 text-sm shadow-brutal-sm focus:outline-none"
        >
          <span className="truncate text-left">Relevance</span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-3.5 shrink-0 rotate-180"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <LegacySelectionPopover
          title="Options"
          showHeader={false}
          className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden border-2 border-black bg-white shadow-brutal"
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
