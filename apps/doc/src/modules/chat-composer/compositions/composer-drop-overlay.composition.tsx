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
    <div className="relative w-full">
      <ComposerRoot>
        <Composer>
          <ComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            readOnly
          />
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
      </ComposerRoot>
      <ComposerDropOverlay aria-hidden>
        <ComposerDropOverlayPrompt />
      </ComposerDropOverlay>
    </div>
  );
}
