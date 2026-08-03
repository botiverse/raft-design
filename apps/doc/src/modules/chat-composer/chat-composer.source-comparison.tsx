import { FileText, ImagePlus, Paperclip, Send, X } from "lucide-react";

import CheckMarker from "../../../../../packages/ui/src/legacy/CheckMarker.tsx";
import Spinner from "../../../../../packages/ui/src/legacy/Spinner.tsx";
import { COMPOSER_IMAGE_SRC } from "./composer-image.ts";

/**
 * Static reference of the source MessageInput composer card.
 * ClassNames mirror MessageInput.tsx (composer shell + toolbar).
 */
export function ComposerDefaultSourceComparison() {
  return (
    <div className="flex w-full min-w-0 flex-col justify-end p-3">
      <SourceComposerShell showTaskButton />
    </div>
  );
}

/**
 * Static reference of the source MessageInput pending-attachment strip.
 * ClassNames mirror MessageInput.tsx SortableAttachment.
 */
export function ComposerAttachmentStatesSourceComparison() {
  return (
    <div className="flex w-full min-w-0 flex-col justify-end gap-2 p-3">
      <div className="flex flex-wrap gap-2">
        <SourceAttachment
          kind="image"
          fileName="uploading-screenshot.png"
          uploadStatus="uploading"
          uploadProgress={64}
        />
        <SourceAttachment
          kind="file"
          fileName="release-notes.pdf"
          mimeType="application/pdf"
          uploadStatus="ready"
        />
        <SourceAttachment
          kind="file"
          fileName="failed-upload.pdf"
          mimeType="application/pdf"
          uploadStatus="error"
        />
      </div>
      <SourceComposerShell showTaskButton={false} submitDisabled />
    </div>
  );
}

/**
 * Static reference of the source MessageInput drag-and-drop overlay.
 * ClassNames mirror MessageInput.tsx composer-drop-overlay.
 */
export function ComposerDropOverlaySourceComparison() {
  return (
    <div className="relative flex w-full min-w-0 flex-col justify-end p-3">
      <SourceComposerShell showTaskButton={false} submitDisabled />
      <div
        aria-hidden
        data-testid="composer-drop-overlay"
        className="absolute inset-0 z-30 flex items-center justify-center border-2 border-dashed border-brutal-pink bg-brutal-pink/15"
      >
        <span className="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-raft-sm">
          Drop files to attach
        </span>
      </div>
    </div>
  );
}

function SourceComposerShell({
  showTaskButton,
  submitDisabled = true,
}: {
  showTaskButton: boolean;
  submitDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-2 border-black bg-white p-2 shadow-raft-sm focus-within:shadow-raft-md">
      <textarea
        readOnly
        rows={1}
        placeholder="Message #proj-uiux"
        aria-label="Message #proj-uiux"
        className="max-h-32 min-h-5 w-full resize-none font-display text-base leading-5 focus:outline-none md:min-h-10 md:text-sm"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className="btn-brutal-sm bg-white p-1" title="Attach media">
            <ImagePlus size={14} />
          </button>
          <button type="button" className="btn-brutal-sm bg-white p-1" title="Attach file">
            <Paperclip size={14} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {showTaskButton ? (
            <button
              type="button"
              role="checkbox"
              aria-checked={false}
              className="inline-flex select-none items-center gap-1.5"
              title="Send as task (⌘/Ctrl-Shift-Enter)"
            >
              <CheckMarker checked={false} />
              <span className="text-xs font-bold text-black/60">As Task</span>
            </button>
          ) : null}
          <button
            type="button"
            disabled={submitDisabled}
            className="btn-brutal-sm flex size-7 shrink-0 items-center justify-center bg-brutal-pink p-0 disabled:pointer-events-none disabled:opacity-30"
            title="Send"
            aria-label="Send"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceAttachment({
  kind,
  fileName,
  mimeType,
  uploadStatus,
  uploadProgress = 0,
}: {
  kind: "image" | "file";
  fileName: string;
  mimeType?: string;
  uploadStatus: "ready" | "uploading" | "error";
  uploadProgress?: number;
}) {
  return (
    <div className="group relative">
      <div className={kind === "image" ? "cursor-zoom-in" : "cursor-grab active:cursor-grabbing"}>
        {kind === "image" ? (
          <img
            src={COMPOSER_IMAGE_SRC}
            alt={fileName}
            className="image-transparency-bg size-16 border-2 border-black object-cover"
          />
        ) : (
          <div className="flex h-16 w-32 items-center gap-2 border-2 border-black bg-white px-2">
            <FileText size={16} className="shrink-0 text-black/70" />
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-black">{fileName}</div>
              <div className="truncate text-[10px] text-black/50">{mimeType || "file"}</div>
            </div>
          </div>
        )}
      </div>
      {uploadStatus === "uploading" ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-white/85 px-1 text-center text-[10px] font-bold text-black">
          <Spinner size="sm" className="mb-1" />
          <span>{uploadProgress > 0 ? `${uploadProgress}%` : "Uploading"}</span>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-black/15">
            <div
              className="h-full bg-brutal-pink"
              style={{ width: `${Math.max(4, Math.min(uploadProgress, 100))}%` }}
            />
          </div>
        </div>
      ) : null}
      {uploadStatus === "error" ? (
        <button
          type="button"
          title="Upload failed"
          aria-label={`Retry uploading ${fileName}`}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-brutal-orange/90 px-1 text-center text-[10px] font-bold leading-3 text-black"
        >
          <span>Upload failed</span>
          <span className="underline">Tap to retry</span>
        </button>
      ) : null}
      <button
        type="button"
        aria-label={`Remove ${fileName}`}
        className="absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:h-6 [@media(hover:none)]:w-6 [@media(hover:none)]:opacity-100"
      >
        <X size={10} />
      </button>
    </div>
  );
}
