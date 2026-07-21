import { ImagePlus, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import {
  Checkbox,
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
} from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

export function ComposerDefaultComposition() {
  const [draft, setDraft] = useState("");
  const [hasAttachment, setHasAttachment] = useState(false);

  return (
    <ComposerRoot
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.trim() && !hasAttachment) return;
        setDraft("");
        setHasAttachment(false);
      }}
    >
      <Composer>
        <ComposerInput
          aria-label="Message #proj-uiux"
          placeholder="Message #proj-uiux"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
        />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton aria-label="Attach image" onClick={() => setHasAttachment(true)}>
              <ImagePlus />
            </ComposerIconButton>
            <ComposerIconButton aria-label="Attach file" onClick={() => setHasAttachment(true)}>
              <Paperclip />
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            <ComposerToolbarLabel>
              <Checkbox size="sm" aria-label="Send as task" />
              As Task
            </ComposerToolbarLabel>
            <ComposerSubmit aria-label="Send" disabled={!draft.trim() && !hasAttachment}>
              <span>Send</span>
              <Send />
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
    </ComposerRoot>
  );
}
