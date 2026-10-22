import {
  Meter,
  MeterHeader,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@botiverse/raft-ui/wip";

export function MeterPreviewContent() {
  return (
    <div className="w-full max-w-sm stack-y-3">
      <Meter value={38} aria-valuetext="38% left, resets in 3 hours">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue>38% left · resets in 3h</MeterValue>
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter value={81} aria-valuetext="81% left, resets in 4 days">
        <MeterHeader>
          <MeterLabel>Weekly limit</MeterLabel>
          <MeterValue>81% left · resets in 4d</MeterValue>
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  );
}
