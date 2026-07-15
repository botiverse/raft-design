import { SearchEmpty } from "../search-panel/search-panel.parts.tsx";
import { BrutalSearchPopupStateExample } from "../search-panel/search-state-frame.tsx";

export function SearchPopupNoMatchesComposition() {
  return (
    <BrutalSearchPopupStateExample>
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <SearchEmpty />
      </div>
    </BrutalSearchPopupStateExample>
  );
}
