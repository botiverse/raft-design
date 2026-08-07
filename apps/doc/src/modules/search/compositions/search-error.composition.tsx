import {
  SearchResultsError,
  SearchResultsErrorAction,
  SearchResultsErrorDescription,
  SearchResultsErrorTitle,
  SearchShellResults,
  SearchShellResultsContent,
  SearchShellRoot,
} from "raft-ui/wip";

export function SearchErrorComposition() {
  return (
    <SearchShellRoot>
      <SearchShellResults>
        <SearchShellResultsContent>
          <SearchResultsError>
            <SearchResultsErrorTitle>Search failed</SearchResultsErrorTitle>
            <SearchResultsErrorDescription>
              We could not load results.
            </SearchResultsErrorDescription>
            <SearchResultsErrorAction disabled>Retrying…</SearchResultsErrorAction>
          </SearchResultsError>
        </SearchShellResultsContent>
      </SearchShellResults>
    </SearchShellRoot>
  );
}
