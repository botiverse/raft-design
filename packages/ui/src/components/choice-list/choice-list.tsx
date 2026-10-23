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
  /** The search box's accessible name. Required once the list can search. */
  searchLabel?: string;
  searchPlaceholder?: string;
  /** The search box's text when the list first draws, such as a search carried over. */
  defaultSearchValue?: string;
  /** The clear button's accessible name. */
  clearSearchLabel?: string;
  /** The line under the chosen rows when nothing else matches. */
  noMatchLabel?: ReactNode;
  /** The line drawn when there are no items at all. */
  empty?: ReactNode;
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
) {
  if (!needle) return { rows: items, noMatch: false };
  const matches = (item: ChoiceListItem) => searchTextOf(item).toLowerCase().includes(needle);
  const isPinned = (item: ChoiceListItem) => pinned.includes(item.value);
  const top = items.filter(
    (item) => isPinned(item) || (chosen.includes(item.value) && !matches(item)),
  );
  const rest = items.filter((item) => !top.includes(item) && matches(item));
  return { rows: [...top, ...rest], noMatch: rest.length === 0 };
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
    clearSearchLabel,
    noMatchLabel,
    empty,
    className,
  } = props;
  const value = props.value;
  const chosen = useMemo<readonly string[]>(
    () => (value === null ? [] : typeof value === "string" ? [value] : value),
    [value],
  );

  const [query, setQuery] = useState(defaultSearchValue);
  const [pinned, setPinned] = useState<readonly string[]>(chosen);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();

  const searchable = items.length > 0 && (search === "always" || items.length > SEARCH_ABOVE);
  const needle = searchable ? query.trim().toLowerCase() : "";
  const { rows, noMatch } = visibleItems(items, needle, pinned, chosen);
  const hasAction = rows.some((item) => item.action !== undefined && item.action !== null);
  const slots = choiceList({ scroll: searchable });

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!ariaLabel && !ariaLabelledBy) {
      console.warn("raft-ui: a ChoiceList has neither aria-label nor aria-labelledby.");
    }
    if (searchable && (!searchLabel || !clearSearchLabel)) {
      console.warn(
        "raft-ui: this ChoiceList shows a search box; pass searchLabel and clearSearchLabel to name it and its clear button.",
      );
    }
    if (items.some((item) => descriptionLines(item.description).length > MAX_DESCRIPTION_LINES)) {
      console.warn(
        `raft-ui: a ChoiceList item has more than ${MAX_DESCRIPTION_LINES} description lines; only the first ${MAX_DESCRIPTION_LINES} are drawn.`,
      );
    }
  }, [ariaLabel, ariaLabelledBy, searchable, searchLabel, clearSearchLabel, items]);

  // Typing is the way in when people know the name, so with a mouse or
  // trackpad focus starts in the box. Never on a touch screen, where focus
  // would bring up the keyboard over the list.
  const focusSearch = search === "always" && searchable;
  useEffect(() => {
    if (!focusSearch || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(pointer: fine)").matches)
      inputRef.current?.focus({ preventScroll: true });
  }, [focusSearch]);

  const changeQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.currentTarget.value);
      setPinned(chosen);
    },
    [chosen],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    setPinned(chosen);
    inputRef.current?.focus();
  }, [chosen]);

  const groupProps = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    disabled,
    className: slots.group(),
    style: { gridRow: `1 / span ${rows.length}` },
  };

  const rowElements = rows.map((item) => {
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
                {rows.map((item, index) =>
                  item.action !== undefined && item.action !== null ? (
                    <div
                      key={item.value}
                      data-slot="choice-list-action"
                      className={slots.action()}
                      style={{ gridRow: index + 1 }}
                    >
                      {item.action}
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}
            {noMatch ? (
              <p role="status" data-slot="choice-list-note" className={slots.note()}>
                {noMatchLabel}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
