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
  ChatMainPanelComposerAttachmentFailedOverlay,
  ChatMainPanelComposerAttachmentUploadingOverlay,
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
  ComposerRoot,
  ComposerToolbarOption,
  ComposerToolbarOptionLabel,
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
      <ComposerRoot>
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            readOnly
          />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerActions>
              <ChatMainPanelComposerIconButton aria-label="Attach image" disabled>
                <ImagePlus />
              </ChatMainPanelComposerIconButton>
              <ChatMainPanelComposerIconButton aria-label="Attach file" disabled>
                <Paperclip />
              </ChatMainPanelComposerIconButton>
            </ChatMainPanelComposerActions>
            <ChatMainPanelComposerMeta>
              <ComposerToolbarOption>
                <Checkbox size="sm" aria-label="Send as task" />
                <ComposerToolbarOptionLabel>As Task</ComposerToolbarOptionLabel>
              </ComposerToolbarOption>
              <ChatMainPanelComposerSubmit aria-label="Send" disabled>
                <span>Send</span>
                <Send />
              </ChatMainPanelComposerSubmit>
            </ChatMainPanelComposerMeta>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </ComposerRoot>
    </ComposerHost>
  );
}

export function ComposerAttachmentsComposition({
  onRemove,
  onRetry,
}: {
  onRemove?: (name: string) => void;
  onRetry?: (name: string) => void;
} = {}) {
  return (
    <ChatMainPanelComposerAttachments>
      <ChatMainPanelComposerAttachment>
        <ChatMainPanelComposerAttachmentImage alt="" src={COMPOSER_IMAGE_SRC} />
        <ChatMainPanelComposerAttachmentUploadingOverlay>
          <Spinner size="sm" />
          64%
        </ChatMainPanelComposerAttachmentUploadingOverlay>
        <ChatMainPanelComposerAttachmentProgress value={64} />
        <ChatMainPanelComposerAttachmentRemove
          aria-label="Remove screenshot.png"
          disabled={!onRemove}
          onClick={() => onRemove?.("screenshot.png")}
        >
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
        <ChatMainPanelComposerAttachmentRemove
          aria-label="Remove release-notes.pdf"
          disabled={!onRemove}
          onClick={() => onRemove?.("release-notes.pdf")}
        >
          <X />
        </ChatMainPanelComposerAttachmentRemove>
      </ChatMainPanelComposerAttachment>
      <ChatMainPanelComposerAttachment>
        <ChatMainPanelComposerAttachmentFile>
          <FileText />
          <ChatMainPanelComposerAttachmentBody>
            <ChatMainPanelComposerAttachmentTitle>deck.key</ChatMainPanelComposerAttachmentTitle>
            <ChatMainPanelComposerAttachmentMeta>
              application/octet-stream
            </ChatMainPanelComposerAttachmentMeta>
          </ChatMainPanelComposerAttachmentBody>
        </ChatMainPanelComposerAttachmentFile>
        <ChatMainPanelComposerAttachmentFailedOverlay
          render={<button type="button" disabled={!onRetry} />}
          onClick={() => onRetry?.("deck.key")}
        >
          Upload failed
          <span className="underline">Tap to retry</span>
        </ChatMainPanelComposerAttachmentFailedOverlay>
      </ChatMainPanelComposerAttachment>
    </ChatMainPanelComposerAttachments>
  );
}

export function ComposerStatesComposition() {
  return (
    <ComposerHost>
      <ComposerRoot>
        <ComposerAttachmentsComposition />
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            readOnly
          />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerActions>
              <ChatMainPanelComposerIconButton aria-label="Attach file" disabled>
                <Paperclip />
              </ChatMainPanelComposerIconButton>
            </ChatMainPanelComposerActions>
            <ChatMainPanelComposerSubmit aria-label="Send" disabled>
              <Send />
            </ChatMainPanelComposerSubmit>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </ComposerRoot>
    </ComposerHost>
  );
}

export function ComposerDropOverlayComposition() {
  return (
    <ComposerHost>
      <ComposerRoot>
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            readOnly
          />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerActions>
              <ChatMainPanelComposerIconButton aria-label="Attach file" disabled>
                <Paperclip />
              </ChatMainPanelComposerIconButton>
            </ChatMainPanelComposerActions>
            <ChatMainPanelComposerSubmit aria-label="Send" disabled>
              <Send />
            </ChatMainPanelComposerSubmit>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </ComposerRoot>
      <ChatMainPanelComposerDropOverlay aria-hidden>
        <ChatMainPanelComposerDropOverlayLabel>
          Drop files to attach
        </ChatMainPanelComposerDropOverlayLabel>
      </ChatMainPanelComposerDropOverlay>
    </ComposerHost>
  );
}
