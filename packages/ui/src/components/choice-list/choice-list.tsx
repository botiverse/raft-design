import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Search, X } from "lucide-react";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../input-group/input-group";
import { RadioGroup, RadioGroupItem } from "../radio-group/radio-group";
import { choiceList } from "./choice-list.recipe";

// An always-open list to choose from when choosing is what the dialog or page
// is for (radio-group.md, "An open list to choose from"; choice-list.md). It
// stays a list at every length. A search box filters it, and the chosen items
// stay at the top while the search is on. Whether it shows depends on how
// people find the item: by a name they know (a person), so typing is fastest
// at any count (`search="always"`), or by comparing the rows (a migration
// target by quota and disk), so it shows only past a glance, above
// SEARCH_ABOVE items (`search="auto"`).
const SEARCH_ABOVE = 5;

export type ChoiceListItem = {
  value: string;
  /** The row's name. The radio or checkbox is named by this alone. */
  label: ReactNode;
  /** What the search matches, case-insensitively. Defaults to `label` when it is a string. */
  searchText?: string;
  /**
   * Up to two lines under the name, each cut to one line. An empty line
   * (null, false or "") is not drawn. Colour inside a line is the caller's.
   */
  description?: ReactNode | readonly ReactNode[];
  /** Drawn before the radio's or checkbox's row text: an avatar, an icon. */
  media?: ReactNode;
  /**
   * A button at the end of the row, such as one that opens details. It sits
   * outside the row's label and the group: clicking it chooses nothing, and
   * it is a Tab stop of its own after the group, in row order.
   */
  action?: ReactNode;
  disabled?: boolean;
  /** The `value` of the group in `groups` this item is listed under. */
  group?: string;
};

export type ChoiceListGroup = {
  value: string;
  /** The small heading over the group's rows, such as "Agents". */
  label: ReactNode;
};

type ChoiceListCommonProps = {
  items: readonly ChoiceListItem[];
  /**
   * When the search box shows. `"always"` when people look for an item they
   * know by name, such as a person: the box shows at any count, and with a
   * mouse or trackpad focus starts in it. `"auto"` when people choose by
   * comparing the rows: the box shows only above 5 items.
   */
  search?: "auto" | "always";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  disabled?: boolean;
  /**
   * The search box's accessible name. Required: any list can come to search,
   * since `"auto"` shows the box once the items, usually from data, pass 5.
   */
  searchLabel: string;
  searchPlaceholder?: string;
  /** The search box's text when the list first draws, such as a search carried over. */
  defaultSearchValue?: string;
  /**
   * The search box's text, for a caller that uses it: a "Create “…”" row
   * named after it, or a no-match line that quotes it. With it, the caller
   * owns the text, and `onSearchValueChange` reports each change.
   */
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  /**
   * The values of the items that match the search text, in the order to show
   * them, for a caller with its own search (a ranked people search shared
   * with mentions). With it ChoiceList doesn't match `searchText` itself; it
   * still keeps the chosen rows first and says when nothing matches.
   */
  matchedValues?: readonly string[];
  /** The clear button's accessible name. */
  clearSearchLabel: string;
  /** The line under the chosen rows when nothing else matches. */
  noMatchLabel?: ReactNode;
  /** The line drawn when there are no items at all. */
  empty?: ReactNode;
  /**
   * Headings that split the rows by kind, in this order, such as Agents then
   * People. Each item names its group; a group with no rows to show, or a
   * search that leaves it empty, draws no heading.
   */
  groups?: readonly ChoiceListGroup[];
  /**
   * A row of the caller's under the list, inside its frame, that stays in
   * view while the rows scroll: the way out when the item isn't there, such
   * as "Create an agent".
   */
  footer?: ReactNode;
  /**
   * The list takes the height it is given and its rows scroll inside it, for
   * a sheet or panel whose main content is the list. Otherwise a list with a
   * search scrolls past 18rem.
   */
  fill?: boolean;
  className?: string;
};

export type ChoiceListSingleProps = ChoiceListCommonProps & {
  multiple?: false;
  value: string | null;
  onValueChange: (value: string) => void;
};

