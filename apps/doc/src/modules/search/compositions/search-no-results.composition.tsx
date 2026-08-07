import { EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateTitle } from "raft-ui";
import { SearchShellResults, SearchShellResultsContent, SearchShellRoot } from "raft-ui/wip";

export function SearchNoResultsComposition() {
  return (
    <SearchShellRoot>
      <SearchShellResults>
        <SearchShellResultsContent>
          <EmptyState>
            <EmptyStateContent>
              <EmptyStateTitle>No results</EmptyStateTitle>
              <EmptyStateDescription>
                Try a different query or remove a filter.
              </EmptyStateDescription>
            </EmptyStateContent>
          </EmptyState>
        </SearchShellResultsContent>
      </SearchShellResults>
    </SearchShellRoot>
  );
}
