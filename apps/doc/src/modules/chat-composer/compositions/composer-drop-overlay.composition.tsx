import { ImagePlus, Paperclip, Send } from "lucide-react";
import {
  ComposerDropOverlay,
  ComposerDropOverlayPrompt,
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

export function ComposerDropOverlayComposition() {
  return (
    <div className="relative w-full">
      <ComposerRoot>
        <Composer>
          <ComposerInput aria-label="Message #design" placeholder="Message #design" readOnly />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerIconButton aria-label="Attach image" disabled>
                <ImagePlus />
              </ComposerIconButton>
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
