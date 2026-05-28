import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "../Modal";
import Banner from "../ui/Banner";
import api from "../../api/client";

type Phase = "confirm" | "stopped" | "resuming";

export default function SOSDialog({
  channelId,
  channelName,
  onClose,
}: {
  channelId: string;
  channelName: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [stopping, setStopping] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [guidance, setGuidance] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (phase === "stopped" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase]);

  const handleStop = async () => {
    setStopping(true);
    try {
      await api.post(`/channels/${channelId}/stop-all-agents`);
      setPhase("stopped");
    } catch {
      // stay on confirm phase
    } finally {
      setStopping(false);
    }
  };

  const handleResume = async () => {
    if (!guidance.trim()) return;
    setResuming(true);
    try {
      const prompt = `[SOS] The user has emergency-stopped all agents in #${channelName} because they were going off-track. Here is the user's correction and new guidance:\n\n${guidance.trim()}\n\nRead this carefully, acknowledge the correction, and adjust your approach accordingly. Use check_messages and read_history to understand the current state before taking any action.`;
      await api.post(`/channels/${channelId}/resume-all-agents`, { prompt });
      onClose();
    } catch {
      setResuming(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-sm card-brutal p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">
            {phase === "confirm" ? "Stop All Agents" : "Agents Stopped"}
          </h2>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
            <X size={20} />
          </button>
        </div>

        {phase === "confirm" && (
          <>
            {/* Warning */}
            <Banner intent="destructive" withIcon className="mb-5">
              This will immediately stop all running agents in <strong>#{channelName}</strong>.
              You can provide new guidance before resuming them.
            </Banner>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="btn-brutal bg-white px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleStop}
                disabled={stopping}
                className="btn-brutal bg-brutal-red px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stopping ? "Stopping…" : "Stop All Agents"}
              </button>
            </div>
          </>
        )}

        {(phase === "stopped" || phase === "resuming") && (
          <>
            <Banner intent="success" density="sm" className="mb-3 font-bold">
              All agents have been stopped.
            </Banner>
            <p className="mb-2 text-sm">
              Provide new guidance or corrections. All agents will see this when they resume.
            </p>
            <textarea
              ref={textareaRef}
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              placeholder="e.g. Stop modifying the database schema — focus only on the frontend changes I described…"
              className="input-brutal mb-4 w-full resize-none p-3 text-sm"
              rows={4}
              disabled={resuming}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="btn-brutal bg-white px-4 py-2 text-sm"
                disabled={resuming}
              >
                Keep Stopped
              </button>
              <button
                onClick={handleResume}
                disabled={!guidance.trim() || resuming}
                className="btn-brutal bg-brutal-lime px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resuming ? "Resuming…" : "Resume All"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
