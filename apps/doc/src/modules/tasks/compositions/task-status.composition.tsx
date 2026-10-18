import {
  TaskChip,
  TaskStatusBadge,
  TaskStatusIcon,
  Timeline,
  TimelineItem,
  TimelineTitle,
} from "raft-ui";
import type { TaskStatusId } from "raft-ui";

/**
 * The task-status contract, laid out as one table: five states (rows) × four
 * parts (columns) — the bare icon, the badge, the chip, and the Timeline dot —
 * so a reviewer can see that every part of one status resolves to the same
 * colour family.
 *
 * This is the surface the before/after comparison is captured from.
 */

const STATUS_LABEL: Record<string, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
  closed: "Closed",
};

const TASK_STATUS_IDS: readonly TaskStatusId[] = [
  "todo",
  "in-progress",
  "in-review",
  "done",
  "closed",
];

function Part({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-12 items-center">{children}</div>;
}

export function TaskStatusComposition() {
  return (
    <div className="overflow-x-auto border-t border-l border-line-muted">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-layer-panel">
            {["Status", "Icon", "Badge", "Chip", "Timeline dot"].map((heading) => (
              <th
                key={heading}
                className="border-r border-b border-line-muted px-4 py-2 text-left font-heading font-bold"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TASK_STATUS_IDS.map((status) => (
            <tr key={status}>
              <td className="border-r border-b border-line-muted px-4 py-3 font-mono text-xs">
                {status}
              </td>
              <td className="border-r border-b border-line-muted px-4">
                <Part>
                  <TaskStatusIcon status={status} className="size-[18px]" />
                </Part>
              </td>
              <td className="border-r border-b border-line-muted px-4">
                <Part>
                  <TaskStatusBadge status={status}>{STATUS_LABEL[status]}</TaskStatusBadge>
                </Part>
              </td>
              <td className="border-r border-b border-line-muted px-4">
                <Part>
                  <TaskChip status={status}>
                    <TaskStatusIcon status={status} />
                    <span>#42</span>
                  </TaskChip>
                </Part>
              </td>
              <td className="border-r border-b border-line-muted px-4">
                <Part>
                  <Timeline>
                    <TimelineItem taskStatus={status} lineType="dashed">
                      <TimelineTitle>{STATUS_LABEL[status]}</TimelineTitle>
                    </TimelineItem>
                  </Timeline>
                </Part>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
