import { ChevronUp, Lock } from "lucide-react";
import { getHistoryTopState } from "../../utils/historyTopState";

export default function HistoryTopState({
  hasMore,
  historyLimited,
  loadingOlder,
  onLoadOlder,
  noun,
}: {
  hasMore: boolean;
  historyLimited: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
  noun: string;
}) {
  const state = getHistoryTopState({ hasMore, historyLimited });

  if (state === "load_older") {
    // While auto-loading, show plain text — it's not an action the user needs
    // to take. Only render the button when idle, as a fallback for when auto-
    // load hasn't triggered.
    if (loadingOlder) {
      return (
        <div className="pb-2 text-center text-black/50 font-mono text-xs">
          Loading older {noun}...
        </div>
      );
    }
    return (
      <div className="pb-2 text-center">
        <button
          type="button"
          onClick={onLoadOlder}
          className="btn-brutal-sm bg-white px-3 py-1 text-xs font-bold"
        >
          <span className="inline-flex items-center gap-1.5">
            <ChevronUp size={12} />
            Load Older {noun}
          </span>
        </button>
      </div>
    );
  }

  if (state === "history_limited") {
    return (
      <div className="pb-2 text-center text-black/50 font-mono text-xs">
        <span className="inline-flex items-center gap-1.5 border border-black/20 bg-white/70 px-2 py-1">
          <Lock size={12} />
          Older {noun} are limited by the current plan
        </span>
      </div>
    );
  }

  return (
    <div className="pb-2 text-center text-black/40 font-mono text-xs">
      Beginning of {noun}
    </div>
  );
}
