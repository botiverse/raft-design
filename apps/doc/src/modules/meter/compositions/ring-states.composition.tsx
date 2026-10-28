import { Meter, MeterRing, MeterValue } from "@botiverse/raft-ui/wip";

export function MeterRingStatesContent() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Meter used={37} aria-label="Weekly limit" valueText="63% left">
        <MeterRing />
        <MeterValue />
      </Meter>
      <Meter used={85} aria-label="Weekly limit" valueText="15% left">
        <MeterRing />
        <MeterValue />
      </Meter>
      <Meter used={100} aria-label="Weekly limit" valueText="Used up">
        <MeterRing />
        <MeterValue />
      </Meter>
    </div>
  );
}
