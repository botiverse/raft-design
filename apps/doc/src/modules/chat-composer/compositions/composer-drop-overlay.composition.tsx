import { Paperclip, Send } from "lucide-react";
import {
  ComposerDropOverlay,
  ComposerDropOverlayLabel,
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
    <ComposerRoot positioned>
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
        <ComposerDropOverlayLabel>Drop files to attach</ComposerDropOverlayLabel>
      </ComposerDropOverlay>
    </ComposerRoot>
  );
}
