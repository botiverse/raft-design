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
  const [imageUpload, setImageUpload] = useState(true);
  const [imageFailed, setImageFailed] = useState(true);
  const [fileUpload, setFileUpload] = useState(true);
  const [failedUpload, setFailedUpload] = useState(true);
  const [dropOverlay, setDropOverlay] = useState(false);
  const submitDisabled = imageUpload || imageFailed || fileUpload || failedUpload;

  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>
        <div className="flex min-h-[22rem] w-full min-w-0 flex-col justify-end px-2">
          <ComposerRoot>
            <ComposerAttachmentsComposition
              imageStates={[
                "uploaded",
                ...(imageUpload ? (["uploading"] as const) : []),
                ...(imageFailed ? (["failed"] as const) : []),
              ]}
              fileStates={[
                "uploaded",
                ...(fileUpload ? (["uploading"] as const) : []),
                ...(failedUpload ? (["failed"] as const) : []),
                "uploaded",
                "uploaded",
                "uploaded",
              ]}
              onRetry={(name) => {
                if (name.endsWith(".png")) {
                  setImageFailed(false);
                  setImageUpload(true);
                  return;
                }
                setFailedUpload(false);
                setFileUpload(true);
              }}
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
                  <ComposerIconButton
                    aria-label="Attach image"
                    onClick={() => setImageUpload(!imageUpload)}
                  >
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton
                    aria-label="Attach file"
                    onClick={() => setFileUpload(!fileUpload)}
                  >
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerToolbarLabel>
                    <Checkbox size="sm" aria-label="Send as task" />
                    As Task
                  </ComposerToolbarLabel>
                  <ComposerSubmit aria-label="Send" disabled={submitDisabled}>
                    <span>Send</span>
                    <Send />
                  </ComposerSubmit>
                </ComposerMeta>
              </ComposerToolbar>
            </Composer>
            {dropOverlay ? (
              <ComposerDropOverlay aria-hidden>
                <ComposerDropOverlayPrompt />
              </ComposerDropOverlay>
            ) : null}
          </ComposerRoot>
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Attachments">
          <Preview.Control label="Uploading image" htmlFor="composer-preview-image-upload">
            <Preview.Checkbox
              id="composer-preview-image-upload"
              label="Uploading image"
              checked={imageUpload}
              onCheckedChange={setImageUpload}
            />
          </Preview.Control>
          <Preview.Control label="Failed image upload" htmlFor="composer-preview-image-failed">
            <Preview.Checkbox
              id="composer-preview-image-failed"
              label="Failed image upload"
              checked={imageFailed}
              onCheckedChange={setImageFailed}
            />
          </Preview.Control>
          <Preview.Control label="Uploading file" htmlFor="composer-preview-file-upload">
            <Preview.Checkbox
              id="composer-preview-file-upload"
              label="Uploading file"
              checked={fileUpload}
              onCheckedChange={setFileUpload}
            />
          </Preview.Control>
          <Preview.Control label="Failed file upload" htmlFor="composer-preview-failed-upload">
            <Preview.Checkbox
              id="composer-preview-failed-upload"
              label="Failed file upload"
              checked={failedUpload}
              onCheckedChange={setFailedUpload}
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
