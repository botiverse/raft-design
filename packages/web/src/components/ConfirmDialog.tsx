import { useState } from "react";
import { X } from "lucide-react";
import Modal from "./Modal";
import Banner from "./ui/Banner";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  loadingLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  /** Override the confirm button color (default: "bg-brutal-red" for destructive actions) */
  confirmColor?: string;
  /** Modal stacking layer (0 = default z-50, 1 = z-[60] for nested dialogs) */
  layer?: number;
  /** Optional test id for the confirm button (e2e selection) */
  confirmTestId?: string;
}

/**
 * Unified confirmation dialog for destructive actions.
 * Shows a modal with a warning, message, and Cancel / Confirm buttons.
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  loadingLabel,
  onConfirm,
  onClose,
  confirmColor,
  layer,
  confirmTestId,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setLoading(false);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || (err instanceof Error ? err.message : "Something went wrong"));
    }
  };

  return (
    <Modal onClose={onClose} layer={layer}>
      <div className="w-full max-w-sm card-brutal p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="btn-brutal-sm bg-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning panel — destructive context picks up the destructive
            colour (red), non-destructive overrides (e.g. logout / leave
            channel / cancel subscription) keep the warning orange.
            withIcon: this surface always had an AlertTriangle. */}
        <Banner
          intent={confirmColor ? "warning" : "destructive"}
          withIcon
          className="mb-5"
        >
          {message}
        </Banner>

        {/* Error */}
        {error && (
          <Banner intent="warning" className="mb-4">
            {error}
          </Banner>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-brutal bg-white px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid={confirmTestId}
            onClick={handleConfirm}
            disabled={loading}
            className={`btn-brutal ${confirmColor || "bg-brutal-red"} px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (loadingLabel || "Processing…") : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
