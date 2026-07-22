import { Music, X } from "lucide-react";
import { Button, Spinner } from "raft-ui";
import {
  MessageAttachmentAudioPreview,
  MessageAttachmentAudioPreviewCard,
  MessageAttachmentAudioPreviewHeader,
  MessageAttachmentAudioPreviewIcon,
  MessageAttachmentAudioPreviewLabel,
  MessageAttachmentAudioPreviewMedia,
  MessageAttachmentAudioPreviewMeta,
  MessageAttachmentAudioPreviewTitle,
  MessageAttachmentPreviewExternalLinkFallback,
  MessageAttachmentPreviewExternalLinkFallbackDismiss,
  MessageAttachmentPreviewExternalLinkHotspot,
  MessageAttachmentPreviewExternalLinkHotspots,
  MessageAttachmentPreviewExternalLinksLoading,
  MessageAttachmentPreviewExternalLinksLoadingPanel,
  MessageAttachmentPreviewRoot,
} from "raft-ui/wip";

function HtmlExternalLinkPreviewStage() {
  return (
    <div className="relative h-64 w-full overflow-hidden border-2 border-line-strong bg-layer-panel">
      <MessageAttachmentPreviewRoot>
        <div className="flex size-full items-center justify-center bg-[oklch(0.97_0_0)] text-xs font-bold text-foreground-muted">
          Sandboxed HTML preview surface
        </div>
        <MessageAttachmentPreviewExternalLinksLoading>
          <MessageAttachmentPreviewExternalLinksLoadingPanel>
            <Spinner size="sm" />
            Preparing interactive preview…
          </MessageAttachmentPreviewExternalLinksLoadingPanel>
        </MessageAttachmentPreviewExternalLinksLoading>
      </MessageAttachmentPreviewRoot>
    </div>
  );
}

function HtmlExternalLinkHotspotStage() {
  return (
    <div className="relative h-64 w-full overflow-hidden border-2 border-line-strong bg-layer-panel">
      <MessageAttachmentPreviewRoot>
        <div className="size-full bg-[oklch(0.97_0_0)] p-6 text-sm">
          <p className="font-bold text-foreground">Preview document</p>
          <p className="mt-2 text-foreground-muted">
            External links are parent-owned hotspots over reported rects.
          </p>
          <a className="mt-4 inline-block font-bold text-primary-600 underline" href="#docs">
            example.com/docs
          </a>
        </div>
        <MessageAttachmentPreviewExternalLinkHotspots>
          <MessageAttachmentPreviewExternalLinkHotspot
            aria-label="Open external link: example.com/docs"
            title="https://example.com/docs"
            style={{ left: 24, top: 104, width: 140, height: 22 }}
            onClick={() => undefined}
          />
        </MessageAttachmentPreviewExternalLinkHotspots>
        <MessageAttachmentPreviewExternalLinkFallback>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black">Your browser blocked the new tab</div>
            <div className="truncate text-xs font-bold" title="example.com">
              example.com
            </div>
            <div className="truncate text-xs text-foreground/65" title="https://example.com/docs">
              https://example.com/docs
            </div>
          </div>
          <Button size="sm" type="button">
            Open link
          </Button>
          <MessageAttachmentPreviewExternalLinkFallbackDismiss aria-label="Dismiss external link">
            <X />
          </MessageAttachmentPreviewExternalLinkFallbackDismiss>
        </MessageAttachmentPreviewExternalLinkFallback>
      </MessageAttachmentPreviewRoot>
    </div>
  );
}

function AudioPreviewStage() {
  return (
    <div className="h-72 w-full overflow-hidden border-2 border-line-strong">
      <MessageAttachmentAudioPreview>
        <MessageAttachmentAudioPreviewCard>
          <MessageAttachmentAudioPreviewHeader>
            <MessageAttachmentAudioPreviewIcon>
              <Music />
            </MessageAttachmentAudioPreviewIcon>
            <MessageAttachmentAudioPreviewMeta>
              <MessageAttachmentAudioPreviewTitle title="recording.mp3">
                recording.mp3
              </MessageAttachmentAudioPreviewTitle>
              <MessageAttachmentAudioPreviewLabel>Audio file</MessageAttachmentAudioPreviewLabel>
            </MessageAttachmentAudioPreviewMeta>
          </MessageAttachmentAudioPreviewHeader>
          <MessageAttachmentAudioPreviewMedia title="Audio preview: recording.mp3" />
        </MessageAttachmentAudioPreviewCard>
      </MessageAttachmentAudioPreview>
    </div>
  );
}

export function MessageAttachmentPreviewSurfacesComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <HtmlExternalLinkPreviewStage />
      <HtmlExternalLinkHotspotStage />
      <AudioPreviewStage />
    </div>
  );
}
