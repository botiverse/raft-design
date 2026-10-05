import { CheckSquare, Home, Settings, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { MobileNavItem, MobileNavLabel, MobileNavRoot } from "raft-ui";

export function MobileNavComposition() {
  const [selected, setSelected] = useState("home");

  const handleHomeClick = useCallback(() => setSelected("home"), []);
  const handleTasksClick = useCallback(() => setSelected("tasks"), []);
  const handleMembersClick = useCallback(() => setSelected("members"), []);
  const handleSettingsClick = useCallback(() => setSelected("settings"), []);

  return (
    <MobileNavRoot aria-label="Primary navigation">
      <MobileNavItem selected={selected === "home"} onClick={handleHomeClick} aria-label="Home">
        <Home />
        <MobileNavLabel>Home</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem selected={selected === "tasks"} onClick={handleTasksClick} aria-label="Tasks">
        <CheckSquare />
        <MobileNavLabel>Tasks</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={selected === "members"}
        onClick={handleMembersClick}
        aria-label="Members"
      >
        <Users />
        <MobileNavLabel>Members</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={selected === "settings"}
        onClick={handleSettingsClick}
        aria-label="Settings"
      >
        <Settings />
        <MobileNavLabel>Settings</MobileNavLabel>
      </MobileNavItem>
    </MobileNavRoot>
  );
}
