import { useState } from "react";
import { Avatar } from "@botiverse/raft-ui";
import { ChoiceList } from "@botiverse/raft-ui/wip";

const PEOPLE = [
  { value: "ada", name: "Ada Park", handle: "ada", type: "human" },
  { value: "kirby", name: "Kirby", handle: "kirby", type: "agent" },
  { value: "mai", name: "Mai Tanaka", handle: "mai", type: "human" },
  { value: "noel", name: "Noel", handle: "noel", type: "agent" },
  { value: "ravi", name: "Ravi Shah", handle: "ravi", type: "human" },
] as const;

const ITEMS = PEOPLE.map((person) => ({
  value: person.value,
  label: person.name,
  searchText: `${person.name} @${person.handle}`,
  media: <Avatar size="xs" type={person.type} />,
}));

export function ChoiceListAddMembersComposition() {
  const [members, setMembers] = useState<string[]>(["kirby"]);
  return (
    <div className="w-88 max-w-full">
      <ChoiceList
        multiple
        search="always"
        aria-label="People to add"
        searchLabel="Search people"
        searchPlaceholder="Search by name or @handle"
        clearSearchLabel="Clear search"
        noMatchLabel="No one matches"
        items={ITEMS}
        value={members}
        onValueChange={setMembers}
      />
    </div>
  );
}
