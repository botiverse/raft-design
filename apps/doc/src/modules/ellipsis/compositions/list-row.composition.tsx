import { FileText } from "lucide-react";
import { Ellipsis } from "@botiverse/raft-ui/wip";

const FILES = [
  { name: "notes.md", size: "2 KB" },
  { name: "launch-week-announcement-final-draft-with-legal-review.pdf", size: "1.4 MB" },
  { name: "Q4 roadmap.key", size: "18 MB" },
  { name: "screenshot-2026-10-21-at-17.42.08-sidebar-collapsed-dark.png", size: "640 KB" },
];

export function EllipsisListRowContent() {
  return (
    <ul className="m-0 w-full max-w-xs list-none rounded-container border border-line-hairline p-1">
      {FILES.map((file) => (
        <li key={file.name} className="flex min-w-0 items-center gap-2 px-2 py-1.5 text-callout">
          <FileText aria-hidden className="size-4 shrink-0 text-foreground-hint" />
          <Ellipsis className="flex-1" expandOnClick>
            {file.name}
          </Ellipsis>
          <span className="shrink-0 font-mono text-mono-meta text-foreground-hint">
            {file.size}
          </span>
        </li>
      ))}
    </ul>
  );
}
