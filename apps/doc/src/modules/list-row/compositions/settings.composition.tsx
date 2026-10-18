import { useCallback, useState } from "react";
import { Bell, Moon } from "lucide-react";
import {
  ListRow,
  ListRowBody,
  ListRowChevron,
  ListRowDescription,
  ListRowGroup,
  ListRowIcon,
  ListRowTitle,
  ListRowValue,
  Switch,
} from "raft-ui";

const APPEARANCES = ["System", "Light", "Dark"] as const;

export function ListRowSettingsComposition() {
  const [appearance, setAppearance] = useState(0);
  const [agentsMerge, setAgentsMerge] = useState(false);
  const handleAppearance = useCallback(() => {
    setAppearance((current) => (current + 1) % APPEARANCES.length);
  }, []);

  return (
    <ListRowGroup className="w-full max-w-sm">
      <ListRow variant="plain" onClick={handleAppearance}>
        <ListRowIcon>
          <Moon />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle>Appearance</ListRowTitle>
        </ListRowBody>
        <ListRowValue>{APPEARANCES[appearance]}</ListRowValue>
        <ListRowChevron />
      </ListRow>
      <ListRow variant="plain" interactive={false}>
        <ListRowIcon>
          <Bell />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle id="list-row-agents-merge">Agents can merge to main</ListRowTitle>
          <ListRowDescription wrap>Off: a person approves every merge.</ListRowDescription>
        </ListRowBody>
        <Switch
          checked={agentsMerge}
          onCheckedChange={setAgentsMerge}
          aria-labelledby="list-row-agents-merge"
        />
      </ListRow>
    </ListRowGroup>
  );
}
