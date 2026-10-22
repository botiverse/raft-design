import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Box,
  Compass,
  Info,
  Layers,
  Palette,
  PenLine,
  Scale,
  Search,
  Users,
} from "lucide-react";
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
} from "@botiverse/raft-ui";

import { componentGroup, shortTitle } from "#/lib/content/nav.ts";
import type { SectionId } from "#/lib/content/pages.ts";
import { searchDocs, sectionTitle } from "#/lib/content/search.ts";
import type { SearchHit } from "#/lib/content/search.ts";
import { useLocale, useMessages } from "#/lib/i18n/use-locale.ts";

const SECTION_ICON: Record<SectionId, typeof Box> = {
  principles: Compass,
  "people-and-agents": Users,
  foundations: Palette,
  content: PenLine,
  components: Box,
  patterns: Layers,
  products: BookOpen,
  about: Info,
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
  const locale = useLocale();
  const messages = useMessages();
  const Icon = SECTION_ICON[hit.page.section];
  const where =
    hit.page.section === "components" && !hit.page.intro
      ? `${messages.sections.components.title} · ${componentGroup(hit.page, locale)}`
      : sectionTitle(hit.page, locale);
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
          <SearchEntityResultTitle>
            {hit.heading ? `${shortTitle(hit.page)} › ${hit.heading.title}` : shortTitle(hit.page)}
          </SearchEntityResultTitle>
        </SearchEntityResultHeader>
        <SearchEntityResultDescription>
          {hit.alias
            ? `${hit.alias === hit.page.englishTitle ? messages.englishTitle(hit.alias) : messages.alsoCalled(hit.alias)} · `
            : ""}
          {where}
        </SearchEntityResultDescription>
      </SearchEntityResultContent>
    </SearchEntityResult>
  );
}

/** Hit address: the page, or the heading inside it. */
export function hitUrl(hit: SearchHit) {
  return hit.heading ? `${hit.page.url}#${hit.heading.id}` : hit.page.url;
}

/**
 * Site search over titles, aliases (former design names and the names other
 * systems use), headings and summaries. An alias hit shows the name that
 * matched, so "sheet" explains why it opens Drawer.
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
  const locale = useLocale();
  const messages = useMessages();
  const hits = useMemo(() => searchDocs(query, undefined, locale), [query, locale]);

  const go = useCallback(
    (index: number) => {
      const hit = hits[index];
      if (!hit) return;
      onOpenChange(false);
      setQuery("");
      const [to, hash] = hitUrl(hit).split("#", 2);
      void navigate({ to, hash });
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
        <DialogTitle className="sr-only">{messages.searchTheDocs}</DialogTitle>
        <div className="border-b border-line-seam p-3">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              aria-label={messages.searchTheDocs}
              placeholder={messages.searchPlaceholder}
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
                <EmptyStateTitle>{messages.searchNoMatch(query)}</EmptyStateTitle>
                <EmptyStateDescription>{messages.searchNoMatchHelp}</EmptyStateDescription>
              </EmptyStateContent>
            </EmptyState>
          ) : null}
          {!query ? (
            <p className="px-3 py-6 text-center text-callout text-foreground-hint">
              {messages.searchEmpty}
            </p>
          ) : null}
          <SearchResultsList>
            {hits.map((hit, index) => (
              <SearchHitRow
                key={hitUrl(hit)}
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
