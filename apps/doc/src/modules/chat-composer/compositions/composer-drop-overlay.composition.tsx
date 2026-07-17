import { Paperclip, Send } from "lucide-react";
import {
  ComposerDropOverlay,
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
} from "raft-ui/wip";

import { ComposerDropOverlayPrompt } from "./composer-drop-overlay-prompt.composition.tsx";

export function ComposerDropOverlayComposition() {
  return (
    <ComposerRoot>
      <Composer>
        <ComposerInput aria-label="Message #proj-uiux" placeholder="Message #proj-uiux" readOnly />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton aria-label="Attach file" disabled>
              <Paperclip />
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            <ComposerSubmit aria-label="Send" disabled>
              <Send />
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
      <ComposerDropOverlay aria-hidden>
        <ComposerDropOverlayPrompt />
      </ComposerDropOverlay>
    </ComposerRoot>
  );
}
