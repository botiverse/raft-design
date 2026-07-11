import { useState, type PointerEvent, type RefObject } from "react";
import { GitBranch, Hash, ImagePlus, Lock, Paperclip, Send, UserX } from "lucide-react";
import { Avatar, AvatarFallback, Checkbox } from "raft-ui";
import {
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerDropOverlay,
  ChatMainPanelComposerDropOverlayLabel,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ChatMainPanelFooter,
  ChatThreadPanelFooter,
  ComposerSuggestionAside,
  ComposerSuggestionBadge,
  ComposerSuggestionContent,
  ComposerSuggestionGroup,
  ComposerSuggestionGroupLabel,
  ComposerSuggestionIcon,
  ComposerSuggestionList,
  ComposerSuggestionMeta,
  ComposerSuggestionOption,
  ComposerSuggestionTitle,
  ComposerRoot,
  ComposerToolbarOption,
  ComposerToolbarOptionLabel,
} from "raft-ui/wip";

import { ComposerAttachmentsComposition } from "#/compositions/composer-composition.tsx";
import type { PlaygroundChannel } from "./mock/index.ts";
import {
  isComposerSuggestionDisabled,
  usePlaygroundComposerAutocomplete,
  type ComposerSuggestion,
  type MentionSuggestion,
} from "./use-playground-composer-autocomplete.ts";

function AutocompleteOption({
  suggestion,
  highlighted,
  id,
  onSelect,
}: {
  suggestion: ComposerSuggestion;
  highlighted: boolean;
  id: string;
  onSelect: (suggestion: ComposerSuggestion) => void;
}) {
  const disabled = isComposerSuggestionDisabled(suggestion);
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  if (suggestion.kind === "mention") {
    return (
      <ComposerSuggestionOption
        id={id}
        role="option"
        aria-selected={highlighted}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onClick={() => onSelect(suggestion)}
      >
        <ComposerSuggestionIcon render={<Avatar size="sm" type={suggestion.type} />}>
          <AvatarFallback />
        </ComposerSuggestionIcon>
        {suggestion.disabled ? (
          <ComposerSuggestionIcon variant="auxiliary" render={<UserX />} />
        ) : null}
        <ComposerSuggestionContent>
          <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
          {suggestion.type === "agent" ? (
            <ComposerSuggestionBadge aria-hidden variant="indicator" />
          ) : null}
          <ComposerSuggestionAside>
            <ComposerSuggestionMeta variant="code">@{suggestion.handle}</ComposerSuggestionMeta>
          </ComposerSuggestionAside>
        </ComposerSuggestionContent>
      </ComposerSuggestionOption>
    );
  }

  const ChannelIcon =
    suggestion.roomKind === "joint" ? GitBranch : suggestion.roomKind === "private" ? Lock : Hash;
  return (
    <ComposerSuggestionOption
      id={id}
      role="option"
      aria-selected={highlighted}
      disabled={disabled}
      tone="accent"
      onPointerDown={handlePointerDown}
      onClick={() => onSelect(suggestion)}
    >
      <ComposerSuggestionIcon variant="framed">
        <ChannelIcon />
      </ComposerSuggestionIcon>
      <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
      {suggestion.subtitle ? (
        <ComposerSuggestionMeta>{suggestion.subtitle}</ComposerSuggestionMeta>
      ) : null}
      {suggestion.archived ? (
        <ComposerSuggestionAside>
          <ComposerSuggestionBadge>archived</ComposerSuggestionBadge>
        </ComposerSuggestionAside>
      ) : null}
    </ComposerSuggestionOption>
  );
}

function AutocompleteList({
  suggestions,
  highlightedIndex,
  listId,
  listRef,
  onSelect,
}: {
  suggestions: readonly ComposerSuggestion[];
  highlightedIndex: number;
  listId: string;
  listRef: RefObject<HTMLDivElement | null>;
  onSelect: (suggestion: ComposerSuggestion) => void;
}) {
  const inChannel = suggestions.filter(
    (suggestion): suggestion is MentionSuggestion =>
      suggestion.kind === "mention" && suggestion.group === "in-channel",
  );
  const outsideChannel = suggestions.filter(
    (suggestion): suggestion is MentionSuggestion =>
      suggestion.kind === "mention" && suggestion.group === "outside-channel",
  );
  const renderOption = (suggestion: ComposerSuggestion) => {
    const index = suggestions.indexOf(suggestion);
    return (
      <AutocompleteOption
        key={suggestion.kind === "mention" ? suggestion.handle : suggestion.name}
        id={`${listId}-option-${index}`}
        suggestion={suggestion}
        highlighted={index === highlightedIndex}
        onSelect={onSelect}
      />
    );
  };

  return (
    <ComposerSuggestionList ref={listRef} id={listId} role="listbox">
      {inChannel.length > 0 ? (
        <ComposerSuggestionGroup role="group" aria-label="In this channel">
          <ComposerSuggestionGroupLabel aria-hidden>In this channel</ComposerSuggestionGroupLabel>
          {inChannel.map(renderOption)}
        </ComposerSuggestionGroup>
      ) : null}
      {outsideChannel.length > 0 ? (
        <ComposerSuggestionGroup separated role="group" aria-label="Not in this channel">
          <ComposerSuggestionGroupLabel aria-hidden>
            Not in this channel
          </ComposerSuggestionGroupLabel>
          {outsideChannel.map(renderOption)}
        </ComposerSuggestionGroup>
      ) : null}
      {inChannel.length === 0 && outsideChannel.length === 0 ? suggestions.map(renderOption) : null}
    </ComposerSuggestionList>
  );
}

