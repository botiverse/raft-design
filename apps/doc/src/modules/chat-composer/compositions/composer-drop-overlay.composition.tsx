import { Paperclip, Send } from "lucide-react";
import {
  ComposerDropOverlay,
  ComposerDropOverlayPrompt,
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
} from "raft-ui/wip";

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
