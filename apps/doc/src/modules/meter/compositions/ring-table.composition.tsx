import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@botiverse/raft-ui";
import { Meter, MeterRing, MeterValue } from "@botiverse/raft-ui/wip";
import { Bot, Sparkles, Terminal } from "lucide-react";

export function MeterRingTableContent() {
  return (
    <div className="w-full max-w-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Computer</TableHead>
            <TableHead>Weekly limits left</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="h-12">
            <TableCell className="align-middle">build-mac-01</TableCell>
            <TableCell className="align-middle">
              <div className="flex items-center gap-4">
                <Meter used={37} aria-label="Claude Code weekly limit" valueText="63% left">
                  <MeterRing>
                    <Bot aria-hidden />
                  </MeterRing>
                  <MeterValue />
                </Meter>
                <Meter used={88} aria-label="Codex weekly limit" valueText="12% left">
                  <MeterRing>
                    <Terminal aria-hidden />
                  </MeterRing>
                  <MeterValue />
                </Meter>
                <Meter used={100} aria-label="Gemini weekly limit" valueText="Used up">
                  <MeterRing>
                    <Sparkles aria-hidden />
                  </MeterRing>
                  <MeterValue />
                </Meter>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="h-12">
            <TableCell className="align-middle">linux-runner</TableCell>
            <TableCell className="align-middle">
              <div className="flex items-center gap-4">
                <Meter used={4} aria-label="Claude Code weekly limit" valueText="96% left">
                  <MeterRing>
                    <Bot aria-hidden />
                  </MeterRing>
                  <MeterValue />
                </Meter>
                <Meter used={51} aria-label="Codex weekly limit" valueText="49% left">
                  <MeterRing>
                    <Terminal aria-hidden />
                  </MeterRing>
                  <MeterValue />
                </Meter>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
