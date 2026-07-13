import type { ReactNode } from "react";
import { FileText, ImagePlus, Paperclip, Send, X } from "lucide-react";
import { Checkbox, Spinner } from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFailedOverlay,
  ComposerAttachmentFile,
  ComposerAttachmentImage,
  ComposerAttachmentMeta,
  ComposerAttachmentProgress,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerAttachmentTitle,
  ComposerAttachmentUploadingOverlay,
  ComposerDropOverlay,
  ComposerDropOverlayLabel,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ChatMainPanelFooter,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
  ComposerToolbarLabelText,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";

function ComposerHost({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-end bg-layer-panel">
      <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
        {children}
      </ChatMainPanelFooter>
    </div>
  );
}

export function ComposerBodyComposition({
  input,
  actions,
  meta,
}: {
  input: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <Composer>
      {input}
      {actions || meta ? (
        <ComposerToolbar>
          {actions ? <ComposerActions>{actions}</ComposerActions> : null}
          {meta ? <ComposerMeta>{meta}</ComposerMeta> : null}
        </ComposerToolbar>
      ) : null}
    </Composer>
  );
}

export function ComposerComposition() {
  return (
    <ComposerHost>
      <ComposerRoot>
        <ComposerBodyComposition
          input={
            <ComposerInput
              aria-label="Message #proj-uiux"
              placeholder="Message #proj-uiux"
              readOnly
            />
          }
          actions={
            <>
              <ComposerIconButton aria-label="Attach image" disabled>
                <ImagePlus />
              </ComposerIconButton>
              <ComposerIconButton aria-label="Attach file" disabled>
                <Paperclip />
              </ComposerIconButton>
            </>
          }
          meta={
            <>
              <ComposerToolbarLabel>
                <Checkbox size="sm" aria-label="Send as task" />
                <ComposerToolbarLabelText>As Task</ComposerToolbarLabelText>
              </ComposerToolbarLabel>
              <ComposerSubmit aria-label="Send" disabled>
                <span>Send</span>
                <Send />
              </ComposerSubmit>
            </>
          }
        />
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
    <ComposerAttachments>
      <ComposerAttachment>
        <ComposerAttachmentImage alt="" src={COMPOSER_IMAGE_SRC} />
        <ComposerAttachmentUploadingOverlay>
          <Spinner size="sm" />
          64%
        </ComposerAttachmentUploadingOverlay>
        <ComposerAttachmentProgress aria-label="Upload progress for screenshot.png" value={64} />
        <ComposerAttachmentRemove
          aria-label="Remove screenshot.png"
          disabled={!onRemove}
          onClick={() => onRemove?.("screenshot.png")}
        >
          <X />
        </ComposerAttachmentRemove>
      </ComposerAttachment>
      <ComposerAttachment>
        <ComposerAttachmentFile>
          <FileText />
          <ComposerAttachmentBody>
            <ComposerAttachmentTitle>release-notes.pdf</ComposerAttachmentTitle>
            <ComposerAttachmentMeta>application/pdf</ComposerAttachmentMeta>
          </ComposerAttachmentBody>
        </ComposerAttachmentFile>
        <ComposerAttachmentRemove
          aria-label="Remove release-notes.pdf"
          disabled={!onRemove}
          onClick={() => onRemove?.("release-notes.pdf")}
        >
          <X />
        </ComposerAttachmentRemove>
      </ComposerAttachment>
      <ComposerAttachment>
        <ComposerAttachmentFile>
          <FileText />
          <ComposerAttachmentBody>
            <ComposerAttachmentTitle>deck.key</ComposerAttachmentTitle>
            <ComposerAttachmentMeta>application/octet-stream</ComposerAttachmentMeta>
          </ComposerAttachmentBody>
        </ComposerAttachmentFile>
        <ComposerAttachmentFailedOverlay
          render={<button type="button" disabled={!onRetry} />}
          onClick={() => onRetry?.("deck.key")}
        >
          Upload failed
          <span className="underline">Tap to retry</span>
        </ComposerAttachmentFailedOverlay>
      </ComposerAttachment>
    </ComposerAttachments>
  );
}

export function ComposerStatesComposition() {
  return (
    <ComposerHost>
      <ComposerRoot>
        <ComposerAttachmentsComposition />
        <ComposerBodyComposition
          input={
            <ComposerInput
              aria-label="Message #proj-uiux"
              placeholder="Message #proj-uiux"
              readOnly
            />
          }
          actions={
            <ComposerIconButton aria-label="Attach file" disabled>
              <Paperclip />
            </ComposerIconButton>
          }
          meta={
            <ComposerSubmit aria-label="Send" disabled>
              <Send />
            </ComposerSubmit>
          }
        />
      </ComposerRoot>
    </ComposerHost>
  );
}

export function ComposerDropOverlayComposition() {
  return (
    <ComposerHost>
      <ComposerRoot>
        <ComposerBodyComposition
          input={
            <ComposerInput
              aria-label="Message #proj-uiux"
              placeholder="Message #proj-uiux"
              readOnly
            />
          }
          actions={
            <ComposerIconButton aria-label="Attach file" disabled>
              <Paperclip />
            </ComposerIconButton>
          }
          meta={
            <ComposerSubmit aria-label="Send" disabled>
              <Send />
            </ComposerSubmit>
          }
        />
      </ComposerRoot>
      <ComposerDropOverlay aria-hidden>
        <ComposerDropOverlayLabel>Drop files to attach</ComposerDropOverlayLabel>
      </ComposerDropOverlay>
    </ComposerHost>
  );
}
