import { ImagePlus, Paperclip, Send } from "lucide-react";
import { Checkbox } from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
} from "raft-ui/wip";

export function ComposerDefaultComposition({
  onSubmit,
}: {
  onSubmit?: FormEventHandler<HTMLFormElement>;
} = {}) {
  return (
    <ComposerRoot onSubmit={onSubmit}>
      <Composer>
        <ComposerInput aria-label="Message #proj-uiux" placeholder="Message #proj-uiux" readOnly />
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
            <ComposerToolbarLabel>
              <Checkbox size="sm" aria-label="Send as task" />
              As Task
            </ComposerToolbarLabel>
            <ComposerSubmit aria-label="Send" disabled>
              <span>Send</span>
              <Send />
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
    </ComposerRoot>
  );
}
import type { FormEventHandler } from "react";
