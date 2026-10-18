import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import { Activity, Bookmark, Search } from "lucide-react";
import { Badge, ListRow, ListRowBody, ListRowIcon, ListRowMeta, ListRowTitle } from "raft-ui";

export function ListRowEntriesComposition() {
  const [open, setOpen] = useState("activity");
  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setOpen(event.currentTarget.value);
  }, []);

  return (
    <div className="w-full max-w-sm">
      <ListRow
        variant="entry"
        value="search"
        selected={open === "search"}
        aria-current={open === "search"}
        onClick={handleOpen}
      >
        <ListRowIcon>
          <Search />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle>Search</ListRowTitle>
        </ListRowBody>
      </ListRow>
      <ListRow
        variant="entry"
        value="activity"
        selected={open === "activity"}
        aria-current={open === "activity"}
        onClick={handleOpen}
      >
        <ListRowIcon>
          <Activity />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle>Activity</ListRowTitle>
        </ListRowBody>
        <Badge variant="accent" role="img" aria-label="3 new">
          3
        </Badge>
      </ListRow>
      <ListRow
        variant="entry"
        value="saved"
        selected={open === "saved"}
        aria-current={open === "saved"}
        onClick={handleOpen}
      >
        <ListRowIcon>
          <Bookmark />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle>Saved</ListRowTitle>
        </ListRowBody>
        <ListRowMeta>4</ListRowMeta>
      </ListRow>
    </div>
  );
}
