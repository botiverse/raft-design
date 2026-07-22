import { SYSTEM_MESSAGE_FIXTURES } from "./system-message.fixtures.ts";

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
  return (
    <div className="mb-1 flex min-w-0 items-center justify-center gap-2 px-2 py-1.5">
      <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">{time}</span>
      <span className="min-w-0 truncate text-xs text-black/50" title={title ?? content}>
        {content}
      </span>
    </div>
  );
}

export function SourceSystemMessageChannelArchive() {
  return <SourceSystemMessageRow content={SYSTEM_MESSAGE_FIXTURES.channelArchive.content} />;
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
  const summary = "There are 3 system updates: 2 task updates, 1 system message";
  return (
    <div className="mb-1 w-full max-w-3xl">
      <div className="flex justify-center py-1.5">
        <button
          type="button"
          disabled
          className="group flex max-w-full cursor-default items-center gap-1.5 px-2 py-1 text-xs text-black/50"
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
            content={SYSTEM_MESSAGE_FIXTURES.channelRename.content}
            time="2:20 PM"
          />
        </div>
      ) : null}
    </div>
  );
}
