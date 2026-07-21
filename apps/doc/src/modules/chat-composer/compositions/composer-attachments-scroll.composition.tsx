import { Paperclip, Send } from "lucide-react";
import {
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

import { ComposerAttachmentsComposition } from "./composer-shared.composition.tsx";

export function ComposerAttachmentsScrollComposition() {
  return (
    <ComposerRoot>
      <ComposerAttachmentsComposition
        layout="scroll"
        imageStates={["uploaded"]}
        fileStates={Array.from({ length: 10 }, () => "uploaded" as const)}
      />
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
