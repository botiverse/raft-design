import { useState } from "react";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowTitle,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@botiverse/raft-ui";

const REMINDERS = [
  { value: "never", label: "Never" },
  { value: "5m", label: "After 5 min away" },
  { value: "30m", label: "After 30 min away" },
  { value: "1h", label: "After an hour away" },
];

export function SelectFitContent() {
  const [reminder, setReminder] = useState<string | null>("never");

  return (
    <ListRowGroup className="@container w-full max-w-xl">
      <ListRow variant="plain" interactive={false} className="@max-lg:flex-wrap">
        <ListRowBody>
          <ListRowTitle id="reminder-title">Unread reminders</ListRowTitle>
          <ListRowDescription id="reminder-description" wrap>
            Sends you an email about messages that are still unread while you're away.
          </ListRowDescription>
        </ListRowBody>
        <div className="shrink-0 @max-lg:basis-full">
          <Select items={REMINDERS} value={reminder} onValueChange={setReminder}>
            <SelectTrigger
              fit
              aria-labelledby="reminder-title"
              aria-describedby="reminder-description"
            >
              <SelectValue />
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <SelectList>
                {REMINDERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <SelectItemText>{option.label}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectList>
            </SelectContent>
          </Select>
        </div>
      </ListRow>
    </ListRowGroup>
  );
}
