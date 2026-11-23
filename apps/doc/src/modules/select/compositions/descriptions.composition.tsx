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
  helperText,
} from "@botiverse/raft-ui";

// Only an option whose choice has a consequence its name doesn't say gets a line.
const MODELS = [
  {
    value: "opus",
    label: "Claude Opus 5.5",
    description: helperText("Uses 5× the credits of Sonnet", {
      why: "consequence",
      about: "credits",
    }),
  },
  { value: "sonnet", label: "Claude Sonnet 5.5", description: null },
  {
    value: "haiku",
    label: "Claude Haiku 5.5",
    description: helperText("Can't read attached images", {
      why: "consequence",
      about: "attachment",
    }),
  },
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
                {model.description ? (
                  <SelectItemDescription>{model.description}</SelectItemDescription>
                ) : null}
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}
