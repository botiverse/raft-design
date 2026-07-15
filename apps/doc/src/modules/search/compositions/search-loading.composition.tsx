import { SearchSkeleton } from "../search-panel/search-panel.parts.tsx";
import { BrutalSearchStateExample } from "../search-panel/search-state-frame.tsx";

export function SearchLoadingComposition() {
  return (
    <BrutalSearchStateExample defaultQuery="preview">
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="p-4">
          <div className="mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-black/60">
              Searching…
            </span>
          </div>
          <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
            Messages
          </div>
          <SearchSkeleton />
        </div>
      </div>
    </BrutalSearchStateExample>
  );
}