export type ChoiceListMultipleProps = ChoiceListCommonProps & {
  multiple: true;
  value: readonly string[];
  onValueChange: (value: string[]) => void;
};

export type ChoiceListProps = ChoiceListSingleProps | ChoiceListMultipleProps;

const MAX_DESCRIPTION_LINES = 2;

function isDrawn(line: ReactNode) {
  return line !== null && line !== undefined && line !== false && line !== "";
}

function descriptionLines(description: ChoiceListItem["description"]): ReactNode[] {
  const lines: readonly ReactNode[] = Array.isArray(description) ? description : [description];
  return lines.filter(isDrawn);
}

const NOT_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "radio",
  "submit",
  "reset",
  "image",
  "file",
  "range",
  "color",
]);

function isTextEntry(element: Element | null) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable || element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLSelectElement) return true;
  return element instanceof HTMLInputElement && !NOT_TEXT_INPUTS.has(element.type);
}

function searchTextOf(item: ChoiceListItem) {
  if (item.searchText !== undefined) return item.searchText;
  return typeof item.label === "string" ? item.label : "";
}

// While a search is on, the rows chosen when its text last changed come
// first, then the other matches in their own order. The pin is taken when
// the text changes, not when the choice does, so rows never move under the
// pointer or the arrow keys: an arrow press chooses the next row and the
// list holds still. A choice made outside the list, on a row not drawn, is
// added to the pin so a chosen row is always in view.
function visibleItems(
  items: readonly ChoiceListItem[],
  needle: string,
  pinned: readonly string[],
  chosen: readonly string[],
  matchedValues: readonly string[] | undefined,
) {
  if (!needle) return { rows: items, noMatch: false };
  const matched = matchedValues ? new Set(matchedValues) : null;
  const matches = (item: ChoiceListItem) =>
    matched ? matched.has(item.value) : searchTextOf(item).toLowerCase().includes(needle);
  const pinnedSet = new Set(pinned);
  const isPinned = (item: ChoiceListItem) => pinnedSet.has(item.value);
  const top = items.filter(
    (item) => isPinned(item) || (chosen.includes(item.value) && !matches(item)),
  );
  // The caller's matches keep the caller's order (its ranking); our own keep the items'.
  const byValue = matchedValues ? new Map(items.map((item) => [item.value, item])) : null;
  const ordered = byValue ? matchedValues!.flatMap((value) => byValue.get(value) ?? []) : items;
  const rest = ordered.filter((item) => !top.includes(item) && matches(item));
  // A pinned row that matches is a match: "No match" only when none does.
  return { rows: [...top, ...rest], noMatch: !items.some(matches) };
}

// The rows by group, in the groups' order, each keeping the order the search
// gave it (the pinned rows first); rows of no known group last, with no
// heading. Each heading and row takes one grid row: the actions are laid on
// their rows' grid rows.
function layoutSections(
  rows: readonly ChoiceListItem[],
  groups: readonly ChoiceListGroup[] | undefined,
) {
  const known = new Set(groups?.map((group) => group.value));
  const sections: { group: ChoiceListGroup | null; rows: ChoiceListItem[] }[] = groups
    ? groups.map((group) => ({ group, rows: rows.filter((item) => item.group === group.value) }))
    : [];
  sections.push({
    group: null,
    rows: rows.filter((item) => !groups || item.group === undefined || !known.has(item.group)),
  });
  const drawn = sections.filter((section) => section.rows.length > 0);
  const gridRowOf = new Map<string, number>();
  let gridRows = 0;
  for (const section of drawn) {
    if (section.group) gridRows += 1;
    for (const item of section.rows) {
      gridRows += 1;
      gridRowOf.set(item.value, gridRows);
    }
  }
  return { sections: drawn, gridRowOf, gridRows };
}

