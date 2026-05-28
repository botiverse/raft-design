import { useEffect, useState } from "react";
import { ArrowLeft, FileText, X } from "lucide-react";
import { useResizablePanel } from "../../hooks/useResizablePanel";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import { useLegacyTaskPanelStore } from "../../store/legacyTaskPanelStore";
import type { TaskStatus } from "../../store/taskStore";
import Button from "../ui/Button";

// Mirrors `STATUS_STYLES` in `task/taskStatusUi.ts` — Title Case labels +
// `closed` uses `bg-brutal-stone` (terminal-state token), NOT `bg-brutal-red`.
// Red is reserved for destructive irreversible actions; closed is a
// reversible terminal state. Status indicators don't get the brutal
// uppercase transform here either — see `taskStatusUi.STATUS_STYLES`
// rationale (stdrc msg=ce25da45 + msg=65681d15).
const STATUS_STYLES: Record<TaskStatus, { bg: string; label: string }> = {
  todo: { bg: "bg-brutal-orange", label: "Todo" },
  in_progress: { bg: "bg-brutal-cyan", label: "In Progress" },
  in_review: { bg: "bg-brutal-lavender", label: "In Review" },
  done: { bg: "bg-brutal-lime", label: "Done" },
  closed: { bg: "bg-brutal-stone", label: "Closed" },
};

export default function LegacyTaskPanel({ presentation = "side" }: { presentation?: "side" | "modal" | "mobile-modal" }) {
  const task = useLegacyTaskPanelStore((s) => s.task);
  const closeLegacyTask = useLegacyTaskPanelStore((s) => s.closeLegacyTask);
  const { formatShortDateTime } = useTimeFormatter();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );
  const { width, handleResizeStart, handleResizeMove, handleResizeEnd } = useResizablePanel({
    storageKey: "slock:legacyTaskPanelWidth",
    min: 320,
    max: 560,
    defaultWidth: 380,
    direction: "left",
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLegacyTask();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeLegacyTask]);

  if (!task) return null;

  const status = STATUS_STYLES[task.status];
  // Three presentations (mirror ThreadPanel):
  //   side          — current right-column on desktop, full-screen overlay on mobile.
  //   modal         — bounded centered card, used inside <Modal> on desktop tasks-route.
  //   mobile-modal  — full-screen overlay on mobile tasks-route with X close visible,
  //                   per stdrc 2026-05-20 #proj-task:287f18ce.
  const panelClassName = presentation === "modal"
    ? "flex h-[min(78vh,720px)] max-h-[calc(100vh-2rem)] w-[min(760px,calc(100vw-2rem))] flex-col overflow-hidden border-2 border-black bg-white shadow-brutal"
    : presentation === "mobile-modal"
    ? "absolute inset-0 z-30 flex flex-col bg-white"
    : "absolute inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto lg:border-l-2 lg:border-black";
  const panelStyle = presentation === "side" && isDesktop ? { width } : undefined;
  const showResizeHandle = presentation === "side";
  // X close button visibility (mirrors ThreadPanel) per stdrc 2026-05-21
  // #proj-task:287f18ce msg=804c045d:
  //   modal        — X (centered card with backdrop, X is the dialog close)
  //   mobile-modal — NO X (full-screen overlay, back chevron handles close)
  //   side         — X on desktop (lg+) only; mobile uses back chevron
  const closeButtonClassName = presentation === "modal"
    ? "btn-brutal-sm flex size-7 items-center justify-center bg-white"
    : "btn-brutal-sm hidden size-7 items-center justify-center bg-white lg:flex";

  return (
    <div
      data-testid="legacy-task-panel"
      className={panelClassName}
      style={panelStyle}
    >
      {showResizeHandle && (
        <div
          className="hidden md:block absolute left-0 top-0 bottom-0 w-2 -ml-1 z-10 cursor-col-resize select-none"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        />
      )}

      <div data-testid="legacy-task-panel-header" className="flex h-panel-header items-center gap-3 border-b-2 border-black bg-white px-5">
        <Button
          type="button"
          onClick={closeLegacyTask}
          shape="icon"
          // In modal / mobile-modal the back chevron is the close affordance,
          // so it should hide at md+ (centered card with Rail). In side
          // presentation it stays through to lg-.
          className={presentation === "side" ? "lg:hidden" : "md:hidden"}
        >
          <ArrowLeft size={14} />
        </Button>
        <div className="flex size-icon-header shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow text-black">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold text-black text-base">
            #{task.channelName || "unknown"}
          </h2>
          <p className="text-xs text-black/50 font-mono">Task #{task.taskNumber} · LEGACY</p>
        </div>
        {/*
          X close button (mirrors ThreadPanel).
          - modal: visible (centered dialog close affordance)
          - mobile-modal: NO X (back chevron is the close)
          - side: visible on desktop only
          Per stdrc 2026-05-21 #proj-task:287f18ce msg=804c045d.
        */}
        {presentation !== "mobile-modal" && (
          <button
            type="button"
            onClick={closeLegacyTask}
            className={closeButtonClassName}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-5 py-4 space-y-4 safe-bottom">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`shrink-0 border border-black px-1 py-0.5 text-[10px] font-bold leading-none ${status.bg}`}>
            {status.label}
          </span>
        </div>

        <section className="card-brutal bg-white p-4 space-y-3">
          <div>
            <p className="text-xs font-mono text-black/40 mb-1">Title</p>
            <h3 className="text-lg font-bold break-words">{task.title}</h3>
          </div>
          <div>
            <p className="text-xs font-mono text-black/40 mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap break-words text-black/80">
              {task.description?.trim() || "No description"}
            </p>
          </div>
        </section>

        <section className="card-brutal bg-white p-4 space-y-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="text-black/50 font-mono">Created by</span>
            <span className="text-right">@{task.createdByName || "Unknown"}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-black/50 font-mono">Created at</span>
            <span className="text-right">{formatShortDateTime(task.createdAt) || "Unknown"}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-black/50 font-mono">Assignee</span>
            <span className="text-right">{task.claimedByName ? `@${task.claimedByName}` : "Unassigned"}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-black/50 font-mono">Completed</span>
            <span className="text-right">{formatShortDateTime(task.completedAt) || "Not done"}</span>
          </div>
        </section>

        <section className="border-2 border-black bg-brutal-yellow/30 shadow-brutal-sm p-4">
          <p className="text-sm font-bold">Read-only panel</p>
          <p className="mt-1 text-sm text-black/70">
            Legacy tasks do not map to a message thread. This panel shows task metadata only, and posting is disabled.
          </p>
        </section>
      </div>
    </div>
  );
}
