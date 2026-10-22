import {
  Meter,
  MeterHeader,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@botiverse/raft-ui/wip";

export function MeterStatesContent() {
  return (
    <div className="w-full max-w-sm stack-y-4">
      <Meter value={80} size="sm" aria-valuetext="80% left, resets in 3 hours">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue>80% left · resets in 3h</MeterValue>
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter value={25} size="sm" aria-valuetext="25% left, resets in 3 hours">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue>25% left · resets in 3h</MeterValue>
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter value={8} size="sm" aria-valuetext="8% left, resets in 3 hours">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue>8% left · resets in 3h</MeterValue>
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter value={0} size="sm" aria-valuetext="Used up, resets in 3 hours">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue>Used up · resets in 3h</MeterValue>
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  );
}
