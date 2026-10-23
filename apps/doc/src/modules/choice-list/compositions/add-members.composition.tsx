import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, Button } from "@botiverse/raft-ui";
import { ChoiceList } from "@botiverse/raft-ui/wip";
import type { ChoiceListItem } from "@botiverse/raft-ui/wip";

const PEOPLE = [
  { value: "ada", name: "Ada Park", handle: "ada", type: "human" },
  { value: "kirby", name: "Kirby", handle: "kirby", type: "agent" },
  { value: "mai", name: "Mai Tanaka", handle: "mai", type: "human" },
  { value: "noel", name: "Noel", handle: "noel", type: "agent" },
  { value: "ravi", name: "Ravi Shah", handle: "ravi", type: "human" },
] as const;

const GROUPS = [
  { value: "agent", label: "Agents" },
  { value: "human", label: "People" },
];

function personItem(person: {
  value: string;
  name: string;
  handle: string;
  type: "agent" | "human";
}): ChoiceListItem {
  return {
    value: person.value,
    label: person.name,
    searchText: `${person.name} @${person.handle}`,
    media: <Avatar size="xs" type={person.type} />,
    group: person.type,
  };
}

export function ChoiceListAddMembersComposition() {
  const [items, setItems] = useState<ChoiceListItem[]>(() => PEOPLE.map(personItem));
  const [members, setMembers] = useState<string[]>(["kirby"]);
  const [query, setQuery] = useState("");
  const name = query.trim();

  const createAgent = useCallback(() => {
    const value = `new-${items.length}`;
    setItems([
      ...items,
      personItem({ value, name: name || "New agent", handle: value, type: "agent" }),
    ]);
    setMembers([...members, value]);
    setQuery("");
  }, [items, members, name]);

  return (
    <div className="w-88 max-w-full">
      <ChoiceList
        multiple
        search="always"
        aria-label="People to add"
        searchLabel="Search people"
        searchPlaceholder="Search by name or @handle"
        clearSearchLabel="Clear search"
        noMatchLabel={`No one matches “${name}”`}
        searchValue={query}
        onSearchValueChange={setQuery}
        groups={GROUPS}
        items={items}
        value={members}
        onValueChange={setMembers}
        footer={
          <div className="p-1">
            <Button variant="ghost" className="w-full justify-start" onClick={createAgent}>
              <Plus aria-hidden />
              {name ? `Create an agent named “${name}”` : "Create an agent"}
            </Button>
          </div>
        }
      />
    </div>
  );
}
