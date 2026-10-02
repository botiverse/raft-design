import { AlertTriangle, Paperclip, Send, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  ComposerActions,
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFile,
  ComposerAttachmentMeta,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerAttachmentTitle,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
} from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

const MAX_ATTACHMENTS = 10;

const INITIAL_ATTACHMENTS = [
  "release-notes.pdf",
  "design-spec.pdf",
  "research-notes.pdf",
  "api-contract.pdf",
  "attachment-5.pdf",
  "attachment-6.pdf",
  "attachment-7.pdf",
  "attachment-8.pdf",
  "attachment-9.pdf",
  "attachment-10.pdf",
];

export function ComposerAttachmentLimitComposition() {
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS);
  const [limitReached, setLimitReached] = useState(true);
  // Monotonic suffix so a name is never reused after a tile is removed.
  const nextAttachmentNumber = useRef(INITIAL_ATTACHMENTS.length + 1);

  const addAttachment = useCallback(() => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      setLimitReached(true);
      return;
    }
    const name = `attachment-${nextAttachmentNumber.current}.pdf`;
    nextAttachmentNumber.current += 1;
    setAttachments((current) => [...current, name]);
    setLimitReached(false);
  }, [attachments.length]);

  const removeAttachment = useCallback((name: string) => {
    setAttachments((current) => current.filter((attachment) => attachment !== name));
    setLimitReached(false);
  }, []);

  const dismissLimitNotice = useCallback(() => {
    setLimitReached(false);
  }, []);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {limitReached ? (
        <Banner status="warning" size="md" className="w-full">
          <AlertTriangle />
          <BannerTitle>Attachment limit reached</BannerTitle>
          <BannerDescription>
            You can attach up to {MAX_ATTACHMENTS} files per message.
          </BannerDescription>
          <BannerAction>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Dismiss attachment limit notice"
              onClick={dismissLimitNotice}
            >
              <X />
            </Button>
          </BannerAction>
        </Banner>
      ) : null}
      <ComposerRoot>
        <ComposerAttachments>
          {attachments.map((name) => (
            <AttachmentTile key={name} name={name} onRemove={removeAttachment} />
          ))}
        </ComposerAttachments>
        <Composer>
          <ComposerInput aria-label="Message #proj-uiux" placeholder="Message #proj-uiux" />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerIconButton aria-label="Attach file" onClick={addAttachment}>
                <Paperclip />
              </ComposerIconButton>
            </ComposerActions>
            <ComposerMeta>
              <ComposerSubmit aria-label="Send" disabled>
                <Send />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
    </div>
  );
}

function AttachmentTile({ name, onRemove }: { name: string; onRemove: (name: string) => void }) {
  const handleRemove = useCallback(() => onRemove(name), [name, onRemove]);

  return (
    <ComposerAttachment>
      <ComposerAttachmentFile>
        <FilePreview className="h-[46px]">
          <FilePreviewDocument className="h-[46px]" />
          <FilePreviewBadge type="pdf">PDF</FilePreviewBadge>
        </FilePreview>
        <ComposerAttachmentBody>
          <ComposerAttachmentTitle>{name}</ComposerAttachmentTitle>
          <ComposerAttachmentMeta>18 KB</ComposerAttachmentMeta>
        </ComposerAttachmentBody>
      </ComposerAttachmentFile>
      <ComposerAttachmentRemove aria-label={`Remove ${name}`} onClick={handleRemove}>
        <X />
      </ComposerAttachmentRemove>
    </ComposerAttachment>
  );
}
