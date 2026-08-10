import { SearchX } from "lucide-react";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  SearchShellRoot,
  SearchShellViewport,
} from "raft-ui";

export function SearchNoResultsComposition() {
  return (
    <SearchShellRoot>
      <SearchShellViewport>
        <EmptyState className="h-full">
          <EmptyStateContent>
            <EmptyStateIcon>
              <SearchX aria-hidden />
            </EmptyStateIcon>
            <EmptyStateTitle>No results for “design system”</EmptyStateTitle>
            <EmptyStateDescription>
              Try another query or remove one of the active filters.
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
