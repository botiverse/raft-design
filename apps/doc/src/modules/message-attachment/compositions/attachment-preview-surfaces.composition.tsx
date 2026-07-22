import { useState } from "react";
import { Download, Music, Play, X } from "lucide-react";
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
import {
  MESSAGE_FIXTURE_AUDIO_SRC,
  downloadMessageFixture,
} from "#/modules/message-item/message-item.fixtures.ts";
import { MessageAttachmentReadyComposition } from "./attachment.compositions.tsx";

const HTML_PREVIEW_EXTERNAL_URL = "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a";

function openHtmlPreviewExternalUrl(): boolean {
  // Match the source flow: reserve a blank tab so a null result is an honest
  // popup-block signal, then sever its opener before navigating externally.
  const popup = window.open("about:blank", "_blank");
  if (!popup) return false;

  try {
    popup.opener = null;
    const meta = popup.document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    popup.document.head.append(meta);
    const anchor = popup.document.createElement("a");
    anchor.href = HTML_PREVIEW_EXTERNAL_URL;
    anchor.rel = "noopener noreferrer";
    anchor.referrerPolicy = "no-referrer";
    (popup.document.body ?? popup.document.documentElement).append(anchor);
    anchor.click();
    return true;
  } catch {
    try {
      popup.close();
    } catch {
      // Best effort: browsers may revoke the reserved WindowProxy.
    }
    return false;
  }
}

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
  const [fallbackVisible, setFallbackVisible] = useState(false);

  return (
    <div className="relative h-64 w-full overflow-hidden border-2 border-line-strong bg-layer-panel">
      <MessageAttachmentPreviewRoot>
        <div className="size-full bg-[oklch(0.97_0_0)] p-6 text-sm">
          <p className="font-bold text-foreground">Preview document</p>
          <p className="mt-2 text-foreground-muted">
            External links are parent-owned hotspots over reported rects.
          </p>
          <span className="mt-4 inline-block font-bold text-primary-600 underline">
            developer.mozilla.org
          </span>
        </div>
        <MessageAttachmentPreviewExternalLinkHotspots>
          <MessageAttachmentPreviewExternalLinkHotspot
            aria-label="Open external link: developer.mozilla.org"
            title={HTML_PREVIEW_EXTERNAL_URL}
            style={{ left: 24, top: 104, width: 140, height: 22 }}
            onClick={() => setFallbackVisible(!openHtmlPreviewExternalUrl())}
          />
        </MessageAttachmentPreviewExternalLinkHotspots>
        {fallbackVisible ? (
          <MessageAttachmentPreviewExternalLinkFallback>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black">Your browser blocked the new tab</div>
              <div className="truncate text-xs font-bold" title="developer.mozilla.org">
                developer.mozilla.org
              </div>
              <div
                className="truncate text-xs text-foreground/65"
                title={HTML_PREVIEW_EXTERNAL_URL}
              >
                {HTML_PREVIEW_EXTERNAL_URL}
              </div>
            </div>
            <Button
              size="sm"
              type="button"
              onClick={() => {
                if (openHtmlPreviewExternalUrl()) setFallbackVisible(false);
              }}
            >
              Open link
            </Button>
            <MessageAttachmentPreviewExternalLinkFallbackDismiss
              aria-label="Dismiss external link"
              onClick={() => setFallbackVisible(false)}
            >
              <X />
            </MessageAttachmentPreviewExternalLinkFallbackDismiss>
          </MessageAttachmentPreviewExternalLinkFallback>
        ) : null}
      </MessageAttachmentPreviewRoot>
    </div>
  );
}

function AudioPreviewStage() {
  return (
    <MessageAttachmentAudioPreview>
      <MessageAttachmentAudioPreviewCard>
        <MessageAttachmentAudioPreviewHeader>
          <MessageAttachmentAudioPreviewIcon>
            <Music aria-hidden />
          </MessageAttachmentAudioPreviewIcon>
          <MessageAttachmentAudioPreviewMeta>
            <MessageAttachmentAudioPreviewTitle>
              message-preview.wav
            </MessageAttachmentAudioPreviewTitle>
            <MessageAttachmentAudioPreviewLabel>
              Audio preview · real WAV fixture
            </MessageAttachmentAudioPreviewLabel>
          </MessageAttachmentAudioPreviewMeta>
        </MessageAttachmentAudioPreviewHeader>
        <MessageAttachmentAudioPreviewMedia
          aria-label="Play message-preview.wav"
          src={MESSAGE_FIXTURE_AUDIO_SRC}
        />
      </MessageAttachmentAudioPreviewCard>
    </MessageAttachmentAudioPreview>
  );
}

export function MessageAudioAttachmentComposition() {
  const [previewVisible, setPreviewVisible] = useState(false);

  return (
    <div className="grid gap-2">
      <MessageAttachmentReadyComposition
        name="message-preview.wav"
        meta="WAV audio · playable fixture"
        primaryAction={<Play />}
        primaryActionLabel={previewVisible ? "Hide audio preview" : "Preview message-preview.wav"}
        onPrimaryAction={() => setPreviewVisible((visible) => !visible)}
        secondaryAction={<Download />}
        secondaryActionLabel="Download message-preview.wav"
        onSecondaryAction={() => downloadMessageFixture("message-preview.wav")}
      />
      {previewVisible ? <AudioPreviewStage /> : null}
    </div>
  );
}

export function MessageAttachmentPreviewSurfacesComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <HtmlExternalLinkPreviewStage />
      <HtmlExternalLinkHotspotStage />
      <MessageAudioAttachmentComposition />
    </div>
  );
}
