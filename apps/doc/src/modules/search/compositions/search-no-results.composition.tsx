import { SearchX } from "lucide-react";
import {
  helperText,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  SearchShellRoot,
  SearchShellViewport,
} from "@botiverse/raft-ui";

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
              {helperText("Try another query or remove one of the active filters.", {
                why: "recovery",
                about: "search",
              })}
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
