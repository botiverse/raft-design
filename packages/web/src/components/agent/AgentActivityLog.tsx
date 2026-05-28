import { useCallback, useEffect, useRef, useState } from "react";
import { useAgentStore, type TrajectoryLogEntry } from "../../store/agentStore";
import StatusDot from "../ui/StatusDot";
import { getSocket } from "../../api/socket";
import { registerActivityTrajectoryReconnectReload } from "../../utils/activityTrajectoryRecovery";
import { getToolLogLabel, shouldHideToolStartInActivityLog, type AgentActivity } from "@slock-ai/shared";
import { Activity, ChevronRight } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import { RefText, ThreadRefNoticeProvider } from "./RefText";

const EMPTY_LOG: TrajectoryLogEntry[] = [];

function isVisibleTrajectoryEntry(item: TrajectoryLogEntry): boolean {
  return item.entry.kind !== "tool_start" || !shouldHideToolStartInActivityLog(item.entry.toolName);
}

const ACTIVITY_LABELS: Record<string, string> = {
  online: "Idle",
  thinking: "Thinking",
  working: "Working",
};

// "Stopped" is reserved for manual/reconcile-driven stops. Other offline causes
// (machine disconnect, crash, unknown) show their own labels so a transient
// disconnect doesn't look like a terminal state in the activity log.
function resolveOfflineLabel(detail: string): string {
  if (detail === "Stopped") return "Stopped";
  if (detail === "Machine disconnected") return "Disconnected";
  if (detail.startsWith("Crashed")) return "Crashed";
  return "Offline";
}

function resolveStatusDisplay(activity: AgentActivity, detail: string): { primary: string; secondary: string } {
  if (activity === "working" && detail === "Starting\u2026") {
    return { primary: "Starting", secondary: "" };
  }

  if (activity === "offline") {
    const primary = resolveOfflineLabel(detail);
    // For offline, the label already encodes the cause, so detail would just duplicate.
    // Exception: "Crashed (…)" carries extra error info worth surfacing.
    return {
      primary,
      secondary: primary === "Crashed" ? detail.replace(/^Crashed\s*/, "").replace(/^\((.*)\)$/, "$1") : "",
    };
  }

  return { primary: ACTIVITY_LABELS[activity] || activity, secondary: detail };
}

type FormatTimestamp = (timestamp: number) => string;

