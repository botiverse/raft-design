import { Hash } from "lucide-react";
import {
  Badge,
  SearchEntityResult,
  SearchEntityResultContent,
  SearchEntityResultSubtitle,
  SearchEntityResultHeader,
  SearchEntityResultIcon,
  SearchEntityResultLeading,
  SearchEntityResultTitle,
  SearchResultsList,
} from "@botiverse/raft-ui";

export function SearchMutedEntityComposition() {
  return (
    <SearchResultsList className="w-full max-w-xl">
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
          <SearchEntityResultSubtitle muted>
            Earlier search implementation notes
          </SearchEntityResultSubtitle>
        </SearchEntityResultContent>
      </SearchEntityResult>
    </SearchResultsList>
  );
}
