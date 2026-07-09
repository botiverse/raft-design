import type { ReactNode } from "react";
import { FileText, ImagePlus, Paperclip, Send, X } from "lucide-react";
import { Checkbox, Spinner } from "raft-ui";
import {
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerAttachment,
  ChatMainPanelComposerAttachmentBody,
  ChatMainPanelComposerAttachmentFile,
  ChatMainPanelComposerAttachmentImage,
  ChatMainPanelComposerAttachmentMeta,
  ChatMainPanelComposerAttachmentOverlay,
  ChatMainPanelComposerAttachmentProgress,
  ChatMainPanelComposerAttachmentRemove,
  ChatMainPanelComposerAttachmentTitle,
  ChatMainPanelComposerAttachments,
  ChatMainPanelComposerDropOverlay,
  ChatMainPanelComposerDropOverlayLabel,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ChatMainPanelFooter,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "#/compositions/chat-main-panel-states-composition.tsx";

export { COMPOSER_IMAGE_SRC };

function ComposerHost({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-end bg-layer-panel">
      <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
        {children}
      </ChatMainPanelFooter>
    </div>
  );
}

export function ComposerComposition() {
  return (
    <ComposerHost>
      <ChatMainPanelComposer>
        <ChatMainPanelComposerInput
          aria-label="Message #proj-uiux"
          placeholder="Message #proj-uiux"
          readOnly
        />
        <ChatMainPanelComposerToolbar>
          <ChatMainPanelComposerActions>
            <ChatMainPanelComposerIconButton aria-label="Attach image">
              <ImagePlus />
            </ChatMainPanelComposerIconButton>
            <ChatMainPanelComposerIconButton aria-label="Attach file">
              <Paperclip />
            </ChatMainPanelComposerIconButton>
          </ChatMainPanelComposerActions>
          <ChatMainPanelComposerMeta>
            <label className="inline-flex select-none items-center gap-1.5">
              <Checkbox size="sm" aria-label="Send as task" />
              <span className="text-xs font-bold text-foreground-muted [[data-preview-theme=brutal]_&]:text-black/60">
                As Task
              </span>
            </label>
            <ChatMainPanelComposerSubmit aria-label="Send">
              <Send />
            </ChatMainPanelComposerSubmit>
          </ChatMainPanelComposerMeta>
        </ChatMainPanelComposerToolbar>
      </ChatMainPanelComposer>
    </ComposerHost>
  );
}

export function ComposerStatesComposition() {
  return (
    <ComposerHost>
      <div className="flex w-full flex-col gap-2">
        <ChatMainPanelComposerAttachments>
          <ChatMainPanelComposerAttachment>
            <ChatMainPanelComposerAttachmentImage alt="" src={COMPOSER_IMAGE_SRC} />
            <ChatMainPanelComposerAttachmentOverlay tone="uploading">
              <Spinner size="sm" className="mb-1" />
              64%
            </ChatMainPanelComposerAttachmentOverlay>
            <ChatMainPanelComposerAttachmentProgress value={64} />
            <ChatMainPanelComposerAttachmentRemove aria-label="Remove screenshot.png">
              <X />
            </ChatMainPanelComposerAttachmentRemove>
          </ChatMainPanelComposerAttachment>
          <ChatMainPanelComposerAttachment>
            <ChatMainPanelComposerAttachmentFile>
              <FileText />
              <ChatMainPanelComposerAttachmentBody>
                <ChatMainPanelComposerAttachmentTitle>
                  release-notes.pdf
                </ChatMainPanelComposerAttachmentTitle>
                <ChatMainPanelComposerAttachmentMeta>
                  application/pdf
                </ChatMainPanelComposerAttachmentMeta>
              </ChatMainPanelComposerAttachmentBody>
            </ChatMainPanelComposerAttachmentFile>
            <ChatMainPanelComposerAttachmentRemove aria-label="Remove release-notes.pdf">
              <X />
            </ChatMainPanelComposerAttachmentRemove>
          </ChatMainPanelComposerAttachment>
          <ChatMainPanelComposerAttachment>
            <ChatMainPanelComposerAttachmentFile>
              <FileText />
              <ChatMainPanelComposerAttachmentBody>
                <ChatMainPanelComposerAttachmentTitle>
                  deck.key
                </ChatMainPanelComposerAttachmentTitle>
                <ChatMainPanelComposerAttachmentMeta>
                  application/octet-stream
                </ChatMainPanelComposerAttachmentMeta>
              </ChatMainPanelComposerAttachmentBody>
            </ChatMainPanelComposerAttachmentFile>
            <ChatMainPanelComposerAttachmentOverlay tone="failed">
              Upload failed
              <span className="underline">Tap to retry</span>
            </ChatMainPanelComposerAttachmentOverlay>
          </ChatMainPanelComposerAttachment>
        </ChatMainPanelComposerAttachments>
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            readOnly
          />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerActions>
              <ChatMainPanelComposerIconButton aria-label="Attach file">
                <Paperclip />
              </ChatMainPanelComposerIconButton>
            </ChatMainPanelComposerActions>
            <ChatMainPanelComposerSubmit aria-label="Send">
              <Send />
            </ChatMainPanelComposerSubmit>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </div>
    </ComposerHost>
  );
}

export function ComposerDropOverlayComposition() {
  return (
    <ComposerHost>
      <ChatMainPanelComposer>
        <ChatMainPanelComposerInput
          aria-label="Message #proj-uiux"
          placeholder="Message #proj-uiux"
          readOnly
        />
        <ChatMainPanelComposerToolbar>
          <ChatMainPanelComposerActions>
            <ChatMainPanelComposerIconButton aria-label="Attach file">
              <Paperclip />
            </ChatMainPanelComposerIconButton>
          </ChatMainPanelComposerActions>
          <ChatMainPanelComposerSubmit aria-label="Send">
            <Send />
          </ChatMainPanelComposerSubmit>
        </ChatMainPanelComposerToolbar>
      </ChatMainPanelComposer>
      <ChatMainPanelComposerDropOverlay aria-hidden>
        <ChatMainPanelComposerDropOverlayLabel>
          Drop files to attach
        </ChatMainPanelComposerDropOverlayLabel>
      </ChatMainPanelComposerDropOverlay>
    </ComposerHost>
  );
}
