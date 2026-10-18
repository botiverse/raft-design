import { Plus, Send } from "lucide-react";
import { useCallback, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "raft-ui";

export function ComposerFooterAddComposition() {
  const [draft, setDraft] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!draft.trim()) return;
      setDraft("");
    },
    [draft],
  );

  const handleDraftChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.currentTarget.value);
  }, []);

  return (
    <div className="flex justify-center">
      <ComposerRoot className="max-w-sm" onSubmit={handleSubmit}>
        <Composer>
          <ComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            value={draft}
            onChange={handleDraftChange}
          />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerIconButton aria-label="Add">
                <Plus />
              </ComposerIconButton>
            </ComposerActions>
            <ComposerMeta>
              <ComposerSubmit aria-label="Send" disabled={!draft.trim()}>
                <span>Send</span>
                <Send />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
    </div>
  );
}
