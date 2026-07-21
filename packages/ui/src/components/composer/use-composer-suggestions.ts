import { mergeProps } from "@base-ui/react/merge-props";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CompositionEventHandler,
  type FocusEventHandler,
  type FormEventHandler,
  type KeyboardEventHandler,
  type PointerEvent,
  type RefObject,
} from "react";

export interface ComposerSuggestionTriggerMatch {
  /** The trigger marker that opened the list, e.g. "@" or "#". */
  marker: string;
  /** The query typed after the marker, excluding the marker. */
  query: string;
  /** Caret index in the value where the marker begins. */
  start: number;
}

export interface UseComposerSuggestionsParams<TItem extends object> {
  /** Controlled value of the composer input. */
  value: string;
  /** Called when typing or an inserted suggestion changes the value. */
  onValueChange: (value: string) => void;
  /** Detect an active trigger in the text before the caret; return null when inactive. */
  detectTrigger: (textBeforeCaret: string) => ComposerSuggestionTriggerMatch | null;
  /** Items offered for the active trigger. An empty list closes the popup. */
  getItems: (match: ComposerSuggestionTriggerMatch) => readonly TItem[];
  /** Text inserted in place of the trigger token when an item is chosen, e.g. "@handle ". */
  getItemText: (item: TItem) => string;
  /** Optional predicate marking an item as non-selectable. */
  isItemDisabled?: (item: TItem) => boolean;
}

export type ComposerSuggestionsInputProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "aria-activedescendant" | "aria-autocomplete" | "aria-controls" | "role" | "value"
>;

export type ComposerSuggestionsListProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "aria-label" | "aria-labelledby" | "id" | "role"
> &
  (
    | { "aria-label": string; "aria-labelledby"?: never }
    | { "aria-label"?: never; "aria-labelledby": string }
  );

export type ComposerSuggestionsOptionProps = Omit<
  ComponentPropsWithoutRef<"div">,
  | "aria-disabled"
  | "aria-selected"
  | "data-disabled"
  | "data-composer-suggestion-index"
  | "data-highlighted"
  | "id"
  | "role"
>;

interface ComposerSuggestionsInputInternalProps {
  "aria-activedescendant": string | undefined;
  "aria-autocomplete": "list";
  "aria-controls": string | undefined;
  ref: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onBlur: FocusEventHandler<HTMLTextAreaElement>;
  onChange: FormEventHandler<HTMLTextAreaElement>;
  onCompositionEnd: CompositionEventHandler<HTMLTextAreaElement>;
  onCompositionStart: () => void;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  onSelect: FormEventHandler<HTMLTextAreaElement>;
}

interface ComposerSuggestionsListInternalProps {
  id: string;
  ref: RefObject<HTMLDivElement | null>;
  role: "listbox";
}

interface ComposerSuggestionsOptionInternalProps {
  "aria-disabled": boolean;
  "aria-selected": boolean;
  "data-disabled": boolean;
  "data-composer-suggestion-index": number;
  "data-highlighted": boolean;
  id: string;
  onClick: () => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  role: "option";
}

function findNextEnabledIndex<TItem>(
  items: readonly TItem[],
  current: number,
  direction: 1 | -1,
  isItemDisabled: (item: TItem) => boolean,
) {
  if (items.length === 0) return -1;
  const start = current >= 0 ? current : direction === 1 ? -1 : 0;
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (start + direction * offset + items.length) % items.length;
    if (!isItemDisabled(items[index])) return index;
  }
  return -1;
}

function normalizeHighlightedIndex<TItem>(
  items: readonly TItem[],
  highlightedIndex: number,
  isItemDisabled: (item: TItem) => boolean,
) {
  const highlightedItem = items[highlightedIndex];
  if (highlightedItem !== undefined && !isItemDisabled(highlightedItem)) return highlightedIndex;
  return findNextEnabledIndex(items, -1, 1, isItemDisabled);
}

/**
 * Headless behavior for an inline trigger-driven suggestion popup (@mention, #channel)
 * layered over a composer textarea. Owns open state, highlighted option, keyboard
 * navigation, IME guarding, and caret-preserving insertion. The consumer supplies
 * trigger detection, item data, insertion text, and textarea/listbox option semantics.
 */
