import { useState } from "react";
import { CheckCircle2, Circle, Mail, User } from "lucide-react";
import { FilterChip, FilterChipCount } from "raft-ui/wip";

export function FilterChipComposition() {
  const [unread, setUnread] = useState(true);
  const [mine, setMine] = useState(false);
  const [status, setStatus] = useState<"open" | "resolved" | null>(null);

  return (
    <div role="group" aria-label="Filter topics" className="flex flex-wrap items-center gap-2">
      <FilterChip pressed={unread} onPressedChange={setUnread}>
        <Mail aria-hidden />
        Unread
        <FilterChipCount>4</FilterChipCount>
      </FilterChip>
      <FilterChip
        pressed={status === "open"}
        onPressedChange={(pressed) => setStatus(pressed ? "open" : null)}
      >
        <Circle aria-hidden />
        Open
        <FilterChipCount>9</FilterChipCount>
      </FilterChip>
      <FilterChip
        pressed={status === "resolved"}
        onPressedChange={(pressed) => setStatus(pressed ? "resolved" : null)}
      >
        <CheckCircle2 aria-hidden />
        Resolved
        <FilterChipCount>3</FilterChipCount>
      </FilterChip>
      <FilterChip pressed={mine} onPressedChange={setMine}>
        <User aria-hidden />
        My topics
      </FilterChip>
      <FilterChip disabled>Archived</FilterChip>
    </div>
  );
}
