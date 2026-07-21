import { useComposerSuggestions, type ComposerSuggestionTriggerMatch } from "raft-ui";

import {
  PLAYGROUND_ACTORS,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  getPlaygroundMembers,
  type PlaygroundChannel,
  type PlaygroundChannelId,
} from "../mock/index.ts";

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
  id: PlaygroundChannelId;
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
  id: channel.id,
  kind: "channel",
  name: channel.name,
  roomKind: channel.kind,
  subtitle: channel.subtitle,
}));

function detectTrigger(textBeforeCaret: string): ComposerSuggestionTriggerMatch | null {
  const match = /(?:^|\s)([@#])([^\s@#]*)$/.exec(textBeforeCaret);
  if (!match) return null;

  const marker = match[1];
  return {
    marker,
    query: match[2],
    start: match.index + match[0].lastIndexOf(marker),
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
  match: ComposerSuggestionTriggerMatch,
): readonly ComposerSuggestion[] {
  const query = match.query.toLocaleLowerCase();
  const suggestions = match.marker === "@" ? getMentionSuggestions(channel) : CHANNEL_SUGGESTIONS;
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

function getSuggestionText(suggestion: ComposerSuggestion) {
  return suggestion.kind === "mention" ? `@${suggestion.handle} ` : `#${suggestion.name} `;
}

export function usePlaygroundComposerAutocomplete(
  channel: PlaygroundChannel,
  value: string,
  onValueChange: (value: string) => void,
) {
  return useComposerSuggestions<ComposerSuggestion>({
    value,
    onValueChange,
    detectTrigger,
    getItems: (match) => getSuggestions(channel, match),
    getItemText: getSuggestionText,
    isItemDisabled: isComposerSuggestionDisabled,
  });
}
