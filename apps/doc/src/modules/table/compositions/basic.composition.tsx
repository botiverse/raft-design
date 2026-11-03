import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@botiverse/raft-ui";

export function TableBasicContent() {
  return (
    <Table className="max-w-lg">
      <TableCaption>Runs in October</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead align="right">Runs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Nightly build</TableCell>
          <TableCell>Atlas</TableCell>
          <TableCell align="right" className="font-mono">
            412
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Link check</TableCell>
          <TableCell>Kirby</TableCell>
          <TableCell align="right" className="font-mono">
            1204
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Docs deploy</TableCell>
          <TableCell>Atlas</TableCell>
          <TableCell align="right" className="font-mono">
            87
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
