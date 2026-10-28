import { useCallback, useState } from "react";
import {
  Select,
  SelectActionItem,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@botiverse/raft-ui";

const ITEMS = [
  { value: "claude-code", label: "Claude Code" },
  { value: "codex", label: "Codex" },
  { value: "gemini-cli", label: "Gemini CLI" },
  { value: "kimi-cli", label: "Kimi CLI" },
];

export function SelectListActionContent() {
  const [value, setValue] = useState<string | null>("claude-code");
  const [showAll, setShowAll] = useState(false);
  const showAllRuntimes = useCallback(() => setShowAll(true), []);

  return (
    <div className="w-80">
      <Select items={ITEMS} value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Runtime">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            <SelectItem value="claude-code">
              <SelectItemText>Claude Code</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="codex">
              <SelectItemText>Codex</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
            {showAll && (
              <>
                <SelectItem value="gemini-cli">
                  <SelectItemText>Gemini CLI</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
                <SelectItem value="kimi-cli">
                  <SelectItemText>Kimi CLI</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              </>
            )}
            {!showAll && (
              <>
                <SelectSeparator />
                <SelectActionItem onAction={showAllRuntimes}>Show All Runtimes</SelectActionItem>
              </>
            )}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}
