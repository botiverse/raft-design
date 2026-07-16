import { useRef, type ReactNode } from "react";

import {
  PlaygroundSingleComposerMentionContext,
  type MentionInserter,
  type PlaygroundSingleComposerMentionTarget,
} from "./playground-composer-mention-context.ts";

/**
 * Scopes mention coordination between a panel's message rows and its only composer.
 * The composer registers its inserter; message rows call a stable target — no global
 * event bus, and no re-render of the message list while typing a draft.
 */
export function PlaygroundSingleComposerMentionProvider({ children }: { children: ReactNode }) {
  const inserterRef = useRef<MentionInserter | null>(null);
  const target = useRef<PlaygroundSingleComposerMentionTarget>({
    insertMention: (handle) => inserterRef.current?.(handle),
    registerComposer: (inserter) => {
      if (inserterRef.current) {
        throw new Error("PlaygroundSingleComposerMentionProvider supports one composer");
      }
      inserterRef.current = inserter;
      return () => {
        if (inserterRef.current === inserter) inserterRef.current = null;
      };
    },
  }).current;

  return (
    <PlaygroundSingleComposerMentionContext.Provider value={target}>
      {children}
    </PlaygroundSingleComposerMentionContext.Provider>
  );
}
