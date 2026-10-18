import {
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchResultsSummary,
  SearchShellRoot,
  SearchShellViewport,
  Skeleton,
} from "@botiverse/raft-ui";

export function SearchLoadingComposition() {
  return (
    <SearchShellRoot aria-busy="true">
      <SearchShellViewport>
        <SearchResultsSummary>Searching for “design system”…</SearchResultsSummary>
        <SearchResultsSection className="mb-0">
          <SearchResultsSectionHeading>Messages</SearchResultsSectionHeading>
          <SearchResultsList>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </SearchResultsList>
        </SearchResultsSection>
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
