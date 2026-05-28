import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useTaskStore } from "../../store/taskStore";
import Modal from "../Modal";
import Banner from "../ui/Banner";

export default function CreateTaskDialog({
  channelId,
  onClose,
}: {
  channelId: string;
  onClose: () => void;
}) {
  const [titles, setTitles] = useState<string[]>([""]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createTasks = useTaskStore((s) => s.createTasks);

  const isBatch = titles.length > 1;

  const updateTitle = (index: number, value: string) => {
    setTitles((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const addRow = () => {
    setTitles((prev) => [...prev, ""]);
  };

  const removeRow = (index: number) => {
    setTitles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nonEmpty = titles.map((t) => t.trim()).filter(Boolean);
    if (nonEmpty.length === 0) {
      setError("At least one task title is required");
      return;
    }

    setSubmitting(true);
    try {
      await createTasks(channelId, nonEmpty);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md card-brutal p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">
            {isBatch ? "Create Tasks" : "Create Task"}
          </h2>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Banner intent="warning" className="font-bold">
              {error}
            </Banner>
          )}

          <div>
            {titles.map((title, i) => (
              <div key={i} className="flex items-center gap-1 mb-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateTitle(i, e.target.value)}
                  className="input-brutal w-full"
                  placeholder={`Task ${i + 1}`}
                  autoFocus={i === 0}
                />
                {titles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="btn-brutal-sm p-1 bg-white"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="btn-brutal-sm px-2 py-1 text-xs font-bold flex items-center gap-1 bg-white mt-3"
            >
              <Plus size={12} />
              Add Another
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-brutal bg-white px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-brutal bg-brutal-pink px-4 py-2 text-sm"
            >
              {submitting
                ? "Creating…"
                : isBatch
                  ? `Create ${titles.filter((t) => t.trim()).length} Tasks`
                  : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
