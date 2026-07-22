import type { ReactNode } from "react";

import {
  SYSTEM_MESSAGE_FIXTURE_NOW,
  SYSTEM_MESSAGE_FIXTURES,
  SYSTEM_MESSAGE_REMINDER_FIRE_AT,
} from "./system-message.fixtures.ts";

function formatRelativeReminderTime(iso: string, now: Date) {
  const target = new Date(iso);
  const diffMs = target.getTime() - now.getTime();
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (hours === 8) return "in 8 hours";
  if (hours > 0) return `in ${hours} hours`;
  return target.toLocaleString();
}

/** Source-faithful centered system row from MessageItem early-return. */
export function SourceSystemMessageRow({
  content,
  time = "2:16 PM",
  title,
}: {
  content: string;
  time?: string;
  title?: string;
}) {
  const fireAtMatch = content.match(/data-reminder-fire-at="([^"]+)"/);
  const fireAt = fireAtMatch?.[1];
  let body: ReactNode = content;

  if (fireAt) {
    const before = content.slice(0, content.indexOf("<span"));
    body = (
      <>
        {before}
        <span title={`Reminder fires ${new Date(fireAt).toLocaleString()}`}>
          {formatRelativeReminderTime(fireAt, SYSTEM_MESSAGE_FIXTURE_NOW)}
        </span>
      </>
    );
  }

  return (
    <div className="mb-1 flex min-w-0 items-center justify-center gap-2 px-2 py-1.5">
      <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">{time}</span>
      <span className="min-w-0 truncate text-xs text-black/50" title={title ?? content}>
        {body}
      </span>
    </div>
  );
}

export function SourceSystemMessageChannelArchive() {
  return <SourceSystemMessageRow content={SYSTEM_MESSAGE_FIXTURES.channelArchive.content} />;
}

export function SourceSystemMessageReminderScheduled() {
  return (
    <SourceSystemMessageRow
      content={SYSTEM_MESSAGE_FIXTURES.reminderScheduled.content}
      time="2:17 PM"
      title={`@Atlas scheduled a reminder: "Ship the docs cut" — fires ${new Date(SYSTEM_MESSAGE_REMINDER_FIRE_AT).toLocaleString()}`}
    />
  );
}

export function SourceSystemMessageTaskMovedDone() {
  return (
    <SourceSystemMessageRow
      content={SYSTEM_MESSAGE_FIXTURES.taskMovedDone.content}
      time="2:18 PM"
    />
  );
}

export function SourceSystemMessageGroupedUpdates({ expanded = false }: { expanded?: boolean }) {
  const summary = "There are 2 task updates, 1 reminder update";
  return (
    <div className="mb-1 w-full max-w-3xl">
      <div className="flex justify-center py-1.5">
        <button
          type="button"
          className="group flex max-w-full items-center gap-1.5 px-2 py-1 text-xs text-black/50 hover:text-black/75"
          aria-expanded={expanded}
          title={summary}
        >
          <span className="truncate">{summary}</span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={`size-3 shrink-0 text-black/35 transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`}
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 18 6-6-6-6"
            />
          </svg>
        </button>
      </div>
      {expanded ? (
        <div>
          <SourceSystemMessageTaskMovedDone />
          <SourceSystemMessageRow
            content={SYSTEM_MESSAGE_FIXTURES.taskClaimed.content}
            time="2:19 PM"
          />
          <SourceSystemMessageRow
            content={SYSTEM_MESSAGE_FIXTURES.reminderFireNotice.content}
            time="2:20 PM"
          />
        </div>
      ) : null}
    </div>
  );
}
