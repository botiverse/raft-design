import { useContext } from "react";

import { PlaygroundSingleComposerMentionContext } from "./playground-composer-mention-context.ts";

export function usePlaygroundSingleComposerMentionTarget() {
  return useContext(PlaygroundSingleComposerMentionContext);
}