export function ChoiceList(props: ChoiceListProps) {
  const {
    items,
    search = "auto",
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    disabled = false,
    searchLabel,
    searchPlaceholder,
    defaultSearchValue = "",
    searchValue,
    onSearchValueChange,
    matchedValues,
    clearSearchLabel,
    noMatchLabel,
    empty,
    groups,
    footer,
    fill = false,
    className,
  } = props;
  const value = props.value;
  const chosen = useMemo<readonly string[]>(
    () => (value === null ? [] : typeof value === "string" ? [value] : value),
    [value],
  );

  const [ownQuery, setOwnQuery] = useState(defaultSearchValue);
  const query = searchValue ?? ownQuery;
  const setQuery = useCallback(
    (next: string) => {
      if (searchValue === undefined) setOwnQuery(next);
      onSearchValueChange?.(next);
    },
    [searchValue, onSearchValueChange],
  );
  const [pinned, setPinned] = useState<readonly string[]>(chosen);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();

  const searchable = items.length > 0 && (search === "always" || items.length > SEARCH_ABOVE);
  // When the box goes away (the items dropped to 5 or fewer under "auto"),
  // its text goes too, so it can't come back with the items.
  const [wasSearchable, setWasSearchable] = useState(searchable);
  if (wasSearchable !== searchable) {
    setWasSearchable(searchable);
    if (!searchable) setOwnQuery("");
  }
  // A caller that owns the text hears it go too, so a footer named after it
  // ("Create an agent named …") doesn't keep a search no one can see.
  useEffect(() => {
    if (!searchable && searchValue) onSearchValueChange?.("");
  }, [searchable, searchValue, onSearchValueChange]);
  // The pin is taken whenever the text changes, typed or set by the caller.
  const [pinnedFor, setPinnedFor] = useState(query);
  if (pinnedFor !== query) {
    setPinnedFor(query);
    setPinned(chosen);
  }
  const needle = searchable ? query.trim().toLowerCase() : "";
  const { rows, noMatch } = visibleItems(items, needle, pinned, chosen, matchedValues);
  const hasAction = rows.some((item) => item.action !== undefined && item.action !== null);
  const slots = choiceList({ scroll: searchable && !fill, fill });

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!ariaLabel && !ariaLabelledBy) {
      console.warn("raft-ui: a ChoiceList has neither aria-label nor aria-labelledby.");
    }
    if (items.some((item) => descriptionLines(item.description).length > MAX_DESCRIPTION_LINES)) {
      console.warn(
        `raft-ui: a ChoiceList item has more than ${MAX_DESCRIPTION_LINES} description lines; only the first ${MAX_DESCRIPTION_LINES} are drawn.`,
      );
    }
  }, [ariaLabel, ariaLabelledBy, items]);

  // Typing is the way in when people know the name, so with a mouse or
  // trackpad focus starts in the box. Never on a touch screen, where focus
  // would bring up the keyboard over the list. Only once, when the box first
  // shows (items may load later), and never out of a field people are typing
  // in. Focus on a button is taken: that is the one that opened the dialog.
  const focusSearch = search === "always" && searchable;
  const focusedSearch = useRef(false);
  useEffect(() => {
    if (!focusSearch || focusedSearch.current) return;
    focusedSearch.current = true;
    const input = inputRef.current;
    if (!input || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (isTextEntry(document.activeElement)) return;
    input.focus({ preventScroll: true });
  }, [focusSearch]);

  const changeQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.currentTarget.value);
    },
    [setQuery],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, [setQuery]);

  const { sections, gridRowOf, gridRows } = layoutSections(rows, groups);

  const groupProps = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    disabled,
    className: slots.group(),
    style: { gridRow: `1 / span ${gridRows}` },
  };

  const rowElement = (item: ChoiceListItem) => {
    const id = `${baseId}-${items.indexOf(item)}`;
    const lines = descriptionLines(item.description).slice(0, MAX_DESCRIPTION_LINES);
    const rowDisabled = disabled || item.disabled === true;
    const markProps = {
      value: item.value,
      disabled: item.disabled,
      "aria-labelledby": `${id}-label`,
      "aria-describedby": lines.length > 0 ? `${id}-description` : undefined,
    };
    return (
      <label
        key={item.value}
        data-slot="choice-list-item"
        data-disabled={rowDisabled ? "" : undefined}
        className={slots.item({ hasAction })}
      >
        {props.multiple ? <Checkbox {...markProps} /> : <RadioGroupItem {...markProps} />}
        {item.media !== undefined && item.media !== null ? (
          <span data-slot="choice-list-media" className={slots.media()}>
            {item.media}
          </span>
        ) : null}
        <span data-slot="choice-list-body" className={slots.body()}>
          <span id={`${id}-label`} data-slot="choice-list-label" className={slots.label()}>
            {item.label}
          </span>
          {lines.length > 0 ? (
            <span id={`${id}-description`} className="contents">
              {lines.map((line, index) => (
                <span
                  key={index}
                  data-slot="choice-list-description"
                  className={slots.description()}
                >
                  {line}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </label>
    );
  };

  const rowElements = sections.map((section, index) => {
    if (!section.group) return section.rows.map(rowElement);
    const headingId = `${baseId}-group-${index}`;
    const start = (gridRowOf.get(section.rows[0]!.value) ?? 1) - 1;
    return (
      <div
        key={section.group.value}
        role="group"
        aria-labelledby={headingId}
        data-slot="choice-list-section"
        className={slots.section()}
        style={{ gridRow: `${start} / span ${section.rows.length + 1}` }}
      >
        <div id={headingId} data-slot="choice-list-heading" className={slots.heading()}>
          {section.group.label}
        </div>
        {section.rows.map(rowElement)}
      </div>
    );
  });

  return (
    <div data-slot="choice-list" className={slots.root({ className })}>
      {searchable ? (
        <InputGroup data-slot="choice-list-search">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            ref={inputRef}
            type="search"
            value={query}
            onChange={changeQuery}
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            disabled={disabled}
            autoComplete="off"
            className={slots.searchInput()}
          />
          {query ? (
            <InputGroupAddon align="inline-end">
              <Button
                variant="ghost"
                size="icon-md"
                aria-label={clearSearchLabel}
                onClick={clearQuery}
              >
                <X aria-hidden />
              </Button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      ) : null}
      <div data-slot="choice-list-frame" className={slots.frame()}>
        <div data-slot="choice-list-scroller" className={slots.scroller()}>
          {items.length === 0 ? (
            <p data-slot="choice-list-note" className={slots.note()}>
              {empty}
            </p>
          ) : (
            <>
              {rows.length > 0 ? (
                <div data-slot="choice-list-rows" className={slots.rows()}>
                  {props.multiple ? (
                    <BaseCheckboxGroup
                      data-slot="choice-list-group"
                      // Base UI only reads it.
                      value={props.value as string[]}
                      onValueChange={props.onValueChange}
                      {...groupProps}
                    >
                      {rowElements}
                    </BaseCheckboxGroup>
                  ) : (
                    <RadioGroup
                      data-slot="choice-list-group"
                      // Base UI reads null as "controlled, nothing chosen".
                      value={props.value as string}
                      onValueChange={props.onValueChange}
                      {...groupProps}
                    >
                      {rowElements}
                    </RadioGroup>
                  )}
                  {sections.flatMap((section) =>
                    section.rows.map((item) =>
                      item.action !== undefined && item.action !== null ? (
                        <div
                          key={item.value}
                          data-slot="choice-list-action"
                          className={slots.action()}
                          style={{ gridRow: gridRowOf.get(item.value) }}
                        >
                          {item.action}
                        </div>
                      ) : null,
                    ),
                  )}
                </div>
              ) : null}
              {searchable ? (
                // Mounted with the box and empty until nothing matches: a
                // screen reader announces a status whose text changes, not one
                // that appears with its text.
                <p
                  role="status"
                  data-slot="choice-list-status"
                  className={noMatch ? slots.note() : "sr-only"}
                >
                  {noMatch ? noMatchLabel : null}
                </p>
              ) : null}
            </>
          )}
        </div>
        {footer !== undefined && footer !== null ? (
          <div data-slot="choice-list-footer" className={slots.footer()}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
