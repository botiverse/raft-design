import { Paperclip, Send } from "lucide-react";
import {
  ComposerActions,
  ComposerAttachments,
  ComposerAttachmentsScrollArea,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "raft-ui/wip";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

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