function PlaygroundComposerContent({
  channel,
  label,
  uploads,
}: {
  channel: PlaygroundChannel;
  label: string;
  uploads: boolean;
}) {
  const autocomplete = usePlaygroundComposerAutocomplete(channel);
  const [attachmentsVisible, setAttachmentsVisible] = useState(uploads);
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <>
      <ComposerRoot positioned>
        {autocomplete.open ? (
          <AutocompleteList
            suggestions={autocomplete.suggestions}
            highlightedIndex={autocomplete.highlightedIndex}
            listId={autocomplete.listId}
            listRef={autocomplete.listRef}
            onSelect={autocomplete.selectSuggestion}
          />
        ) : null}
        {attachmentsVisible ? (
          <ComposerAttachmentsComposition
            onRemove={(name) => {
              setAttachmentsVisible(false);
              setStatusMessage(`${name} removed`);
            }}
            onRetry={(name) => setStatusMessage(`Retrying ${name}`)}
          />
        ) : null}
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput
            ref={autocomplete.inputRef}
            role="combobox"
            value={autocomplete.draft}
            aria-activedescendant={autocomplete.activeOptionId}
            aria-controls={autocomplete.open ? autocomplete.listId : undefined}
            aria-expanded={autocomplete.open}
            aria-label={label}
            aria-autocomplete="list"
            placeholder={label}
            onBlur={autocomplete.handleBlur}
            onChange={autocomplete.handleChange}
            onKeyDown={autocomplete.handleKeyDown}
            onCompositionStart={autocomplete.handleCompositionStart}
            onCompositionEnd={autocomplete.handleCompositionEnd}
            onSelect={autocomplete.handleSelect}
          />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerActions>
              <ChatMainPanelComposerIconButton
                aria-label="Attach image"
                onClick={() => {
                  setAttachmentsVisible(true);
                  setStatusMessage("Mock image attached");
                }}
              >
                <ImagePlus />
              </ChatMainPanelComposerIconButton>
              <ChatMainPanelComposerIconButton
                aria-label="Attach file"
                onClick={() => {
                  setAttachmentsVisible(true);
                  setStatusMessage("Mock file attached");
                }}
              >
                <Paperclip />
              </ChatMainPanelComposerIconButton>
            </ChatMainPanelComposerActions>
            <ChatMainPanelComposerMeta>
              <ComposerToolbarOption>
                <Checkbox size="sm" aria-label="Send as task" />
                <ComposerToolbarOptionLabel>As Task</ComposerToolbarOptionLabel>
              </ComposerToolbarOption>
              <ChatMainPanelComposerSubmit
                aria-label="Send"
                disabled={!autocomplete.draft.trim()}
                onClick={() => {
                  setStatusMessage(`Sent: ${autocomplete.draft.trim()}`);
                  autocomplete.clear();
                }}
              >
                <span>Send</span>
                <Send />
              </ChatMainPanelComposerSubmit>
            </ChatMainPanelComposerMeta>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
        <span className="sr-only" aria-live="polite">
          {statusMessage}
        </span>
      </ComposerRoot>
      {uploads ? (
        <ChatMainPanelComposerDropOverlay aria-hidden>
          <ChatMainPanelComposerDropOverlayLabel>
            Drop files to attach
          </ChatMainPanelComposerDropOverlayLabel>
        </ChatMainPanelComposerDropOverlay>
      ) : null}
    </>
  );
}

type PlaygroundComposerProps = {
  channel: PlaygroundChannel;
  label: string;
  uploads?: boolean;
};

export function PlaygroundMainComposer({
  channel,
  label,
  uploads = false,
}: PlaygroundComposerProps) {
  return (
    <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
      <PlaygroundComposerContent channel={channel} label={label} uploads={uploads} />
    </ChatMainPanelFooter>
  );
}

export function PlaygroundThreadComposer({
  channel,
  label,
  uploads = false,
}: PlaygroundComposerProps) {
  return (
    <ChatThreadPanelFooter render={<form onSubmit={(event) => event.preventDefault()} />}>
      <PlaygroundComposerContent channel={channel} label={label} uploads={uploads} />
    </ChatThreadPanelFooter>
  );
}
