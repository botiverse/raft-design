import { Input, Skeleton } from "raft-ui";
import {
  SearchEntityResult,
  SearchEntityResultBadge,
  SearchEntityResultDescription,
  SearchEntityResultLeading,
  SearchEntityResultOpen,
  SearchEntityResultTitle,
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchResultsSummary,
  SearchShellActiveFilter,
  SearchShellActivity,
  SearchShellArchivedIcon,
  SearchShellClearFilters,
  SearchShellComputerIcon,
  SearchShellContent,
  SearchShellEntityIcon,
  SearchShellFilters,
  SearchShellHeader,
  SearchShellHeaderBack,
  SearchShellHeaderIcon,
  SearchShellInputGroup,
  SearchShellLoadMore,
  SearchShellResults,
  SearchShellResultsContent,
  SearchShellRoot,
  SearchShellSkeletonCard,
} from "raft-ui/wip";

export function SearchPreviewComposition() {
  return (
    <SearchShellRoot>
      <SearchShellHeader>
        <SearchShellHeaderBack aria-label="Back" disabled>
          ←
        </SearchShellHeaderBack>
        <SearchShellHeaderIcon aria-hidden>⌕</SearchShellHeaderIcon>
        <SearchShellInputGroup>
          <Input aria-label="Search" defaultValue="design" disabled />
        </SearchShellInputGroup>
      </SearchShellHeader>
      <SearchShellContent>
        <SearchShellFilters>
          <SearchShellActiveFilter disabled>Channels: Design</SearchShellActiveFilter>{" "}
          <SearchShellClearFilters disabled>Clear filters</SearchShellClearFilters>
        </SearchShellFilters>
        <SearchShellResults>
          <SearchShellResultsContent>
            <SearchResultsSummary>3 results for “design”</SearchResultsSummary>
            <SearchResultsSection>
              <SearchResultsSectionHeading>Channels</SearchResultsSectionHeading>
              <SearchResultsList>
                <SearchEntityResult selected>
                  <SearchEntityResultOpen disabled>
                    <SearchEntityResultLeading>
                      <SearchShellEntityIcon>#</SearchShellEntityIcon>
                      <SearchShellActivity />
                    </SearchEntityResultLeading>
                    <SearchEntityResultTitle>Design systems</SearchEntityResultTitle>
                    <SearchEntityResultBadge>Channel</SearchEntityResultBadge>
                    <SearchEntityResultDescription>
                      Shared UI decisions
                    </SearchEntityResultDescription>
                  </SearchEntityResultOpen>
                </SearchEntityResult>
                <SearchEntityResult>
                  <SearchEntityResultOpen disabled>
                    <SearchEntityResultLeading>
                      <SearchShellComputerIcon>⌘</SearchShellComputerIcon>
                    </SearchEntityResultLeading>
                    <SearchEntityResultTitle>Design automation</SearchEntityResultTitle>
                    <SearchEntityResultDescription>Agent workspace</SearchEntityResultDescription>
                  </SearchEntityResultOpen>
                </SearchEntityResult>
                <SearchEntityResult>
                  <SearchEntityResultOpen disabled>
                    <SearchEntityResultLeading>
                      <SearchShellArchivedIcon>#</SearchShellArchivedIcon>
                    </SearchEntityResultLeading>
                    <SearchEntityResultTitle muted>Old design notes</SearchEntityResultTitle>
                    <SearchEntityResultDescription muted>Archived</SearchEntityResultDescription>
                  </SearchEntityResultOpen>
                </SearchEntityResult>
              </SearchResultsList>
            </SearchResultsSection>
            <SearchShellLoadMore disabled>All results loaded</SearchShellLoadMore>
            <SearchShellSkeletonCard hidden>
              <Skeleton className="h-10" />
            </SearchShellSkeletonCard>
          </SearchShellResultsContent>
        </SearchShellResults>
      </SearchShellContent>
    </SearchShellRoot>
  );
}
