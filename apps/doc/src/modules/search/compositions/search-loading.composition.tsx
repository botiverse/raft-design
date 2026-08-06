import { Skeleton } from "raft-ui";
import {
  SearchResultsSummary,
  SearchShellResults,
  SearchShellResultsContent,
  SearchShellRoot,
  SearchShellSkeletonCard,
} from "raft-ui/wip";

export function SearchLoadingComposition() {
  return (
    <SearchShellRoot aria-busy="true">
      <SearchShellResults>
        <SearchShellResultsContent>
          <SearchResultsSummary>Searching…</SearchResultsSummary>
          {[1, 2, 3].map((item) => (
            <SearchShellSkeletonCard key={item}>
              <Skeleton className="h-14" />
            </SearchShellSkeletonCard>
          ))}
        </SearchShellResultsContent>
      </SearchShellResults>
    </SearchShellRoot>
  );
}
