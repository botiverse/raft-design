import { ArrowDownUp, ChevronDown } from "lucide-react";
import {
  PickerTriggerButton,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "raft-ui";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Most recent" },
  { value: "comments", label: "Most commented" },
] as const;

export function PickerTriggerButtonSelectFilterComposition() {
  return (
    <Select defaultValue="relevance" items={SORT_OPTIONS} modal={false}>
      <SelectTrigger render={<PickerTriggerButton />}>
        <ArrowDownUp aria-hidden className="size-3.5" />
        <SelectValue />
        <SelectIcon>
          <ChevronDown aria-hidden className="size-3" />
        </SelectIcon>
      </SelectTrigger>
      <SelectContent className="w-[180px]">
        <SelectList>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
