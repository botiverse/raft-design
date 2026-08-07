import { Badge, Button, InputGroup, InputGroupInput, Skeleton } from "raft-ui";
import {
  SearchEntityResult,
  SearchEntityResultActivity,
  SearchEntityResultDescription,
  SearchEntityResultIcon,
  SearchEntityResultLeading,
  SearchEntityResultTitle,
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchResultsSummary,
  SearchShellContent,
  SearchShellFilters,
  SearchShellHeader,
  SearchShellHeaderIcon,
  SearchShellRoot,
  SearchShellViewport,
} from "raft-ui/wip";

export function SearchPreviewComposition() {
  return (
    <SearchShellRoot>
      <SearchShellHeader>
        <Button type="button" variant="outline" size="icon-sm" aria-label="Back" disabled>
          ←
        </Button>
        <SearchShellHeaderIcon aria-hidden>⌕</SearchShellHeaderIcon>
        <InputGroup className="min-w-0 flex-1">
          <InputGroupInput aria-label="Search" defaultValue="design" disabled />
        </InputGroup>
      </SearchShellHeader>
      <SearchShellContent>
        <SearchShellFilters>
          <Button type="button" variant="outline" size="sm" disabled>
            Channels: Design
          </Button>{" "}
          <Button type="button" variant="ghost" size="xs" disabled>
            Clear filters
          </Button>
        </SearchShellFilters>
        <SearchShellViewport>
          <SearchResultsSummary>3 results for “design”</SearchResultsSummary>
          <SearchResultsSection>
            <SearchResultsSectionHeading>Channels</SearchResultsSectionHeading>
            <SearchResultsList>
              <SearchEntityResult selected disabled>
                <SearchEntityResultLeading>
                  <SearchEntityResultIcon>#</SearchEntityResultIcon>
                  <SearchEntityResultActivity />
                </SearchEntityResultLeading>
                <SearchEntityResultTitle>Design systems</SearchEntityResultTitle>
                <Badge appearance="solid" variant="default" uppercase>
                  Channel
                </Badge>
                <SearchEntityResultDescription>Shared UI decisions</SearchEntityResultDescription>
              </SearchEntityResult>
              <SearchEntityResult disabled>
                <SearchEntityResultLeading>
                  <SearchEntityResultIcon>⌘</SearchEntityResultIcon>
                </SearchEntityResultLeading>
                <SearchEntityResultTitle>Design automation</SearchEntityResultTitle>
                <SearchEntityResultDescription>Agent workspace</SearchEntityResultDescription>
              </SearchEntityResult>
              <SearchEntityResult disabled>
                <SearchEntityResultLeading>
                  <SearchEntityResultIcon>#</SearchEntityResultIcon>
                </SearchEntityResultLeading>
                <SearchEntityResultTitle muted>Old design notes</SearchEntityResultTitle>
                <SearchEntityResultDescription muted>Archived</SearchEntityResultDescription>
              </SearchEntityResult>
            </SearchResultsList>
          </SearchResultsSection>
          <Button type="button" variant="outline" size="xs" disabled>
            All results loaded
          </Button>
          <Skeleton hidden className="h-10" />
        </SearchShellViewport>
      </SearchShellContent>
    </SearchShellRoot>
  );
}
