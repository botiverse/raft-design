import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@botiverse/raft-ui";
import { TableSortableHead } from "@botiverse/raft-ui/wip";
import type { TableSort } from "@botiverse/raft-ui/wip";

type Resource = {
  id: string;
  name: string;
  runs: number | null;
  lastRun: string | null;
};

type Column = "name" | "runs" | "lastRun";

const RESOURCES: Resource[] = [
  { id: "nightly-build", name: "Nightly build", runs: 412, lastRun: "2026-11-02" },
  { id: "link-check", name: "Link check", runs: 1204, lastRun: "2026-11-03" },
  { id: "release-notes", name: "Release notes", runs: null, lastRun: null },
  { id: "docs-deploy", name: "Docs deploy", runs: 87, lastRun: "2026-10-30" },
];

const DAY = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });

// One column at a time; rows with the same value keep their order, and a row
// with no value goes last in both directions.
function sortRows(rows: Resource[], column: Column, sort: TableSort) {
  return [...rows].sort((a, b) => {
    const x = a[column];
    const y = b[column];
    if (x === null || y === null) return Number(x === null) - Number(y === null);
    const order =
      typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return sort === "ascending" ? order : -order;
  });
}

export function TableSortableContent() {
  const [column, setColumn] = useState<Column>("runs");
  const [sort, setSort] = useState<TableSort>("descending");
  const rows = sortRows(RESOURCES, column, sort);

  function sortBy(next: Column) {
    return (nextSort: TableSort) => {
      setColumn(next);
      setSort(nextSort);
    };
  }

  return (
    <Table className="max-w-lg">
      <TableCaption>Scheduled runs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableSortableHead
            sort={column === "name" ? sort : undefined}
            onSortChange={sortBy("name")}
          >
            Resource
          </TableSortableHead>
          <TableSortableHead
            align="right"
            firstSort="descending"
            sort={column === "runs" ? sort : undefined}
            onSortChange={sortBy("runs")}
          >
            Runs
          </TableSortableHead>
          <TableSortableHead
            firstSort="descending"
            sort={column === "lastRun" ? sort : undefined}
            onSortChange={sortBy("lastRun")}
          >
            Last run
          </TableSortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell align="right" className="font-mono">
              {row.runs ?? "—"}
            </TableCell>
            <TableCell className="font-mono">
              {row.lastRun ? DAY.format(new Date(row.lastRun)) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
