import { Hash, MessageSquare, User } from "lucide-react";
import {
  Badge,
  SearchEntityResult,
  SearchEntityResultActivity,
  SearchEntityResultContent,
  SearchEntityResultDescription,
  SearchEntityResultHeader,
  SearchEntityResultIcon,
  SearchEntityResultLeading,
  SearchEntityResultTitle,
  SearchMessageResult,
  SearchMessageResultBody,
  SearchMessageResultHeader,
  SearchMessageResultMatch,
  SearchMessageResultMeta,
  SearchMessageResultSender,
  SearchMessageResultThreadMeta,
  SearchMessageResultTimestamp,
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchThreadMessageResult,
  SearchThreadResult,
  SearchThreadResultHeader,
  SearchThreadResultMessages,
  SearchThreadResultMeta,
  SearchThreadResultTimestamp,
  SearchThreadResultTitle,
} from "raft-ui";

/** Static gallery of Search result structures and visual states. */
export function SearchPreviewComposition() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <SearchResultsSection>
        <SearchResultsSectionHeading>Entity items</SearchResultsSectionHeading>
        <SearchResultsList>
          <SearchEntityResult disabled selected>
            <SearchEntityResultLeading>
              <SearchEntityResultIcon>
                <User aria-hidden size={14} />
              </SearchEntityResultIcon>
              <SearchEntityResultActivity role="img" aria-label="Active" />
            </SearchEntityResultLeading>
            <SearchEntityResultContent>
              <SearchEntityResultHeader>
                <SearchEntityResultTitle>Maya Chen</SearchEntityResultTitle>
                <Badge appearance="solid" variant="default">
                  Human
                </Badge>
              </SearchEntityResultHeader>
              <SearchEntityResultDescription>Product design</SearchEntityResultDescription>
            </SearchEntityResultContent>
          </SearchEntityResult>

          <SearchEntityResult disabled>
            <SearchEntityResultLeading>
              <SearchEntityResultIcon>
                <Hash aria-hidden size={14} />
              </SearchEntityResultIcon>
            </SearchEntityResultLeading>
            <SearchEntityResultContent>
              <SearchEntityResultHeader>
                <SearchEntityResultTitle muted>proj-search-v1</SearchEntityResultTitle>
                <Badge appearance="soft" variant="muted">
                  Archived
                </Badge>
              </SearchEntityResultHeader>
              <SearchEntityResultDescription muted>
                Earlier search implementation notes
              </SearchEntityResultDescription>
            </SearchEntityResultContent>
          </SearchEntityResult>
        </SearchResultsList>
      </SearchResultsSection>

      <SearchResultsSection>
        <SearchResultsSectionHeading>Message item</SearchResultsSectionHeading>
        <SearchResultsList>
          <SearchMessageResult disabled selected>
            <SearchMessageResultHeader>
              <SearchMessageResultMeta>#proj-uiux</SearchMessageResultMeta>
              <SearchMessageResultThreadMeta>
                <MessageSquare aria-hidden size={12} /> thread
              </SearchMessageResultThreadMeta>
              <SearchMessageResultSender>Atlas</SearchMessageResultSender>
              <SearchMessageResultTimestamp>73 days ago</SearchMessageResultTimestamp>
            </SearchMessageResultHeader>
            <SearchMessageResultBody>
              I mapped the <SearchMessageResultMatch>Search</SearchMessageResultMatch> composition
              filters to shared primitives so the{" "}
              <SearchMessageResultMatch>preview</SearchMessageResultMatch> keeps native keyboard
              behavior.
            </SearchMessageResultBody>
          </SearchMessageResult>
        </SearchResultsList>
      </SearchResultsSection>

      <SearchResultsSection>
        <SearchResultsSectionHeading>Thread item</SearchResultsSectionHeading>
        <SearchResultsList>
          <SearchThreadResult selected>
            <SearchThreadResultHeader>
              <SearchThreadResultMeta>
                <Badge appearance="soft" variant="muted">
                  <MessageSquare aria-hidden size={12} /> Thread
                </Badge>
                <span>#proj-uiux</span>
                <span>3 hits</span>
                <SearchThreadResultTimestamp>73 days ago</SearchThreadResultTimestamp>
              </SearchThreadResultMeta>
              <SearchThreadResultTitle>Search source-parity review</SearchThreadResultTitle>
            </SearchThreadResultHeader>
            <SearchThreadResultMessages>
              <SearchThreadMessageResult disabled>
                <SearchMessageResultHeader>
                  <SearchMessageResultMeta>#proj-uiux</SearchMessageResultMeta>
                  <SearchMessageResultSender>Maya Chen</SearchMessageResultSender>
                  <SearchMessageResultTimestamp>73 days ago</SearchMessageResultTimestamp>
                </SearchMessageResultHeader>
                <SearchMessageResultBody>
                  The grouped thread <SearchMessageResultMatch>preview</SearchMessageResultMatch>{" "}
                  now announces its result count.
                </SearchMessageResultBody>
              </SearchThreadMessageResult>
            </SearchThreadResultMessages>
          </SearchThreadResult>
        </SearchResultsList>
      </SearchResultsSection>
    </div>
  );
}
