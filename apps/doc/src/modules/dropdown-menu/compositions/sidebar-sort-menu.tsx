import { SelectionPopover as LegacySelectionPopover } from "../../../../../../packages/ui/src/legacy/selection-popover.tsx";
import {
  SidebarSectionSortMenu,
  SidebarSortMenuComposition,
} from "./sidebar-sort-menu.composition.tsx";

export const SIDEBAR_SORT_MENU_COMPOSITION_PATH =
  "apps/doc/src/modules/dropdown-menu/compositions/sidebar-sort-menu.composition.tsx" as const;

export { SidebarSectionSortMenu, SidebarSortMenuComposition };

const noop = () => {};

/** Legacy SelectionPopover for source-comparison source pane. */
export function SidebarSortMenuSourcePreview() {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <div className="relative w-[136px] shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]">
        <LegacySelectionPopover
          title="Sort"
          showHeader={false}
          className="min-w-[136px]"
          options={[
            { key: "manual", checked: true, label: "Manual", onClick: noop },
            { key: "recent", checked: false, label: "Recent", onClick: noop },
            { key: "az", checked: false, label: "A-Z", onClick: noop },
          ]}
        />
      </div>
    </div>
  );
}
