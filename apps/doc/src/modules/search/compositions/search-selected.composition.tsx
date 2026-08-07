import {
  SearchEntityResult,
  SearchEntityResultDescription,
  SearchEntityResultTitle,
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchShellRoot,
  SearchShellViewport,
} from "raft-ui/wip";

export function SearchSelectedComposition() {
  return (
    <SearchShellRoot>
      <SearchShellViewport>
        <SearchResultsSection>
          <SearchResultsSectionHeading>Channels</SearchResultsSectionHeading>
          <SearchResultsList>
            <SearchEntityResult selected disabled>
              <SearchEntityResultTitle>Design systems</SearchEntityResultTitle>
              <SearchEntityResultDescription>Selected result</SearchEntityResultDescription>
            </SearchEntityResult>
          </SearchResultsList>
        </SearchResultsSection>
      </SearchShellViewport>
    </SearchShellRoot>
  );
}
