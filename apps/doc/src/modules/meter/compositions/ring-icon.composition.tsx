import { Meter, MeterRing, MeterValue } from "@botiverse/raft-ui/wip";
import { Bot } from "lucide-react";

export function MeterRingIconContent() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Meter used={37} aria-label="Claude Code weekly limit" valueText="63% left">
        <MeterRing size="sm" />
        <MeterValue />
      </Meter>
      <Meter used={37} aria-label="Claude Code weekly limit" valueText="63% left">
        <MeterRing>
          <Bot aria-hidden />
        </MeterRing>
        <MeterValue />
      </Meter>
      <Meter used={37} aria-label="Claude Code weekly limit" valueText="63% left">
        <MeterRing size="lg">
          <Bot aria-hidden />
        </MeterRing>
        <MeterValue />
      </Meter>
    </div>
  );
}
