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

const MODELS = [
  { value: "opus", label: "Claude Opus 5.5", description: "Best for long, careful work" },
  { value: "sonnet", label: "Claude Sonnet 5.5", description: "Fast and capable for most tasks" },
  { value: "haiku", label: "Claude Haiku 5.5", description: "Quickest, for short replies" },
] as const;

const ITEMS = MODELS.map(({ value, label }) => ({ value, label }));

export function SelectDescriptionsContent() {
  const [value, setValue] = useState<string | null>("sonnet");

  return (
    <div className="w-80">
      <Select items={ITEMS} value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Model">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            {MODELS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                <SelectItemText>{model.label}</SelectItemText>
                <SelectItemDescription>{model.description}</SelectItemDescription>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}
