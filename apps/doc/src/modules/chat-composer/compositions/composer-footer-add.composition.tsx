import { Plus, Send } from "lucide-react";
import { useState } from "react";
import {
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
} from "raft-ui/wip";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

export function ComposerFooterAddComposition() {
  const [draft, setDraft] = useState("");

  return (
    <div className="flex justify-center">
      <ComposerRoot
        className="max-w-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setDraft("");
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
