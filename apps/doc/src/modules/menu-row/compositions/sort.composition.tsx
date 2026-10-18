import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronDown, Clock } from "lucide-react";
import {
  Button,
  MenuRow,
  MenuRowCheck,
  MenuRowLabel,
  MenuRowList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "raft-ui";

const LABELS = {
  activity: "Recent Activity",
  newest: "Newest First",
  oldest: "Oldest First",
} as const;

type Sort = keyof typeof LABELS;

export function MenuRowSortComposition() {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<Sort>("activity");
  const handleChoose = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setSort(event.currentTarget.value as Sort);
    setOpen(false);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>
        {LABELS[sort]}
        <ChevronDown data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent>
        <MenuRowList>
          <MenuRow value="activity" aria-current={sort === "activity"} onClick={handleChoose}>
            <Clock />
            <MenuRowLabel>Recent Activity</MenuRowLabel>
            {sort === "activity" ? <MenuRowCheck /> : null}
          </MenuRow>
          <MenuRow value="newest" aria-current={sort === "newest"} onClick={handleChoose}>
            <ArrowDownWideNarrow />
            <MenuRowLabel>Newest First</MenuRowLabel>
            {sort === "newest" ? <MenuRowCheck /> : null}
          </MenuRow>
          <MenuRow value="oldest" aria-current={sort === "oldest"} onClick={handleChoose}>
            <ArrowUpNarrowWide />
            <MenuRowLabel>Oldest First</MenuRowLabel>
            {sort === "oldest" ? <MenuRowCheck /> : null}
          </MenuRow>
        </MenuRowList>
      </PopoverContent>
    </Popover>
  );
}
