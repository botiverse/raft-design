import { ImagePlus, Paperclip, Send } from "lucide-react";
import { useCallback, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Checkbox,
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
} from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "raft-ui";

export function ComposerDefaultComposition() {
  const [draft, setDraft] = useState("");
  const [hasAttachment, setHasAttachment] = useState(false);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!draft.trim() && !hasAttachment) return;
      setDraft("");
      setHasAttachment(false);
    },
    [draft, hasAttachment],
  );

  const handleDraftChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.currentTarget.value);
  }, []);

  const handleAttach = useCallback(() => {
    setHasAttachment(true);
  }, []);

  return (
    <ComposerRoot onSubmit={handleSubmit}>
      <Composer>
        <ComposerInput
          aria-label="Message #proj-uiux"
          placeholder="Message #proj-uiux"
          value={draft}
          onChange={handleDraftChange}
        />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton aria-label="Attach image" onClick={handleAttach}>
              <ImagePlus />
            </ComposerIconButton>
            <ComposerIconButton aria-label="Attach file" onClick={handleAttach}>
              <Paperclip />
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            <ComposerToolbarLabel>
              <Checkbox aria-label="Send as task" />
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
