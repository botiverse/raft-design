import { Download, X } from "lucide-react";
import { downloadDataUrl } from "../../utils/selectScreenshot";
import Button from "../ui/Button";
import Lightbox from "../ui/Lightbox";

export interface SelectShareLightboxProps {
  /** The captured PNG, as a data URL. */
  dataUrl: string;
  /** Suggested filename when the user clicks Save. */
  filename?: string;
  /** Called when the user dismisses the preview (Cancel, X, ESC, backdrop). Selection should be preserved. */
  onClose: () => void;
  /** Called after a successful Save. Selection mode should exit here. Defaults to onClose if omitted. */
  onSaved?: () => void;
}

/**
 * Confirmation lightbox shown after the user clicks "Save as pic" on the
 * select-mode toolbar. The user reviews the rendered screenshot, then either
 * downloads it (Save) or cancels.
 */
export default function SelectShareLightbox({ dataUrl, filename = "slock-export.png", onClose, onSaved }: SelectShareLightboxProps) {
  return (
    <Lightbox
      onClose={onClose}
      zIndex={100}
      backdropClass="bg-black/60"
      className="flex items-center justify-center p-4"
      data-testid="select-share-lightbox"
    >
      <div
        className="card-brutal flex max-h-[90vh] w-full max-w-3xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-panel-header shrink-0 items-center justify-between border-b-2 border-black bg-white px-5">
          <h2 className="text-base font-bold text-black">Share preview</h2>
          <Button
            type="button"
            onClick={onClose}
            shape="icon"
            data-testid="select-share-lightbox-close"
          >
            <X size={14} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
          <img
            src={dataUrl}
            alt="Selected messages screenshot preview"
            className="mx-auto block max-w-full border-2 border-black shadow-brutal"
          />
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 border-t-2 border-black bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-brutal bg-white px-4 py-2 text-sm"
            data-testid="select-share-lightbox-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              downloadDataUrl(dataUrl, filename);
              (onSaved ?? onClose)();
            }}
            className="btn-brutal flex items-center gap-1.5 bg-brutal-pink px-4 py-2 text-sm"
            data-testid="select-share-lightbox-save"
          >
            <Download size={14} />
            Save image
          </button>
        </div>
      </div>
    </Lightbox>
  );
}
