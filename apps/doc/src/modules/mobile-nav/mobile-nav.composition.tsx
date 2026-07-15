import { CheckSquare, Home, Settings, Users } from "lucide-react";
import { useState } from "react";
import { MobileNavItem, MobileNavLabel, MobileNavRoot } from "raft-ui/wip";

export function MobileNavComposition() {
  const [selected, setSelected] = useState("home");

  return (
    <MobileNavRoot aria-label="Primary navigation">
      <MobileNavItem
        selected={selected === "home"}
        onClick={() => setSelected("home")}
        aria-label="Home"
      >
        <Home />
        <MobileNavLabel>Home</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={selected === "tasks"}
        onClick={() => setSelected("tasks")}
        aria-label="Tasks"
      >
        <CheckSquare />
        <MobileNavLabel>Tasks</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={selected === "members"}
        onClick={() => setSelected("members")}
        aria-label="Members"
      >
        <Users />
        <MobileNavLabel>Members</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={selected === "settings"}
        onClick={() => setSelected("settings")}
        aria-label="Settings"
      >
        <Settings />
        <MobileNavLabel>Settings</MobileNavLabel>
      </MobileNavItem>
    </MobileNavRoot>
  );
}
