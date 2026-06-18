import { Hash } from "lucide-react";
import {
  Combobox,
  ComboboxClear,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxPopup,
} from "@slock/ui";

type Channel = {
  id: string;
  label: string;
};

const channels: readonly Channel[] = [
  { id: "design", label: "#design" },
  { id: "dev", label: "#dev" },
];

export function TasksChannelFilterComposition() {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <Combobox<Channel, true>
        open
        multiple
        autoHighlight
        inputValue="des"
        defaultValue={[channels[0]]}
        items={channels}
        itemToStringLabel={(channel) => channel.label}
      >
        <ComboboxPopup className="w-[220px]">
          <div className="flex items-center justify-between border-b border-line-muted px-3 py-2 [[data-theme=brutal]_&]:border-black">
            <ComboboxLabel>Channels</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </div>
          <ComboboxInputGroup>
            <ComboboxInput aria-label="Search task channels" suppressPasswordManager />
          </ComboboxInputGroup>
          <ComboboxList>
            {(channel: Channel) => (
              <ComboboxItem key={channel.id} value={channel}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <Hash
                      size={12}
                      className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50"
                    />
                  </span>
                  <span className="truncate leading-6">{channel.label}</span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  );
}
