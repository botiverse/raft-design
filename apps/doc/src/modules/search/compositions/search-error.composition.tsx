import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateTitle,
} from "raft-ui";
import { SearchShellRoot, SearchShellViewport } from "raft-ui/wip";

export function SearchErrorComposition() {
  return (
    <SearchShellRoot>
      <SearchShellViewport>
        <EmptyState>
          <EmptyStateContent>
            <EmptyStateTitle>Search failed</EmptyStateTitle>
            <EmptyStateDescription>We could not load results.</EmptyStateDescription>
          </EmptyStateContent>
          <EmptyStateActions>
            <Button type="button" variant="danger-outline" size="sm" disabled>
              Retrying…
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
