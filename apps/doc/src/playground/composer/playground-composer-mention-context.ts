import { createContext } from "react";

export type MentionInserter = (handle: string) => void;

export type PlaygroundSingleComposerMentionTarget = {
  insertMention: MentionInserter;
  registerComposer: (inserter: MentionInserter) => () => void;
};

export const PlaygroundSingleComposerMentionContext =
  createContext<PlaygroundSingleComposerMentionTarget | null>(null);
