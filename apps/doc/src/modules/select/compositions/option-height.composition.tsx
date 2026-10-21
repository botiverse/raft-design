import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemDescription,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@botiverse/raft-ui";

const LONG_NAME = "Claude Sonnet 5.5 with extended thinking and the 1M-token context window";

const ITEMS = [
  { value: "default", label: "Runtime default" },
  { value: "opus", label: "Claude Opus 5.5" },
  { value: "sonnet", label: "Claude Sonnet 5.5" },
  { value: "sonnet-long", label: LONG_NAME },
  { value: "haiku", label: "Claude Haiku 5.5" },
];

export function SelectOptionHeightContent() {
  const [value, setValue] = useState<string | null>("sonnet");

  return (
    <div className="w-72 max-w-full">
      <Select items={ITEMS} value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Model">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            <SelectItem value="default">
              <SelectItemText>Runtime default</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="opus">
              <SelectItemText>Claude Opus 5.5</SelectItemText>
              <SelectItemDescription>Best for long, careful work</SelectItemDescription>
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="sonnet">
              <SelectItemText>Claude Sonnet 5.5</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="sonnet-long">
              <SelectItemText>{LONG_NAME}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="haiku">
              <SelectItemText>Claude Haiku 5.5</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}
