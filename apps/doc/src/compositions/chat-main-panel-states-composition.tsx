import { ArrowDown, FileText, Paperclip, Send, X } from "lucide-react";
import { Banner, BannerAction, BannerDescription, Button, Spinner } from "raft-ui";
import {
  ChatMainPanelBody,
  ChatMainPanelComposer,
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
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ChatMainPanelFooter,
  ChatMainPanelJumpToLatest,
  ChatMainPanelMessageList,
  ChatMainPanelRoot,
  ChatMainPanelTimeline,
  MessageTimelineNotice,
} from "raft-ui/wip";

export const COMPOSER_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23f7d358'/%3E%3Ccircle cx='44' cy='48' r='22' fill='%23ff7ab6' stroke='%23000' stroke-width='6'/%3E%3Cpath d='M22 108 66 62l20 22 12-10 12 34z' fill='%23a3e8ff' stroke='%23000' stroke-width='6'/%3E%3C/svg%3E";

export function ChatMainPanelStatesComposition() {
  return (
    <ChatMainPanelRoot>
      <Banner
        status="warning"
        size="sm"
        className="shrink-0 rounded-none border-x-0 border-t-0 px-5 py-2"
      >
        <BannerDescription>Couldn&apos;t update Activity mute for this channel.</BannerDescription>
        <BannerAction>
          <Button variant="default" size="icon-xs" aria-label="Dismiss Activity mute error">
            <X />
          </Button>
        </BannerAction>
      </Banner>
      <ChatMainPanelBody>
        <ChatMainPanelTimeline>
          <ChatMainPanelMessageList>
            <div className="flex-1" aria-hidden />
            <MessageTimelineNotice>Older messages above</MessageTimelineNotice>
          </ChatMainPanelMessageList>
        </ChatMainPanelTimeline>
        <ChatMainPanelJumpToLatest>
          <ArrowDown />3 new messages
        </ChatMainPanelJumpToLatest>
      </ChatMainPanelBody>
      <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
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
              <ChatMainPanelComposerIconButton aria-label="Attach file">
                <Paperclip />
              </ChatMainPanelComposerIconButton>
              <ChatMainPanelComposerSubmit aria-label="Send">
                <Send />
              </ChatMainPanelComposerSubmit>
            </ChatMainPanelComposerToolbar>
          </ChatMainPanelComposer>
        </div>
      </ChatMainPanelFooter>
    </ChatMainPanelRoot>
  );
}

export function ChatMainPanelDropOverlayComposition() {
  return (
    <ChatMainPanelRoot>
      <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            readOnly
          />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerIconButton aria-label="Attach file">
              <Paperclip />
            </ChatMainPanelComposerIconButton>
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
      </ChatMainPanelFooter>
    </ChatMainPanelRoot>
  );
}
