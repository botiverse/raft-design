import {
  Activity,
  AtSign,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Hash,
  Inbox,
  MessageSquare,
  Search,
} from "lucide-react";
import {
  Avatar,
  Badge,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "raft-ui";
import type { ReactNode } from "react";

const rows = [
  {
    id: "design-review",
    kind: "thread",
    channel: "#design",
    title: "The activity card spacing is ready for a source-parity pass.",
    sender: "Mira",
    body: "I kept the original border, spacing, and selected treatment.",
    time: "2 minutes ago",
    unread: 3,
    mention: true,
    replies: 8,
  },
  {
    id: "samira",
    kind: "dm",
    channel: "Samira Khan",
    title: "Samira Khan",
    sender: "Samira",
    body: "The permissions review is complete. Please check the final note.",
    time: "18 minutes ago",
    unread: 1,
    mention: false,
  },
  {
    id: "roadmap",
    kind: "thread",
    channel: "#shared-roadmap",
    title: "Document the Activity composition boundary before implementation.",
    sender: "Spec Writer",
    body: "The UI package owns parts; Playground owns inbox workflow state.",
    time: "1 hour ago",
    unread: 0,
    mention: false,
    replies: 5,
  },
] as const;

export function ActivityV2SourcePreview() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white text-black" data-layout="wide">
      <div className="flex h-panel-header items-center gap-3 border-b-2 border-black bg-white px-5">
        <div className="hidden size-icon-header shrink-0 items-center justify-center border-2 border-black bg-soft-signal md:flex">
          <Activity size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-base font-bold leading-tight text-black">Activity</h2>
          </div>
          <p className="truncate font-mono text-xs text-black/50">
            Triage what needs your attention
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="scrollbar-quiet flex w-48 shrink-0 flex-col overflow-y-auto border-r-2 border-black bg-white p-3">
          <div className="flex flex-col gap-1">
            <SourceNavigationItem icon={<Inbox />} label="Active" count={5} active />
            <SourceNavigationItem icon={<Bookmark />} label="Saved" count={2} />
            <SourceNavigationItem icon={<CheckCircle2 />} label="Done" />
          </div>
          <div className="mb-1 mt-5 px-2 text-[10px] font-black uppercase tracking-widest text-black/40">
            Filters
          </div>
          <div className="flex flex-col gap-1">
            <SourceNavigationItem icon={<AtSign />} label="Mentions" />
          </div>
          <div className="mt-5 flex flex-col">
            <div className="mb-1 flex items-center gap-2 px-2">
              <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-black/40">
                DM &amp; Channels
              </span>
            </div>
            <SourceNavigationItem icon={<Hash />} label="design" count={2} />
            <SourceNavigationItem
              icon={<Avatar size="2xs" type="human" />}
              label="Samira Khan"
              count={1}
            />
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-nowrap items-center gap-2 border-b-2 border-black bg-white px-3 py-2.5">
            <div className="shrink-0">
              <SegmentedControl value="all" ariaLabel="Filter activity">
                <SegmentedControlItem value="all">
                  <SegmentedControlLabel>All</SegmentedControlLabel>
                </SegmentedControlItem>
                <SegmentedControlItem value="unread">
                  <SegmentedControlLabel>Unread</SegmentedControlLabel>
                </SegmentedControlItem>
              </SegmentedControl>
            </div>
            <div className="relative min-w-0 flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-black/45"
              />
              <input
                readOnly
                placeholder="Search activity"
                aria-label="Search activity"
                className="h-9 w-full border-2 border-black bg-white pl-8 pr-8 text-sm font-semibold outline-none focus:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]"
              />
            </div>
          </div>

          <div className="flex h-11 min-h-11 shrink-0 flex-nowrap items-center gap-2 border-b-2 border-black bg-black/[0.03] px-3 py-0">
            <button
              type="button"
              disabled
              className="btn-brutal-sm bg-white px-2 py-1 text-xs font-bold"
            >
              Select all
            </button>
            <button
              type="button"
              disabled
              className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] font-bold text-black/60 hover:text-black"
            >
              Newest to oldest
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="scrollbar-quiet safe-bottom relative flex-1 overflow-y-overlay bg-white p-3">
            <div className="flex flex-col gap-2">
              {rows.map((row) => (
                <SourceActivityRow key={row.id} row={row} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SourceNavigationItem({
  icon,
  label,
  count,
  active,
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      className={`flex w-full items-center gap-2 border-2 px-2.5 py-2 text-left text-xs font-bold transition-colors ${
        active
          ? "border-black bg-soft-signal shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]"
          : "border-transparent hover:border-black/30 hover:bg-black/5"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count === undefined ? null : (
        <span className="font-mono text-black/45">{count}</span>
      )}
    </button>
  );
}

function SourceActivityRow({ row }: { row: (typeof rows)[number] }) {
  const Icon = row.kind === "thread" ? MessageSquare : AtSign;
  return (
    <button
      type="button"
      disabled
      className="relative flex w-full items-start gap-3 border-2 border-black/30 bg-white p-3 text-left transition-colors hover:border-black hover:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)] active:border-black active:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]"
    >
      <div
        role="checkbox"
        aria-checked="false"
        aria-disabled="true"
        tabIndex={-1}
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 border-black bg-white"
      />
      <div className="min-w-0 flex-1">
        {row.kind === "thread" ? (
          <div className="mb-0.5 min-w-0 text-[11px] font-bold leading-3 text-black/45">
            {row.channel}
          </div>
        ) : null}
        <div className="mb-0.5 flex min-w-0 items-start gap-2">
          <div
            className={`line-clamp-2 min-w-0 flex-1 text-sm leading-5 ${
              row.unread > 0 ? "font-bold text-black" : "font-semibold text-black/55"
            }`}
          >
            <span className="mr-1.5 inline-block align-[-2px] text-black/45" aria-hidden>
              <Icon size={13} />
            </span>
            {row.title}
          </div>
          <span className="shrink-0 font-mono text-xs leading-5 text-black/40">{row.time}</span>
        </div>
        <p
          className={`line-clamp-2 text-xs leading-4 ${
            row.unread > 0 ? "text-black" : "text-black/55"
          }`}
        >
          <span className="font-bold text-black/70">{row.sender}: </span>
          {row.body}
        </p>
        <div className="mt-1 flex min-h-5 flex-wrap items-center gap-1.5">
          {"replies" in row ? (
            <Badge appearance="outline" variant="muted" uppercase={false}>
              {row.replies} replies
            </Badge>
          ) : null}
          {row.mention && row.unread > 0 ? (
            <Badge variant="primary" uppercase={false}>
              <AtSign size={10} />
              Mention
            </Badge>
          ) : null}
          {row.unread > 0 ? (
            <Badge variant="accent" uppercase={false}>
              {row.unread} new
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <div
          role="button"
          aria-disabled="true"
          tabIndex={-1}
          className="btn-brutal-sm shrink-0 bg-white p-1.5"
          aria-label="Save activity item"
        >
          <Bookmark size={14} />
        </div>
        <div
          role="button"
          aria-disabled="true"
          tabIndex={-1}
          className="btn-brutal-sm shrink-0 bg-white p-1.5"
          aria-label="Mark as done"
        >
          <Check size={14} />
        </div>
      </div>
    </button>
  );
}
