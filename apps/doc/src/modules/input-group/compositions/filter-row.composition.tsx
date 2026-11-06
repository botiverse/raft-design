import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { ArrowDownUp, ChevronDown, FileText, LayoutGrid, List, Search, X } from "lucide-react";
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  PickerTriggerButton,
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
} from "@botiverse/raft-ui";

const TYPES = [
  { value: "all", label: "All types" },
  { value: "documents", label: "Documents" },
  { value: "pages", label: "Pages" },
  { value: "charts", label: "Charts" },
] as const;

const SORTS = [
  { value: "updated", label: "Last updated" },
  { value: "created", label: "Date created" },
  { value: "name", label: "Name" },
] as const;

export function InputGroupFilterRowComposition() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<string>("updated");
  const [view, setView] = useState("grid");
  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    [],
  );
  const handleClear = useCallback(() => setQuery(""), []);
  const handleTypeChange = useCallback((value: string | null) => setType(value ?? "all"), []);
  const handleSortChange = useCallback((value: string | null) => setSort(value ?? "updated"), []);
  const handleViewChange = useCallback((value: string) => setView(value), []);

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <InputGroup size="md" className="w-auto min-w-48 flex-1">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search artifacts"
          placeholder="Search artifacts"
          value={query}
          onChange={handleQueryChange}
        />
        <InputGroupAddon align="inline-end">
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label="Clear search"
              onClick={handleClear}
            >
              <X aria-hidden />
            </Button>
          ) : null}
        </InputGroupAddon>
      </InputGroup>
      <Select value={type} onValueChange={handleTypeChange} items={TYPES} modal={false}>
        <SelectTrigger
          aria-label={`Type: ${TYPES.find((option) => option.value === type)?.label}`}
          render={<PickerTriggerButton data-has-value={type === "all" ? undefined : ""} />}
        >
          <FileText aria-hidden className="size-3.5" />
          <SelectValue />
          <SelectIcon>
            <ChevronDown aria-hidden className="size-3" />
          </SelectIcon>
        </SelectTrigger>
        <SelectContent className="w-[180px]">
          <SelectList>
            {TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={handleSortChange} items={SORTS} modal={false}>
        <SelectTrigger
          aria-label={`Sort: ${SORTS.find((option) => option.value === sort)?.label}`}
          render={<PickerTriggerButton />}
        >
          <ArrowDownUp aria-hidden className="size-3.5" />
          <SelectValue />
          <SelectIcon>
            <ChevronDown aria-hidden className="size-3" />
          </SelectIcon>
        </SelectTrigger>
        <SelectContent className="w-[180px]">
          <SelectList>
            {SORTS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
      <SegmentedControl aria-label="View" value={view} onValueChange={handleViewChange}>
        <SegmentedControlItem value="grid">
          <LayoutGrid />
          <SegmentedControlLabel>Grid</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="list">
          <List />
          <SegmentedControlLabel>List</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
