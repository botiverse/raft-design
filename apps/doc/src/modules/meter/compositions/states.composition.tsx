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
      <Meter used={20} size="sm" valueText="80% left · resets in 3h">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue />
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter used={75} size="sm" valueText="25% left · resets in 3h">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue />
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter used={92} size="sm" valueText="8% left · resets in 3h">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue />
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter used={100} size="sm" valueText="Used up · resets in 3h">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue />
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  );
}
