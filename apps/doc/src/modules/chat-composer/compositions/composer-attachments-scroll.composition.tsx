import { Paperclip, Send } from "lucide-react";
import {
  Composer,
  ComposerActions,
  ComposerAttachments,
  ComposerAttachmentsScrollArea,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
} from "raft-ui/wip";

import { ComposerAttachmentsComposition } from "./composer-shared.composition.tsx";

export function ComposerAttachmentsScrollComposition() {
  return (
    <ComposerRoot>
      <ComposerAttachments>
        <ComposerAttachmentsScrollArea>
          <ComposerAttachmentsComposition
            wrap={false}
            imageStates={["uploaded"]}
            fileStates={Array.from({ length: 10 }, () => "uploaded" as const)}
          />
        </ComposerAttachmentsScrollArea>
      </ComposerAttachments>
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
