import { Download, Eye } from "lucide-react";
import type { ReactNode } from "react";
import type { Message } from "../../store/messageStore";
import PreviewShell from "../ui/PreviewShell";
import Spinner from "../ui/Spinner";

type MessageAttachment = NonNullable<Message["attachments"]>[number];

// `variant` is retained for callsite compatibility but the visual layout is
// now unified across types. stdrc 2026-05-20 #proj-theme:441c8b2b: "包括整个
// 不同的 attachment chip 内容物的 layout 和字体大小也全都要统一" — both compact
// and wide now render the same canonical chip (filename / meta / optional
// summary stacked vertically) with the affordance icon pinned to the
// bottom-right corner. The exception is the inline image gallery (separate
// surface, see `buildImageGalleryRows` in MessageItem) which keeps its
// preview-image-in-top-left layout per stdrc's exception.
type AttachmentChipVariant = "compact" | "wide";

interface AttachmentChipProps {
  attachment: MessageAttachment;
  /** Retained for callsite compatibility. Layout is unified across variants;
   *  only the message-flow grouping differs. */
  variant: AttachmentChipVariant;
  isOptimistic: boolean;
  loading?: boolean;
  loadingLabel?: string;
  onClick?: () => void;
  affordance?: "download" | "preview" | "none";
  affordanceName?: string;
  meta?: ReactNode;
  summary?: ReactNode;
  /** Unused under the unified layout; retained for callsite compatibility. */
  icon?: ReactNode;
}

// Layout-only token (border / bg / hover / active provided by PreviewShell so
// the press-flash + hover-bg stay aligned with QuotedMessageCard — stdrc
// 2026-05-22 #proj-theme:441c8b2b 7d19c377 / 4365db5a). messageAttachmentChip
// Width.test still pins this literal because the width-contract guards
// (w-44 / min-w-44 / max-w-44 / shrink-0 / overflow-hidden) live here.
const COMPACT_CHIP_LAYOUT = "group/img relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col justify-between overflow-hidden px-2.5 py-2 text-left transition-colors";
// Wide-variant alias preserved for downstream width-contract callers.
const WIDE_CHIP_LAYOUT = COMPACT_CHIP_LAYOUT;

export function AttachmentChip({
  attachment,
  variant: _variant,
  isOptimistic,
  loading = false,
  loadingLabel = "Opening preview…",
  onClick,
  affordance = "none",
  affordanceName,
  meta,
  summary,
  icon: _icon,
}: AttachmentChipProps) {
  const disabled = isOptimistic || loading || !onClick;
  // Per-state bg overrides PreviewShell's default `bg-white` via Tailwind's
  // important modifier. Normal state inherits `hover:bg-black/5` from
  // PreviewShell (no active token — press inherits hover). Loading uses a
  // solid yellow tint without any opacity modifier so it sidesteps the
  // Chromium `color-mix(in oklab, …, transparent)` × element-opacity
  // cyan-rendering edge case; the loading bar + spinner remain the dominant
  // busy signal regardless.
  const stateClassName = isOptimistic
    ? "opacity-70"
    : loading
      ? "!bg-brutal-yellow/30 cursor-wait"
      : "";
  // Single canonical affordance position: bottom-right, no border, the icon
  // alone signals action (Eye = previewable, Download = downloadable). Always
  // visible — no longer hover-only — so chips read uniformly regardless of
  // the user's cursor.
  const affordanceClassName = "absolute bottom-1.5 right-1.5 flex items-center justify-center text-black/60 group-hover/img:text-black";
  const loadingBar = (
    <div
      data-message-affordance="attachment-preview-loading"
      className="absolute inset-x-0 bottom-0 flex h-6 items-center gap-1.5 border-t-2 border-black bg-brutal-yellow px-2 text-[10px] font-bold uppercase tracking-wide text-black"
    >
      <Spinner size="xs" />
      <span className="truncate">{loadingLabel}</span>
    </div>
  );

  return (
    <PreviewShell
      onClick={disabled ? undefined : onClick}
      aria-busy={loading ? "true" : undefined}
      title={attachment.filename}
      className={`${COMPACT_CHIP_LAYOUT}${stateClassName ? ` ${stateClassName}` : ""}`}
    >
      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <div className="block w-full max-w-full truncate text-xs font-bold text-black">{attachment.filename}</div>
        {meta ? <div className="mt-0.5 truncate text-[10px] text-black/45">{meta}</div> : null}
      </div>
      {summary ? (
        <div className="flex items-center gap-1.5 pr-5 font-mono text-[10px] font-bold tracking-[-0.04em] whitespace-nowrap">
          {summary}
        </div>
      ) : null}
      {loading ? loadingBar : isOptimistic ? (
        <Spinner size="sm" className="absolute bottom-2 right-2" />
      ) : affordance === "download" ? (
        <div
          data-message-affordance={affordanceName ?? "file-download"}
          className={affordanceClassName}
        >
          <Download size={12} />
        </div>
      ) : affordance === "preview" ? (
        <div
          data-message-affordance={affordanceName ?? "file-preview"}
          className={affordanceClassName}
        >
          <Eye size={12} />
        </div>
      ) : null}
    </PreviewShell>
  );
}

export const ATTACHMENT_CHIP_CLASS_CONTRACT = {
  compact: COMPACT_CHIP_LAYOUT,
  wide: WIDE_CHIP_LAYOUT,
};
