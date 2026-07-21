import { useState, type ReactNode } from "react";
import { ImagePlus, Paperclip, Send } from "lucide-react";
import { Checkbox } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import {
  ComposerActions,
  ComposerDropOverlay,
  ComposerDropOverlayPrompt,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
} from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "./composer-responsive.tsx";

import { Preview } from "#/components/preview.tsx";
import { ComposerAttachmentsComposition } from "./compositions/composer-shared.composition.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type ChatComposerPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

const PREVIEW_IMAGE_STATES = ["uploaded", "uploading", "failed"] as const;
const PREVIEW_FILE_STATES = [
  "uploaded",
  "uploading",
  "failed",
  "uploaded",
  "uploaded",
  "uploaded",
] as const;

export function ChatComposerPreview({ code, collapsedCode }: ChatComposerPreviewProps) {
  const [draft, setDraft] = useState("");
  const [dropOverlay, setDropOverlay] = useState(false);
  const [attachmentsScroll, setAttachmentsScroll] = useState(true);

  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>
        <div className="flex min-h-[22rem] w-full min-w-0 flex-col justify-end px-2">
          <div className="relative w-full">
            <ComposerRoot>
              <ComposerAttachmentsComposition
                layout={attachmentsScroll ? "scroll" : "sortable-wrap"}
                imageStates={PREVIEW_IMAGE_STATES}
                fileStates={PREVIEW_FILE_STATES}
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
        <Preview.ControlGroup label="Attachments">
          <Preview.Control label="Scroll area" htmlFor="composer-preview-attachments-scroll">
            <Preview.Checkbox
              id="composer-preview-attachments-scroll"
              label="Scroll area"
              checked={attachmentsScroll}
              onCheckedChange={setAttachmentsScroll}
            />
          </Preview.Control>
        </Preview.ControlGroup>
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
