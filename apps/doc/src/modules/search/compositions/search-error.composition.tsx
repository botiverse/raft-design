import { TriangleAlert } from "lucide-react";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  SearchShellRoot,
  SearchShellViewport,
} from "@botiverse/raft-ui";
import { useCallback, useState } from "react";

export function SearchErrorComposition() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(() => setRetrying(true), []);

  return (
    <SearchShellRoot>
      <SearchShellViewport>
        <EmptyState className="h-full" aria-live="polite">
          <EmptyStateContent>
            <EmptyStateIcon>
              <TriangleAlert aria-hidden />
            </EmptyStateIcon>
            <EmptyStateTitle>{retrying ? "Retrying search" : "Search failed"}</EmptyStateTitle>
            <EmptyStateDescription>
              {retrying
                ? "Trying to reconnect and load your results."
                : "Check your connection, then try again."}
            </EmptyStateDescription>
          </EmptyStateContent>
          <EmptyStateActions>
            <Button
              type="button"
              variant="danger-outline"
              size="md"
              disabled={retrying}
              onClick={handleRetry}
            >
              {retrying ? "Retrying…" : "Retry"}
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
