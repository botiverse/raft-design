import { Paperclip, Send } from "lucide-react";
import {
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

import { ComposerAttachmentsComposition } from "./composer-shared.composition.tsx";

const IMAGE_STATES = ["uploaded"] as const;
const FILE_STATES = Array.from({ length: 10 }, () => "uploaded" as const);

export function ComposerAttachmentsScrollComposition() {
  return (
    <ComposerRoot>
      <ComposerAttachmentsComposition
        layout="scroll"
        imageStates={IMAGE_STATES}
        fileStates={FILE_STATES}
      />
      <Composer>
        <ComposerInput aria-label="Message #design" placeholder="Message #design" readOnly />
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
