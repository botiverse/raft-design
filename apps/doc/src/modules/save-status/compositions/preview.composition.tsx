import { useState } from "react";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowTitle,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@botiverse/raft-ui";
import { SaveStatus } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const WEEK_STARTS = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
  { value: "saturday", label: "Saturday" },
];

// Each change applies at once and nothing says "Saved": the control showing
// its new value is the confirmation. Each setting's SaveStatus stays empty,
// taking no room, unless its change fails (see the failed example).
export function SaveStatusPreviewContent() {
  const [weekStart, setWeekStart] = useState<string | null>("monday");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [muted, setMuted] = useState(false);

  return (
    <ListRowGroup className="@container w-full max-w-lg">
      <ListRow variant="plain" interactive={false} className="@max-lg:flex-wrap">
        <ListRowBody>
          <ListRowTitle id="week-start-title">Week starts on</ListRowTitle>
          <SaveStatus id="week-start-status" />
        </ListRowBody>
        <div className="shrink-0 @max-lg:basis-full">
          <Select items={WEEK_STARTS} value={weekStart} onValueChange={setWeekStart}>
            <SelectTrigger
              className="w-44"
              aria-labelledby="week-start-title"
              aria-describedby="week-start-status"
            >
              <SelectValue />
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <SelectList>
                {WEEK_STARTS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    <SelectItemText>{day.label}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectList>
            </SelectContent>
          </Select>
        </div>
      </ListRow>

      <ListRow variant="plain" interactive={false} className="@max-lg:flex-wrap">
        <ListRowBody>
          <ListRowTitle id="time-format-title">Time format</ListRowTitle>
          <SaveStatus id="time-format-status" />
        </ListRowBody>
        <div className="shrink-0 @max-lg:basis-full">
          <SegmentedControl
            aria-labelledby="time-format-title"
            aria-describedby="time-format-status"
            value={timeFormat}
            onValueChange={setTimeFormat}
          >
            <SegmentedControlItem value="24h">
              <SegmentedControlLabel>24-hour</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="12h">
              <SegmentedControlLabel>12-hour</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
      </ListRow>

      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="mute-server-title">Mute this server</ListRowTitle>
          <ListRowDescription id="mute-server-description" wrap>
            Stops notifications from this server on all your devices.
          </ListRowDescription>
          <SaveStatus id="mute-server-status" />
        </ListRowBody>
        <Switch
          checked={muted}
          onCheckedChange={setMuted}
          aria-labelledby="mute-server-title"
          aria-describedby="mute-server-description mute-server-status"
        />
      </ListRow>
    </ListRowGroup>
  );
}

// @docs-source-strip-start
export function SaveStatusPreviewComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <SaveStatusPreviewContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
