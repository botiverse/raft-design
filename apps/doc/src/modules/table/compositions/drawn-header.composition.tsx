import { useState } from "react";
import { TableSortButton } from "@botiverse/raft-ui/wip";
import type { TableSort } from "@botiverse/raft-ui/wip";

type Computer = {
  id: string;
  name: string;
  memory: number | null;
  lastSeen: string;
};

type Column = "name" | "memory" | "lastSeen";

const COMPUTERS: Computer[] = [
  { id: "mac-mini", name: "mac-mini", memory: 11.4, lastSeen: "2026-11-03" },
  { id: "build-box", name: "build-box", memory: 27.9, lastSeen: "2026-11-03" },
  { id: "studio", name: "studio", memory: null, lastSeen: "2026-10-28" },
  { id: "air", name: "air", memory: 6.2, lastSeen: "2026-11-01" },
];

const DAY = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

// One column at a time; rows with the same value keep their order, and a row
// with no value goes last in both directions.
function sortRows(rows: Computer[], column: Column, sort: TableSort) {
  return [...rows].sort((a, b) => {
    const x = a[column];
    const y = b[column];
    if (x === null || y === null) return Number(x === null) - Number(y === null);
    const order =
      typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return sort === "ascending" ? order : -order;
  });
}

export function TableDrawnHeaderContent() {
  const [column, setColumn] = useState<Column>("memory");
  const [sort, setSort] = useState<TableSort>("descending");
  const rows = sortRows(COMPUTERS, column, sort);
  const sortOf = (name: Column) => (column === name ? sort : undefined);

  function sortBy(next: Column) {
    return (nextSort: TableSort) => {
      setColumn(next);
      setSort(nextSort);
    };
  }

  return (
    <div role="table" aria-label="Computers" className="w-full max-w-lg">
      <div
        role="row"
        className="grid h-7 grid-cols-[minmax(0,1fr)_7rem_7rem] border-b border-line-hairline font-mono text-mono-meta"
      >
        <div role="columnheader" aria-sort={sortOf("name")}>
          <TableSortButton className="px-2" sort={sortOf("name")} onSortChange={sortBy("name")}>
            Computer
          </TableSortButton>
        </div>
        <div role="columnheader" aria-sort={sortOf("memory")}>
          <TableSortButton
            className="px-2"
            align="right"
            firstSort="descending"
            sort={sortOf("memory")}
            onSortChange={sortBy("memory")}
          >
            Memory
          </TableSortButton>
        </div>
        <div role="columnheader" aria-sort={sortOf("lastSeen")}>
          <TableSortButton
            className="px-2"
            firstSort="descending"
            sort={sortOf("lastSeen")}
            onSortChange={sortBy("lastSeen")}
          >
            Last seen
          </TableSortButton>
        </div>
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          role="row"
          className="grid h-8 grid-cols-[minmax(0,1fr)_7rem_7rem] items-center text-callout"
        >
          <div role="cell" className="truncate px-2">
            {row.name}
          </div>
          <div role="cell" className="px-2 text-right font-mono">
            {row.memory === null ? "—" : `${row.memory.toFixed(1)} GB`}
          </div>
          <div role="cell" className="px-2 font-mono">
            {DAY.format(new Date(row.lastSeen))}
          </div>
        </div>
      ))}
    </div>
  );
}