function ThinkingEntry({ text, timestamp, formatTimestamp }: { text: string; timestamp: number; formatTimestamp: FormatTimestamp }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <div className="flex items-start gap-2 py-1.5 px-3 hover:bg-black/5 transition-colors">
      <span className="shrink-0 font-mono text-xs text-black/40 mt-0.5 whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </span>
      <StatusDot size="sm" tone="bg-brutal-yellow" pulse className="mt-1.5" />
      <div className="text-sm min-w-0 flex-1">
        <button
          type="button"
          onClick={() => isLong && setExpanded(!expanded)}
          className={`flex items-center gap-1 font-medium text-black ${isLong ? "hover:text-black/70" : "cursor-default"}`}
        >
          Thinking
          {isLong && (
            <ChevronRight
              size={12}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          )}
        </button>
        <p
          className={`text-black/50 text-xs font-mono mt-0.5 whitespace-pre-wrap break-words ${
            !expanded && isLong ? "line-clamp-2" : ""
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function ToolStartEntry({ toolName, toolInput, timestamp, formatTimestamp }: { toolName: string; toolInput: string; timestamp: number; formatTimestamp: FormatTimestamp }) {
  return (
    <div className="flex items-start gap-2 py-1.5 px-3 hover:bg-black/5 transition-colors">
      <span className="shrink-0 font-mono text-xs text-black/40 mt-0.5 whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </span>
      <StatusDot size="sm" tone="bg-brutal-yellow" className="mt-1.5" />
      <div className="min-w-0 flex-1 text-sm">
        <span className="font-medium text-black">{getToolLogLabel(toolName)}</span>
        {toolInput && (
          <span className="text-black/50 ml-1.5 font-mono text-xs break-all">{toolInput}</span>
        )}
      </div>
    </div>
  );
}

function TextEntry({ text, timestamp, formatTimestamp }: { text: string; timestamp: number; formatTimestamp: FormatTimestamp }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <div className="flex items-start gap-2 py-1.5 px-3 hover:bg-black/5 transition-colors">
      <span className="shrink-0 font-mono text-xs text-black/40 mt-0.5 whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </span>
      <StatusDot size="sm" tone="bg-brutal-cyan" className="mt-1.5" />
      <div className="text-sm min-w-0 flex-1">
        <button
          type="button"
          onClick={() => isLong && setExpanded(!expanded)}
          className={`flex items-center gap-1 font-medium text-black ${isLong ? "hover:text-black/70" : "cursor-default"}`}
        >
          Output
          {isLong && (
            <ChevronRight
              size={12}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          )}
        </button>
        <p
          className={`text-black/50 text-xs font-mono mt-0.5 whitespace-pre-wrap break-words ${
            !expanded && isLong ? "line-clamp-2" : ""
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function SystemEntry({ title, text, timestamp, formatTimestamp }: { title: string; text: string; timestamp: number; formatTimestamp: FormatTimestamp }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <div className="flex items-start gap-2 py-1.5 px-3 hover:bg-black/5 transition-colors">
      <span className="shrink-0 font-mono text-xs text-black/40 mt-0.5 whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </span>
      <StatusDot size="sm" tone="bg-brutal-orange" className="mt-1.5" />
      <div className="text-sm min-w-0 flex-1">
        <button
          type="button"
          onClick={() => isLong && setExpanded(!expanded)}
          className={`flex items-center gap-1 font-medium text-black ${isLong ? "hover:text-black/70" : "cursor-default"}`}
        >
          {title}
          {isLong && (
            <ChevronRight
              size={12}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          )}
        </button>
        <p
          className={`text-black/50 text-xs font-mono mt-0.5 whitespace-pre-wrap break-words ${
            !expanded && isLong ? "line-clamp-2" : ""
          }`}
        >
          <RefText text={text} />
        </p>
      </div>
    </div>
  );
}

function SlockActionEntry({ title, text, timestamp, formatTimestamp }: { title: string; text: string; timestamp: number; formatTimestamp: FormatTimestamp }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <div className="flex items-start gap-2 py-1.5 px-3 hover:bg-black/5 transition-colors">
      <span className="shrink-0 font-mono text-xs text-black/40 mt-0.5 whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </span>
      <StatusDot size="sm" tone="bg-blue-300" className="mt-1.5" />
      <div className="text-sm min-w-0 flex-1">
        <button
          type="button"
          onClick={() => isLong && setExpanded(!expanded)}
          className={`flex items-center gap-1 font-medium text-black ${isLong ? "hover:text-black/70" : "cursor-default"}`}
        >
          {title}
          {isLong && (
            <ChevronRight
              size={12}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          )}
        </button>
        <p
          className={`text-black/50 text-xs font-mono mt-0.5 whitespace-pre-wrap break-words ${
            !expanded && isLong ? "line-clamp-2" : ""
          }`}
        >
          {/* Ref linkification is scoped to the structured-metadata entry
              kinds — SlockAction (slock-cli target: #channel:shortid …),
              System, and Status — where a #channel / thread / dm token is a
              real navigation target. NOT Output/Thinking/Tool: those are
              free-form agent text where #x is incidental and linkifying it
              is noise. task #266 follow-up, xxchan #proj-uiux:2921feaf. */}
          <RefText text={text} />
        </p>
      </div>
    </div>
  );
}

function StatusEntry({ activity, detail, timestamp, formatTimestamp }: { activity: AgentActivity; detail: string; timestamp: number; formatTimestamp: FormatTimestamp }) {
  const { primary, secondary } = resolveStatusDisplay(activity, detail);
  return (
    <div className="flex items-start gap-2 py-1 px-3 hover:bg-black/5 transition-colors">
      <span className="shrink-0 font-mono text-xs text-black/40 mt-0.5 whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </span>
      <StatusDot size="sm" activity={activity} className="mt-1.5" />
      <span className="min-w-0 flex-1 text-sm text-black">
        <span className="font-medium">{primary}</span>
        {secondary && (
          <span className="ml-1.5 break-words text-black/60">
            <RefText text={secondary} />
          </span>
        )}
      </span>
    </div>
  );
}

function CompactionEntry({ phase, timestamp, formatTimestamp }: { phase: "started" | "finished"; timestamp: number; formatTimestamp: FormatTimestamp }) {
  const isStarted = phase === "started";

  return (
    <div className="flex items-start gap-2 py-1.5 px-3 hover:bg-black/5 transition-colors">
      <span className="shrink-0 font-mono text-xs text-black/40 mt-0.5 whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </span>
      <StatusDot
        size="sm"
        tone={isStarted ? "bg-brutal-orange" : "bg-brutal-lime"}
        className="mt-1.5"
      />
      <span className="text-sm text-black font-medium">
        {isStarted ? "Context Compaction Started" : "Context Compaction Finished"}
      </span>
    </div>
  );
}

function TrajectoryItem({ item, formatTimestamp }: { item: TrajectoryLogEntry; formatTimestamp: FormatTimestamp }) {
  const { entry, timestamp } = item;

  switch (entry.kind) {
    case "thinking":
      return <ThinkingEntry text={entry.text} timestamp={timestamp} formatTimestamp={formatTimestamp} />;
    case "tool_start":
      return <ToolStartEntry toolName={entry.toolName} toolInput={entry.toolInput} timestamp={timestamp} formatTimestamp={formatTimestamp} />;
    case "text":
      return <TextEntry text={entry.text} timestamp={timestamp} formatTimestamp={formatTimestamp} />;
    case "slock_action":
      return <SlockActionEntry title={entry.title} text={entry.text} timestamp={timestamp} formatTimestamp={formatTimestamp} />;
    case "system":
      return <SystemEntry title={entry.title} text={entry.text} timestamp={timestamp} formatTimestamp={formatTimestamp} />;
    case "compaction_started":
      return <CompactionEntry phase="started" timestamp={timestamp} formatTimestamp={formatTimestamp} />;
    case "compaction_finished":
      return <CompactionEntry phase="finished" timestamp={timestamp} formatTimestamp={formatTimestamp} />;
    case "status":
      return <StatusEntry activity={entry.activity} detail={entry.detail} timestamp={timestamp} formatTimestamp={formatTimestamp} />;
  }
}

export default function AgentActivityLog({ agentId }: { agentId: string }) {
  const log = useAgentStore((s) => s.trajectoryLogs[agentId] ?? EMPTY_LOG);
  const visibleLog = log.filter(isVisibleTrajectoryEntry);
  const loadTrajectoryLog = useAgentStore((s) => s.loadTrajectoryLog);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { formatClockWithSeconds } = useTimeFormatter();
  const formatTimestamp = (timestamp: number) => formatClockWithSeconds(timestamp).toUpperCase();

  // Ephemeral notice when a (legitimate) thread ref can't be resolved at
  // click time — mirrors MessageItem's threadRefNotice behaviour.
  const [threadRefNotice, setThreadRefNotice] = useState<string | null>(null);
  const threadRefNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showThreadRefNotice = useCallback((message: string) => {
    if (threadRefNoticeTimerRef.current) clearTimeout(threadRefNoticeTimerRef.current);
    setThreadRefNotice(message);
    threadRefNoticeTimerRef.current = setTimeout(() => {
      setThreadRefNotice(null);
      threadRefNoticeTimerRef.current = null;
    }, 4000);
  }, []);
  useEffect(() => () => {
    if (threadRefNoticeTimerRef.current) clearTimeout(threadRefNoticeTimerRef.current);
  }, []);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [log.length]);

  useEffect(() => {
    void loadTrajectoryLog(agentId);
  }, [agentId, loadTrajectoryLog]);

  useEffect(() => {
    const socket = getSocket();
    return registerActivityTrajectoryReconnectReload({
      socket,
      agentId,
      loadTrajectoryLog,
    });
  }, [agentId, loadTrajectoryLog]);

  if (visibleLog.length === 0) {
    return (
      <EmptyState
        className="flex flex-1 flex-col items-center justify-center bg-white"
        icon={<Activity size={36} />}
        title="No activity yet"
        description="Start the agent to see its activity log."
      />
    );
  }

  return (
    <ThreadRefNoticeProvider onNotice={showThreadRefNotice}>
      <div className="flex flex-1 flex-col min-h-0 bg-white">
        <div className="flex-1 overflow-y-auto py-2">
          {visibleLog.map((item, i) => (
            <TrajectoryItem key={`${item.timestamp}-${i}`} item={item} formatTimestamp={formatTimestamp} />
          ))}
          <div ref={bottomRef} />
        </div>
        {threadRefNotice ? (
          <div className="shrink-0 border-t-2 border-black bg-brutal-orange/20 px-3 py-1.5 text-xs font-mono text-black">
            {threadRefNotice}
          </div>
        ) : null}
      </div>
    </ThreadRefNoticeProvider>
  );
}