export function useComposerSuggestions<TItem extends object>({
  value,
  onValueChange,
  detectTrigger,
  getItems,
  getItemText,
  isItemDisabled = () => false,
}: UseComposerSuggestionsParams<TItem>) {
  const generatedId = useId();
  const listId = `composer-suggestions-${generatedId}`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const caretRef = useRef(value.length);
  const [interaction, setInteraction] = useState(() => {
    const initialMatch = detectTrigger(value);
    return {
      highlightedIndex: initialMatch
        ? findNextEnabledIndex(getItems(initialMatch), -1, 1, isItemDisabled)
        : -1,
      match: initialMatch,
      value,
    };
  });

  const match = interaction.value === value ? interaction.match : null;
  const items: readonly TItem[] = match ? getItems(match) : [];
  const highlightedIndex = normalizeHighlightedIndex(
    items,
    interaction.highlightedIndex,
    isItemDisabled,
  );
  const hasActiveItem = highlightedIndex >= 0 && highlightedIndex < items.length;
  const activeItem = hasActiveItem ? items[highlightedIndex] : undefined;
  const open = Boolean(match && items.length > 0);

  const syncTrigger = (nextValue: string, caret: number) => {
    const nextMatch = detectTrigger(nextValue.slice(0, caret));
    setInteraction({
      highlightedIndex: nextMatch
        ? findNextEnabledIndex(getItems(nextMatch), -1, 1, isItemDisabled)
        : -1,
      match: nextMatch,
      value: nextValue,
    });
  };

  const commit = (nextValue: string, caret: number) => {
    onValueChange(nextValue);
    setInteraction({ highlightedIndex: -1, match: null, value: nextValue });
    caretRef.current = caret;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.setSelectionRange(caret, caret);
      frameRef.current = null;
    });
  };

  const select = (item: TItem) => {
    if (!match || isItemDisabled(item)) return;
    const caret = interaction.value === value ? caretRef.current : value.length;
    const insertion = getItemText(item);
    const nextValue = `${value.slice(0, match.start)}${insertion}${value.slice(caret)}`;
    commit(nextValue, match.start + insertion.length);
  };

  const insert = (text: string) => {
    const caret = interaction.value === value ? caretRef.current : value.length;
    const nextValue = `${value.slice(0, caret)}${text}${value.slice(caret)}`;
    commit(nextValue, caret + text.length);
  };

  const clear = () => {
    onValueChange("");
    setInteraction({ highlightedIndex: -1, match: null, value: "" });
    caretRef.current = 0;
  };

  const handleChange: FormEventHandler<HTMLTextAreaElement> = (event) => {
    caretRef.current = event.currentTarget.selectionStart ?? 0;
    onValueChange(event.currentTarget.value);
    syncTrigger(event.currentTarget.value, caretRef.current);
  };

  const handleSelect: FormEventHandler<HTMLTextAreaElement> = (event) => {
    caretRef.current = event.currentTarget.selectionStart ?? 0;
    syncTrigger(event.currentTarget.value, caretRef.current);
  };

  const handleCompositionEnd: CompositionEventHandler<HTMLTextAreaElement> = (event) => {
    composingRef.current = false;
    caretRef.current = event.currentTarget.selectionStart ?? 0;
    syncTrigger(event.currentTarget.value, caretRef.current);
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && listRef.current?.contains(nextTarget)) return;
    setInteraction({ highlightedIndex: -1, match: null, value });
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setInteraction({ highlightedIndex: -1, match: null, value });
      return;
    }
    if (!open) return;
    if (event.key === "Enter" && !event.shiftKey && !hasActiveItem) {
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setInteraction({
        highlightedIndex: findNextEnabledIndex(
          items,
          highlightedIndex,
          event.key === "ArrowDown" ? 1 : -1,
          isItemDisabled,
        ),
        match,
        value,
      });
      return;
    }
    if (
      (event.key === "Tab" || (event.key === "Enter" && !event.shiftKey)) &&
      hasActiveItem &&
      activeItem !== undefined &&
      !isItemDisabled(activeItem)
    ) {
      event.preventDefault();
      select(activeItem);
    }
  };

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>(
      `[data-composer-suggestion-index="${highlightedIndex}"]`,
    );
    if (!list || !option) return;

    // Keep keyboard highlight in view inside the listbox only. Unconditional
    // scrollIntoView would also scroll the document when an off-screen docs
    // demo mounts already open (e.g. multiple `@` previews on one page).
    const listRect = list.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    if (optionRect.top < listRect.top || optionRect.bottom > listRect.bottom) {
      option.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, open]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const getInputProps = (
    props: ComposerSuggestionsInputProps = {},
  ): ComposerSuggestionsInputInternalProps & ComposerSuggestionsInputProps =>
    mergeProps<"textarea">(props, {
      "aria-activedescendant":
        open && highlightedIndex >= 0 ? `${listId}-option-${highlightedIndex}` : undefined,
      "aria-autocomplete": "list",
      "aria-controls": open ? listId : undefined,
      ref: inputRef,
      value,
      onBlur: handleBlur,
      onChange: handleChange,
      onCompositionEnd: handleCompositionEnd,
      onCompositionStart: () => {
        composingRef.current = true;
      },
      onKeyDown: handleKeyDown,
      onSelect: handleSelect,
      // Base UI `mergeProps` infers a widened prop record; assert the precise merged shape we control.
    }) as ComposerSuggestionsInputInternalProps & ComposerSuggestionsInputProps;

  const getListProps = (
    props: ComposerSuggestionsListProps,
  ): ComposerSuggestionsListInternalProps & ComposerSuggestionsListProps =>
    mergeProps<"div">(props, {
      id: listId,
      ref: listRef,
      role: "listbox",
      // Base UI `mergeProps` infers a widened prop record; assert the precise merged shape we control.
    }) as ComposerSuggestionsListInternalProps & ComposerSuggestionsListProps;

  const getOptionProps = (
    item: TItem,
    index: number,
    props: ComposerSuggestionsOptionProps = {},
  ): ComposerSuggestionsOptionInternalProps & ComposerSuggestionsOptionProps => {
    const highlighted = index === highlightedIndex;
    const internalProps: ComposerSuggestionsOptionInternalProps = {
      "aria-disabled": isItemDisabled(item),
      "aria-selected": highlighted,
      "data-disabled": isItemDisabled(item),
      "data-composer-suggestion-index": index,
      "data-highlighted": highlighted,
      id: `${listId}-option-${index}`,
      role: "option",
      onClick: () => select(item),
      onPointerDown: (event) => {
        event.preventDefault();
      },
    };

    // Base UI `mergeProps` infers a widened prop record; assert the precise merged shape we control.
    return mergeProps<"div">(props, internalProps) as ComposerSuggestionsOptionInternalProps &
      ComposerSuggestionsOptionProps;
  };

  return {
    open,
    items,
    highlightedIndex,
    activeItem,
    inputRef,
    listRef,
    getInputProps,
    getListProps,
    getOptionProps,
    select,
    insert,
    clear,
  };
}
