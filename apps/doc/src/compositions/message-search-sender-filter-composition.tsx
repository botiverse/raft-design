import {
  Avatar,
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

type Sender = {
  id: string;
  label: string;
};

const senders: readonly Sender[] = [
  { id: "me", label: "Me" },
  { id: "atlas", label: "Atlas" },
];

export function MessageSearchSenderFilterComposition() {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <Combobox<Sender>
        open
        autoHighlight
        inputValue="at"
        defaultValue={senders[0]}
        items={senders}
        itemToStringLabel={(sender) => sender.label}
      >
        <ComboboxPopup className="w-[220px]">
          <div className="flex items-center justify-between border-b border-line-muted px-3 py-2 [[data-theme=brutal]_&]:border-black">
            <ComboboxLabel>From</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </div>
          <ComboboxInputGroup>
            <ComboboxInput aria-label="Search senders" suppressPasswordManager />
          </ComboboxInputGroup>
          <ComboboxList>
            {(sender: Sender) => (
              <ComboboxItem key={sender.id} value={sender}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <Avatar size="4xs" type="human" />
                  </span>
                  <span className="truncate leading-6">{sender.label}</span>
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
