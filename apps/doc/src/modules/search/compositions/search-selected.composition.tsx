import {
  SearchEntityResult,
  SearchEntityResultDescription,
  SearchEntityResultOpen,
  SearchEntityResultTitle,
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchShellResults,
  SearchShellResultsContent,
  SearchShellRoot,
} from "raft-ui/wip";

export function SearchSelectedComposition() {
  return (
    <SearchShellRoot>
      <SearchShellResults>
        <SearchShellResultsContent>
          <SearchResultsSection>
            <SearchResultsSectionHeading>Channels</SearchResultsSectionHeading>
            <SearchResultsList>
              <SearchEntityResult selected>
                <SearchEntityResultOpen disabled>
                  <SearchEntityResultTitle>Design systems</SearchEntityResultTitle>
                  <SearchEntityResultDescription>Selected result</SearchEntityResultDescription>
                </SearchEntityResultOpen>
              </SearchEntityResult>
            </SearchResultsList>
          </SearchResultsSection>
        </SearchShellResultsContent>
      </SearchShellResults>
    </SearchShellRoot>
  );
}
