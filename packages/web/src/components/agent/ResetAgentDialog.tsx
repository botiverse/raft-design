import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { useAgentStore } from "../../store/agentStore";
import Modal from "../Modal";
import Banner from "../ui/Banner";

type ResetMode = "restart" | "session" | "full";

export default function ResetAgentDialog({
  agentId,
  agentName,
  onClose,
}: {
  agentId: string;
  agentName: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<ResetMode>("restart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resetAgent = useAgentStore((s) => s.resetAgent);

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      await resetAgent(agentId, mode);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to reset agent");
      setLoading(false);
    }
  };

  const options: { mode: ResetMode; label: string; desc: string; color: string }[] = [
    {
      mode: "restart",
      label: "Restart",
      desc: "Stop and restart the agent process. Keeps the runtime session and workspace files.",
      color: "bg-brutal-cyan/20",
    },
    {
      mode: "session",
      label: "Reset Session & Restart",
      desc: "Clear the runtime session and restart. Workspace files (MEMORY.md, notes/) are preserved.",
      color: "bg-brutal-orange/20",
    },
    {
      mode: "full",
      label: "Full Reset & Restart",
      desc: "Clear the runtime session, delete all workspace files, and restart from scratch.",
      color: "bg-brutal-red/20",
    },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md card-brutal p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">Restart {agentName}</h2>
          <button
            onClick={onClose}
            className="btn-brutal-sm bg-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <Banner intent="warning" className="mb-4 font-bold">
            {error}
          </Banner>
        )}

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setMode(opt.mode)}
              className={`w-full text-left border-2 p-4 transition-colors ${
                mode === opt.mode
                  ? `border-black ${opt.color} shadow-brutal-sm`
                  : "border-black/30 hover:border-black"
              }`}
            >
              <div className="font-bold text-sm uppercase">{opt.label}</div>
              <p className="mt-1 text-xs text-black/60">{opt.desc}</p>
            </button>
          ))}
        </div>

        {mode === "full" && (
          <Banner intent="warning" density="sm" withIcon className="mt-3 font-bold">
            This will permanently delete all workspace files including MEMORY.md and notes/. This cannot be undone.
          </Banner>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-brutal bg-white px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className={`btn-brutal px-4 py-2 text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === "full" ? "bg-brutal-red" : mode === "session" ? "bg-brutal-orange" : "bg-brutal-cyan"
            }`}
          >
            <RotateCcw size={14} />
            {loading ? "Restarting…" : options.find((o) => o.mode === mode)!.label}
          </button>
        </div>
      </div>
    </Modal>
  );
}
