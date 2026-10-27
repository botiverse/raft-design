import { useId, useState } from "react";
import { Hash, Search } from "lucide-react";
import {
  Combobox,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  Text,
} from "@botiverse/raft-ui";

const conversations = ["#launch-week", "#design", "#dev", "#growth", "#support"];

export function ComboboxInlineListContent() {
  const labelId = useId();
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div className="flex w-72 flex-col gap-2">
      <Combobox inline open items={conversations} value={chosen} onValueChange={setChosen}>
        <ComboboxControl>
          <Search aria-hidden />
          <ComboboxInput aria-label="Search conversations" placeholder="Search conversations" />
        </ComboboxControl>
        <Text.Sans size="group" id={labelId} className="px-1">
          Recent
        </Text.Sans>
        <ComboboxList aria-labelledby={labelId}>
          {(conversation: string) => (
            <ComboboxItem key={conversation} value={conversation}>
              <span className="flex min-w-0 items-center gap-1.5">
                <Hash aria-hidden className="text-foreground-muted" />
                <span className="truncate">{conversation.slice(1)}</span>
              </span>
              <ComboboxItemIndicator />
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No conversation matches</ComboboxEmpty>
      </Combobox>
      <p role="status" className="px-1 text-callout text-foreground-muted">
        {chosen ? `Sending to ${chosen}` : "Choose a conversation"}
      </p>
    </div>
  );
}
