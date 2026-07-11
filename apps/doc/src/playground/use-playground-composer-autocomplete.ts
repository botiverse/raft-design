import {
  useId,
  useRef,
  useState,
  type CompositionEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  PLAYGROUND_ACTORS,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  getPlaygroundMembers,
  type PlaygroundChannel,
} from "./mock/index.ts";

type AutocompleteTrigger = {
  kind: "mention" | "channel";
  query: string;
  start: number;
};

export type MentionSuggestion = {
  disabled: boolean;
  group: "in-channel" | "outside-channel";
  handle: string;
  kind: "mention";
  name: string;
  type: "agent" | "human";
};

export type ChannelSuggestion = {
  archived: boolean;
  kind: "channel";
  name: string;
  roomKind: "channel" | "joint" | "private";
  subtitle: string;
};

export type ComposerSuggestion = MentionSuggestion | ChannelSuggestion;

const CHANNEL_SUGGESTIONS: readonly ChannelSuggestion[] = [
  ...PLAYGROUND_ROOM_CHANNELS,
  ...PLAYGROUND_JOINT_CHANNELS,
].map((channel) => ({
  archived: channel.archived,
  kind: "channel",
  name: channel.name,
  roomKind: channel.kind,
  subtitle: channel.subtitle,
}));

function findTrigger(value: string, caret: number): AutocompleteTrigger | null {
  const prefix = value.slice(0, caret);
  const match = /(?:^|\s)([@#])([^\s@#]*)$/.exec(prefix);
  if (!match) return null;

  const marker = match[1];
  return {
    kind: marker === "@" ? "mention" : "channel",
    query: match[2],
    start: match.index + match[0].lastIndexOf(marker),
  };
}

function replaceTrigger(
  value: string,
  trigger: AutocompleteTrigger,
  caret: number,
  suggestion: ComposerSuggestion,
) {
  const marker = trigger.kind === "mention" ? "@" : "#";
  const token = suggestion.kind === "mention" ? suggestion.handle : suggestion.name;
  const insertion = `${marker}${token} `;
  return {
    caret: trigger.start + insertion.length,
    value: `${value.slice(0, trigger.start)}${insertion}${value.slice(caret)}`,
  };
}

function getMentionSuggestions(channel: PlaygroundChannel): readonly MentionSuggestion[] {
  const memberIds = new Set(channel.memberIds);
  const inChannel = getPlaygroundMembers(channel).map(
    (actor): MentionSuggestion => ({
      disabled: false,
      group: "in-channel",
      handle: actor.id,
      kind: "mention",
      name: actor.name,
      type: actor.type,
    }),
  );
  const outsideChannel = Object.values(PLAYGROUND_ACTORS)
    .filter((actor) => !memberIds.has(actor.id))
    .slice(0, 3)
    .map(
      (actor): MentionSuggestion => ({
        disabled: true,
        group: "outside-channel",
        handle: actor.id,
        kind: "mention",
        name: actor.name,
        type: actor.type,
      }),
    );
  return [...inChannel, ...outsideChannel];
}

function getSuggestions(
  channel: PlaygroundChannel,
  trigger: AutocompleteTrigger | null,
): readonly ComposerSuggestion[] {
  if (!trigger) return [];
  const query = trigger.query.toLocaleLowerCase();
  const suggestions =
    trigger.kind === "mention" ? getMentionSuggestions(channel) : CHANNEL_SUGGESTIONS;
  if (!query) return suggestions;

  return suggestions.filter((suggestion) => {
    const searchable =
      suggestion.kind === "mention"
        ? `${suggestion.name} ${suggestion.handle}`
        : `${suggestion.name} ${suggestion.subtitle}`;
    return searchable.toLocaleLowerCase().includes(query);
  });
}

export function isComposerSuggestionDisabled(suggestion: ComposerSuggestion) {
  return suggestion.kind === "mention" ? suggestion.disabled : suggestion.archived;
}

function findNextEnabledIndex(
  suggestions: readonly ComposerSuggestion[],
  current: number,
  direction: 1 | -1,
) {
  if (suggestions.length === 0) return -1;
  const start = current >= 0 ? current : direction === 1 ? -1 : 0;
  for (let offset = 1; offset <= suggestions.length; offset += 1) {
    const index = (start + direction * offset + suggestions.length) % suggestions.length;
    if (!isComposerSuggestionDisabled(suggestions[index])) return index;
  }
  return -1;
}

export function usePlaygroundComposerAutocomplete(channel: PlaygroundChannel) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const listId = useId();
  const [draft, setDraft] = useState("");
  const [trigger, setTrigger] = useState<AutocompleteTrigger | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const suggestions = getSuggestions(channel, trigger);
  const activeSuggestion = suggestions[highlightedIndex];
  const open = Boolean(trigger && suggestions.length > 0);

  const updateTrigger = (value: string, caret: number) => {
    const nextTrigger = findTrigger(value, caret);
    setTrigger(nextTrigger);
    setHighlightedIndex(
      nextTrigger
        ? Math.max(findNextEnabledIndex(getSuggestions(channel, nextTrigger), -1, 1), 0)
        : 0,
    );
  };

  const selectSuggestion = (suggestion: ComposerSuggestion) => {
    if (!trigger) return;
    const caret = inputRef.current?.selectionStart ?? draft.length;
    const replacement = replaceTrigger(draft, trigger, caret, suggestion);
    setDraft(replacement.value);
    setTrigger(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(replacement.caret, replacement.caret);
    });
  };

  const insertMention = (mention: string) => {
    const caret = inputRef.current?.selectionStart ?? draft.length;
    const insertion = `@${mention} `;
    const nextDraft = `${draft.slice(0, caret)}${insertion}${draft.slice(caret)}`;
    const nextCaret = caret + insertion.length;
    setDraft(nextDraft);
    setTrigger(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && listRef.current?.contains(nextTarget)) return;
    setTrigger(null);
  };

  const handleChange = (event: FormEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value;
    setDraft(value);
    updateTrigger(value, event.currentTarget.selectionStart);
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLTextAreaElement>) => {
    composingRef.current = false;
    updateTrigger(event.currentTarget.value, event.currentTarget.selectionStart);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (composingRef.current || event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && trigger) {
      event.preventDefault();
      setTrigger(null);
      return;
    }
    if (!trigger || suggestions.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        findNextEnabledIndex(suggestions, current, event.key === "ArrowDown" ? 1 : -1),
      );
      return;
    }
    if (
      (event.key === "Enter" || event.key === "Tab") &&
      activeSuggestion &&
      !isComposerSuggestionDisabled(activeSuggestion)
    ) {
      event.preventDefault();
      selectSuggestion(activeSuggestion);
    }
  };

  const handleSelect = (event: FormEvent<HTMLTextAreaElement>) => {
    updateTrigger(event.currentTarget.value, event.currentTarget.selectionStart);
  };

  return {
    activeOptionId: open && activeSuggestion ? `${listId}-option-${highlightedIndex}` : undefined,
    draft,
    clear: () => {
      setDraft("");
      setTrigger(null);
    },
    handleBlur,
    handleChange,
    handleCompositionEnd,
    handleCompositionStart: () => {
      composingRef.current = true;
    },
    handleKeyDown,
    handleSelect,
    highlightedIndex,
    inputRef,
    insertMention,
    listId,
    listRef,
    open,
    selectSuggestion,
    suggestions,
  };
}
