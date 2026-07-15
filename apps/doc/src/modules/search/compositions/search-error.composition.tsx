import { useState } from "react";

import { SearchError } from "../search-panel/search-panel.parts.tsx";
import { BrutalSearchStateExample } from "../search-panel/search-state-frame.tsx";
import { BrutalSearchPanelComposition } from "./brutal-search-panel.composition.tsx";

export function SearchErrorComposition() {
  const [recovered, setRecovered] = useState(false);

  if (recovered) {
    return (
      <BrutalSearchPanelComposition
        defaultQuery="no-such-result"
        onBack={() => window.history.back()}
      />
    );
  }

  return (
    <BrutalSearchStateExample defaultQuery="preview">
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="p-4">
          <div className="mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-black/60">
              0 results
            </span>
          </div>
          <SearchError onRetry={() => setRecovered(true)} />
        </div>
      </div>
    </BrutalSearchStateExample>
  );
}
