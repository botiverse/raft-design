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
  ComposerStack,
  ComposerTaskLabel,
  ComposerTaskToggle,
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
            <ComposerTaskToggle>
              <Checkbox size="sm" aria-label="Send as task" />
              <ComposerTaskLabel>As Task</ComposerTaskLabel>
            </ComposerTaskToggle>
            <ChatMainPanelComposerSubmit aria-label="Send">
              <span>Send</span>
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
      <ComposerStack>
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
              <span>Send</span>
              <Send />
            </ChatMainPanelComposerSubmit>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </ComposerStack>
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
            <span>Send</span>
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
