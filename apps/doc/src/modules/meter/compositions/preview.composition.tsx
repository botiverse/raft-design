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
      <Meter used={62} valueText="62% used · resets in 3h">
        <MeterHeader>
          <MeterLabel>5-hour limit</MeterLabel>
          <MeterValue />
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Meter used={19} valueText="19% used · resets in 4d">
        <MeterHeader>
          <MeterLabel>Weekly limit</MeterLabel>
          <MeterValue />
        </MeterHeader>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  );
}
