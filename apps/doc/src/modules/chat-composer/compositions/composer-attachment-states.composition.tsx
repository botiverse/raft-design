import { Paperclip, Send } from "lucide-react";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
} from "raft-ui/wip";

import { ComposerAttachmentsComposition } from "./composer-shared.composition.tsx";

export function ComposerAttachmentStatesComposition() {
  return (
    <ComposerRoot>
      <ComposerAttachmentsComposition />
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
    </ComposerRoot>
  );
}
