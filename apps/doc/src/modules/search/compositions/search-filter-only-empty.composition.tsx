import { SearchEmpty } from "../search-panel/search-panel.parts.tsx";
import { BrutalSearchFilteredStateExample } from "../search-panel/search-state-frame.tsx";

export function SearchFilterOnlyEmptyComposition() {
  return (
    <BrutalSearchFilteredStateExample>
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="p-4">
          <div className="mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-black/60">
              0 results
            </span>
          </div>
          <SearchEmpty filtered />
        </div>
      </div>
    </BrutalSearchFilteredStateExample>
  );
}
