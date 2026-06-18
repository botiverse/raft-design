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

type Identity = {
  id: string;
  label: string;
  tone?: "sentinel";
};

const identities: readonly Identity[] = [
  { id: "me", label: "Assigned to me", tone: "sentinel" },
  { id: "unassigned", label: "Unassigned", tone: "sentinel" },
  { id: "atlas", label: "Atlas" },
];

export function TasksIdentityFilterComposition() {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <Combobox<Identity>
        open
        autoHighlight
        defaultValue={identities[2]}
        items={identities}
        itemToStringLabel={(identity) => identity.label}
      >
        <ComboboxPopup className="w-[220px]">
          <div className="flex items-center justify-between border-b border-line-muted px-3 py-2 [[data-theme=brutal]_&]:border-black">
            <ComboboxLabel>Assignee</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </div>
          <ComboboxInputGroup>
            <ComboboxInput aria-label="Search assignees" suppressPasswordManager />
          </ComboboxInputGroup>
          <ComboboxList>
            {(identity: Identity) => (
              <ComboboxItem key={identity.id} value={identity}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    {identity.tone === "sentinel" ? null : <Avatar size="4xs" type="human" />}
                  </span>
                  <span
                    className={
                      identity.tone === "sentinel"
                        ? "truncate leading-6 italic text-foreground-muted [[data-theme=brutal]_&]:text-black/70"
                        : "truncate leading-6"
                    }
                  >
                    {identity.label}
                  </span>
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
