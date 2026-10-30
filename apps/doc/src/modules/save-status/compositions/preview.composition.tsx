import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Field,
  FieldLabel,
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
import { SaveStatus, SaveStatusSaved } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const TIME_ZONES = [
  { value: "America/Los_Angeles", label: "UTC-07:00 Los Angeles" },
  { value: "Europe/London", label: "UTC+01:00 London" },
  { value: "Asia/Shanghai", label: "UTC+08:00 Shanghai" },
];

// Each change empties the line while it saves, so every "Saved" is announced,
// then shows "Saved" for two seconds once the (mock) request is done.
function useSaved() {
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const save = useCallback(() => {
    window.clearTimeout(timer.current);
    setSaved(false);
    timer.current = window.setTimeout(() => {
      setSaved(true);
      timer.current = window.setTimeout(() => setSaved(false), 2000);
    }, 300);
  }, []);
  return [saved, save] as const;
}

export function SaveStatusPreviewContent() {
  const [timeZone, setTimeZone] = useState<string | null>("Europe/London");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [muted, setMuted] = useState(false);
  const [timeZoneSaved, markTimeZoneSaved] = useSaved();
  const [timeFormatSaved, markTimeFormatSaved] = useSaved();
  const [mutedSaved, markMutedSaved] = useSaved();

  const handleTimeZone = useCallback(
    (value: string | null) => {
      setTimeZone(value);
      markTimeZoneSaved();
    },
    [markTimeZoneSaved],
  );
  const handleTimeFormat = useCallback(
    (value: string) => {
      setTimeFormat(value);
      markTimeFormatSaved();
    },
    [markTimeFormatSaved],
  );
  const handleMuted = useCallback(
    (checked: boolean) => {
      setMuted(checked);
      markMutedSaved();
    },
    [markMutedSaved],
  );

  return (
    <div className="grid w-full max-w-md gap-3">
      <Card>
        <CardContent className="grid gap-4">
          <Field>
            <FieldLabel>Time zone</FieldLabel>
            <Select items={TIME_ZONES} value={timeZone} onValueChange={handleTimeZone}>
              <SelectTrigger aria-describedby="time-zone-status">
                <SelectValue />
                <SelectIcon />
              </SelectTrigger>
              <SelectContent>
                <SelectList>
                  {TIME_ZONES.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      <SelectItemText>{zone.label}</SelectItemText>
                      <SelectItemIndicator />
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectContent>
            </Select>
            <SaveStatus id="time-zone-status">
              <SaveStatusSaved>{timeZoneSaved ? "Saved" : null}</SaveStatusSaved>
            </SaveStatus>
          </Field>

          <Field>
            <FieldLabel id="time-format-label">Time format</FieldLabel>
            <SegmentedControl
              aria-labelledby="time-format-label"
              aria-describedby="time-format-status"
              value={timeFormat}
              onValueChange={handleTimeFormat}
            >
              <SegmentedControlItem value="12h">
                <SegmentedControlLabel>12-hour</SegmentedControlLabel>
              </SegmentedControlItem>
              <SegmentedControlItem value="24h">
                <SegmentedControlLabel>24-hour</SegmentedControlLabel>
              </SegmentedControlItem>
            </SegmentedControl>
            <SaveStatus id="time-format-status">
              <SaveStatusSaved>{timeFormatSaved ? "Saved" : null}</SaveStatusSaved>
            </SaveStatus>
          </Field>
        </CardContent>
      </Card>

      <ListRowGroup>
        <ListRow variant="plain" interactive={false}>
          <ListRowBody>
            <ListRowTitle id="mute-server-title">Mute this server</ListRowTitle>
            <ListRowDescription id="mute-server-description" wrap>
              Stops notifications from this server on all your devices.
            </ListRowDescription>
            <SaveStatus id="mute-server-status">
              <SaveStatusSaved>{mutedSaved ? "Saved" : null}</SaveStatusSaved>
            </SaveStatus>
          </ListRowBody>
          <Switch
            checked={muted}
            onCheckedChange={handleMuted}
            aria-labelledby="mute-server-title"
            aria-describedby="mute-server-description mute-server-status"
          />
        </ListRow>
      </ListRowGroup>
    </div>
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
