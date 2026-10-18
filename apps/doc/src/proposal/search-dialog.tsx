import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Box, Layers, Palette, Scale, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  SearchEntityResult,
  SearchEntityResultContent,
  SearchEntityResultDescription,
  SearchEntityResultHeader,
  SearchEntityResultIcon,
  SearchEntityResultLeading,
  SearchEntityResultTitle,
  SearchResultsList,
} from "raft-ui";

import { pageHref, searchPages, SECTIONS } from "./site-map.ts";
import type { SearchHit, SectionId } from "./site-map.ts";

const SECTION_ICON: Record<SectionId, typeof Box> = {
  foundations: Palette,
  components: Box,
  patterns: Layers,
  products: BookOpen,
  decisions: Scale,
};

function SearchHitRow({
  hit,
  index,
  selected,
  onHighlight,
  onSelect,
}: {
  hit: SearchHit;
  index: number;
  selected: boolean;
  onHighlight: (index: number) => void;
  onSelect: (index: number) => void;
}) {
  const Icon = SECTION_ICON[hit.page.section];
  const section = SECTIONS.find((item) => item.id === hit.page.section)?.title;
  const handleMouseEnter = useCallback(() => onHighlight(index), [index, onHighlight]);
  const handleClick = useCallback(() => onSelect(index), [index, onSelect]);
  return (
    <SearchEntityResult selected={selected} onMouseEnter={handleMouseEnter} onClick={handleClick}>
      <SearchEntityResultLeading>
        <SearchEntityResultIcon>
          <Icon />
        </SearchEntityResultIcon>
      </SearchEntityResultLeading>
      <SearchEntityResultContent>
        <SearchEntityResultHeader>
          <SearchEntityResultTitle>{hit.page.title}</SearchEntityResultTitle>
        </SearchEntityResultHeader>
        <SearchEntityResultDescription>
          {hit.matchedAlias ? `Also called ${hit.matchedAlias} · ` : ""}
          {hit.page.group ?? section}
        </SearchEntityResultDescription>
      </SearchEntityResultContent>
    </SearchEntityResult>
  );
}

/**
 * Site search. It indexes titles, aliases (former DS names and the names other
 * systems use) and summaries; the implementation adds headings and token
 * names. An alias hit shows the name that matched.
 */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const navigate = useNavigate();
  const hits = useMemo(() => searchPages(query), [query]);

  const go = useCallback(
    (index: number) => {
      const hit = hits[index];
      if (!hit) return;
      onOpenChange(false);
      setQuery("");
      void navigate({ to: pageHref(hit.page) });
    },
    [hits, navigate, onOpenChange],
  );

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
    setHighlight(0);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlight((current) => Math.min(current + 1, hits.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlight((current) => Math.max(current - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        go(highlight);
      }
    },
    [go, highlight, hits.length],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogTitle className="sr-only">Search the docs</DialogTitle>
        <div className="border-b border-line-seam p-3">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              aria-label="Search the docs"
              placeholder="Try “sheet”, “snackbar” or “color”"
              value={query}
              onChange={onChange}
              onKeyDown={onKeyDown}
            />
          </InputGroup>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query && hits.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <Search />
              </EmptyStateIcon>
              <EmptyStateContent>
                <EmptyStateTitle>No pages match “{query}”</EmptyStateTitle>
                <EmptyStateDescription>
                  Search matches page titles, former names and summaries.
                </EmptyStateDescription>
              </EmptyStateContent>
            </EmptyState>
          ) : null}
          {!query ? (
            <p className="px-3 py-6 text-center text-callout text-foreground-hint">
              Pages, components and their other names. Use ↑ ↓ and Enter.
            </p>
          ) : null}
          <SearchResultsList>
            {hits.map((hit, index) => (
              <SearchHitRow
                key={pageHref(hit.page)}
                hit={hit}
                index={index}
                selected={index === highlight}
                onHighlight={setHighlight}
                onSelect={go}
              />
            ))}
          </SearchResultsList>
        </div>
      </DialogContent>
    </Dialog>
  );
}
