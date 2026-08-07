import { EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateTitle } from "raft-ui";
import { SearchShellRoot, SearchShellViewport } from "raft-ui/wip";

export function SearchNoResultsComposition() {
  return (
    <SearchShellRoot>
      <SearchShellViewport>
        <EmptyState>
          <EmptyStateContent>
            <EmptyStateTitle>No results</EmptyStateTitle>
            <EmptyStateDescription>Try a different query or remove a filter.</EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
