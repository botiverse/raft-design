import { Skeleton } from "raft-ui";
import { SearchResultsSummary, SearchShellRoot, SearchShellViewport } from "raft-ui/wip";

export function SearchLoadingComposition() {
  return (
    <SearchShellRoot aria-busy="true">
      <SearchShellViewport>
        <SearchResultsSummary>Searching…</SearchResultsSummary>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-14" />
        ))}
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
