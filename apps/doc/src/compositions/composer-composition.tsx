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

export const COMPOSER_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23f7d358'/%3E%3Ccircle cx='44' cy='48' r='22' fill='%23ff7ab6' stroke='%23000' stroke-width='6'/%3E%3Cpath d='M22 108 66 62l20 22 12-10 12 34z' fill='%23a3e8ff' stroke='%23000' stroke-width='6'/%3E%3C/svg%3E";

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
