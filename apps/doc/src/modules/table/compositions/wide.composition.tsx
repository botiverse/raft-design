import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@botiverse/raft-ui";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
];

const resources = [
  {
    name: "Nightly build",
    owner: "Atlas",
    runs: [388, 402, 395, 410, 407, 399, 421, 415, 408, 412],
  },
  {
    name: "Link check",
    owner: "Kirby",
    runs: [960, 1012, 1104, 1088, 1130, 1175, 1160, 1192, 1187, 1204],
  },
  { name: "Docs deploy", owner: "Atlas", runs: [41, 56, 62, 48, 73, 69, 80, 77, 91, 87] },
];

export function TableWideContent() {
  return (
    <TableScroll className="w-full" role="region" aria-label="Runs this year">
      <Table className="min-w-280">
        <TableCaption>Runs this year</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Owner</TableHead>
            {months.map((month) => (
              <TableHead key={month} align="right">
                {month}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.name}>
              <TableCell>{resource.name}</TableCell>
              <TableCell>{resource.owner}</TableCell>
              {resource.runs.map((runs, index) => (
                <TableCell key={months[index]} align="right" className="font-mono">
                  {runs}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  );
}
