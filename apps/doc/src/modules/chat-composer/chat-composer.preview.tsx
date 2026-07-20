import { useState, type ReactNode } from "react";
import { ImagePlus, Paperclip, Send } from "lucide-react";
import { Checkbox } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import {
  Composer,
  ComposerActions,
  ComposerDropOverlay,
  ComposerDropOverlayPrompt,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
} from "raft-ui/wip";

import { Preview } from "#/components/preview.tsx";
import { ComposerAttachmentsComposition } from "./compositions/composer-shared.composition.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type ChatComposerPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function ChatComposerPreview({ code, collapsedCode }: ChatComposerPreviewProps) {
  const [draft, setDraft] = useState("");
  const [dropOverlay, setDropOverlay] = useState(false);

  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>
        <div className="flex min-h-[22rem] w-full min-w-0 flex-col justify-end px-2">
          <div className="relative w-full">
            <ComposerRoot>
              <ComposerAttachmentsComposition
                imageStates={["uploaded", "uploading", "failed"]}
                fileStates={[
                  "uploaded",
                  "uploading",
                  "failed",
                  "uploaded",
                  "uploaded",
                  "uploaded",
                ]}
              />
              <Composer>
                <ComposerInput
                  aria-label="Message #proj-uiux"
                  placeholder="Message #proj-uiux"
                  value={draft}
                  onChange={(event) => setDraft(event.currentTarget.value)}
                />
                <ComposerToolbar>
                  <ComposerActions>
                    <ComposerIconButton aria-label="Attach image">
                      <ImagePlus />
                    </ComposerIconButton>
                    <ComposerIconButton aria-label="Attach file">
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
            {dropOverlay ? (
              <ComposerDropOverlay aria-hidden>
                <ComposerDropOverlayPrompt />
              </ComposerDropOverlay>
            ) : null}
          </div>
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Feedback">
          <Preview.Control label="Drop overlay" htmlFor="composer-preview-drop-overlay">
            <Preview.Checkbox
              id="composer-preview-drop-overlay"
              label="Drop overlay"
              checked={dropOverlay}
              onCheckedChange={setDropOverlay}
            />
          </Preview.Control>
        </Preview.ControlGroup>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
