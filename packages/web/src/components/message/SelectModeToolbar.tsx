import { X, Download, Copy, Check } from "lucide-react";
import { useSelectionStore } from "../../store/selectionStore";
import Spinner from "../ui/Spinner";

/**
 * X (formerly Twitter) brand mark. Lucide ships the legacy bird; the
 * X rebrand uses an asymmetric serif-X. Inline SVG keeps it sharp at
 * any size without adding a dependency.
 */
function XBrandIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export interface SelectModeToolbarProps {
  /** Channel id this toolbar is mounted under. Renders only when select mode is scoped here. */
  channelId: string;
  /** Click handler for the Save-as-pic button. Disabled when 0 selected. */
  onSavePic: () => void;
  /** Click handler for the Share-to-X button. Disabled when 0 selected. */
  onShareX: () => void;
  /** Click handler for the Copy-MD button. Disabled when 0 selected. */
  onCopyMd: () => void;
  /** Optional thread-mode affordance for selecting parent + all replies. */
  onSelectAll?: () => void;
  /** True while the screenshot is being rendered (Save-as-pic OR Share-to-X). */
  capturing?: boolean;
  /** True for ~1.5s after Copy MD succeeds, swaps the icon for a check. */
  copied?: boolean;
}

/**
 * Bottom sticky toolbar shown while multi-select mode is active in a channel.
 * Layout: [Cancel] [Save as pic] [Share to X] [Copy MD]
 *
 * All three actions share the same selection set; Save and Share both go
 * through the screenshot pipeline, Copy serialises selection to markdown.
 */
export default function SelectModeToolbar({
  channelId,
  onSavePic,
  onShareX,
  onCopyMd,
  onSelectAll,
  capturing = false,
  copied = false,
}: SelectModeToolbarProps) {
  const isActive = useSelectionStore((s) => s.isActive);
  const selectionChannelId = useSelectionStore((s) => s.channelId);
  const count = useSelectionStore((s) => s.selectedIds.size);
  const exit = useSelectionStore((s) => s.exit);

  if (!isActive || selectionChannelId !== channelId) return null;

  const canAct = count > 0 && !capturing;

  // Narrow viewports collapse the action labels to icon-only so the four
  // buttons stay on one line. The label still ships as `aria-label` for
  // a11y + native tooltip on hover/long-press. Per huxijin's 2026-04-28
  // feedback ("文字折行，体验不好").
  return (
    <div
      className="border-t-2 border-black bg-brutal-yellow safe-bottom"
      data-testid="select-mode-toolbar"
    >
      <div className="flex items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-3">
        <span
          className="font-mono text-xs font-bold text-black/70 whitespace-nowrap"
          data-testid="select-mode-count"
        >
          {count}
          <span className="hidden sm:inline"> selected</span>
        </span>
        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          {onSelectAll && (
            <button
              type="button"
              onClick={onSelectAll}
              disabled={capturing}
              aria-label="Select All"
              title="Select All"
              className="btn-brutal-sm bg-white px-1.5 py-1 text-xs flex items-center gap-1 whitespace-nowrap sm:px-2"
              data-testid="select-mode-select-all"
            >
              Select All
            </button>
          )}
          <button
            type="button"
            onClick={exit}
            aria-label="Cancel"
            title="Cancel"
            className="btn-brutal-sm bg-white px-1.5 py-1 text-xs flex items-center gap-1 whitespace-nowrap sm:px-2"
            data-testid="select-mode-cancel"
          >
            <X size={14} />
            <span className="hidden sm:inline">Cancel</span>
          </button>
          <button
            type="button"
            onClick={onSavePic}
            disabled={!canAct}
            aria-label="Download as Image"
            title="Download as Image"
            className="btn-brutal-sm bg-brutal-pink px-1.5 py-1 text-xs flex items-center gap-1 whitespace-nowrap sm:px-2"
            data-testid="select-mode-save-pic"
          >
            {capturing ? <Spinner size="sm" /> : <Download size={14} />}
            <span className="hidden sm:inline">{capturing ? "Rendering…" : "Download as Image"}</span>
          </button>
          {/* Share to X is hidden until we ship "share with image" — Twitter
              Web Intent has no native image-attach so the current text+url
              flow doesn't actually carry the screenshot. The handlers stay
              wired so we can re-enable behind a flag once the OG-image /
              navigator.share fallback path lands. huxijin 2026-05-02
              #proj-mobile:fd343bd8 254b9148: "既然我们没有思考好 x 图片
              如何带上，我们先把 share to x 入口（web and mobile）在前端
              隐藏起来". */}
          {false && (
          <button
            type="button"
            onClick={onShareX}
            disabled={!canAct}
            aria-label="Share to X"
            title="Share to X"
            className="btn-brutal-sm bg-white px-1.5 py-1 text-xs flex items-center gap-1 whitespace-nowrap sm:px-2"
            data-testid="select-mode-share-x"
          >
            <XBrandIcon size={14} />
            <span className="hidden sm:inline">Share to X</span>
          </button>
          )}
          <button
            type="button"
            onClick={onCopyMd}
            disabled={count === 0}
            aria-label="Copy as Markdown"
            title="Copy as Markdown"
            className="btn-brutal-sm bg-white px-1.5 py-1 text-xs flex items-center gap-1 whitespace-nowrap sm:px-2"
            data-testid="select-mode-copy-md"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy MD"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
